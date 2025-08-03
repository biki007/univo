-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate unique meeting codes
CREATE OR REPLACE FUNCTION generate_meeting_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
    code_exists BOOLEAN := TRUE;
BEGIN
    WHILE code_exists LOOP
        result := '';
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM meetings WHERE meeting_code = result) INTO code_exists;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user online status
CREATE OR REPLACE FUNCTION update_user_online_status(user_id UUID, is_online BOOLEAN)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles 
    SET 
        is_online = update_user_online_status.is_online,
        last_seen = CASE 
            WHEN update_user_online_status.is_online THEN NULL 
            ELSE NOW() 
        END,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get meeting statistics
CREATE OR REPLACE FUNCTION get_meeting_stats(meeting_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_participants', COUNT(DISTINCT mp.user_id),
        'current_participants', COUNT(DISTINCT CASE WHEN mp.left_at IS NULL THEN mp.user_id END),
        'total_messages', (SELECT COUNT(*) FROM chat_messages WHERE chat_messages.meeting_id = get_meeting_stats.meeting_id),
        'duration_minutes', CASE 
            WHEN m.ended_at IS NOT NULL AND m.started_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (m.ended_at - m.started_at)) / 60
            WHEN m.started_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (NOW() - m.started_at)) / 60
            ELSE 0
        END,
        'is_recording', m.is_recording,
        'has_whiteboard', EXISTS(SELECT 1 FROM whiteboard_sessions WHERE whiteboard_sessions.meeting_id = get_meeting_stats.meeting_id AND is_active = true)
    ) INTO result
    FROM meetings m
    LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
    WHERE m.id = meeting_id
    GROUP BY m.id, m.started_at, m.ended_at, m.is_recording;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user analytics
CREATE OR REPLACE FUNCTION get_user_analytics(user_id UUID, days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_meetings_hosted', (
            SELECT COUNT(*) 
            FROM meetings 
            WHERE host_id = user_id 
            AND created_at >= NOW() - INTERVAL '1 day' * days_back
        ),
        'total_meetings_joined', (
            SELECT COUNT(DISTINCT meeting_id) 
            FROM meeting_participants 
            WHERE user_id = get_user_analytics.user_id 
            AND joined_at >= NOW() - INTERVAL '1 day' * days_back
        ),
        'total_meeting_time_minutes', (
            SELECT COALESCE(SUM(
                EXTRACT(EPOCH FROM (
                    COALESCE(left_at, NOW()) - joined_at
                )) / 60
            ), 0)
            FROM meeting_participants 
            WHERE user_id = get_user_analytics.user_id 
            AND joined_at >= NOW() - INTERVAL '1 day' * days_back
        ),
        'messages_sent', (
            SELECT COUNT(*) 
            FROM chat_messages 
            WHERE user_id = get_user_analytics.user_id 
            AND created_at >= NOW() - INTERVAL '1 day' * days_back
        ),
        'files_shared', (
            SELECT COUNT(*) 
            FROM file_uploads 
            WHERE user_id = get_user_analytics.user_id 
            AND created_at >= NOW() - INTERVAL '1 day' * days_back
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR (is_active = false AND last_activity < NOW() - INTERVAL '7 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end meeting and cleanup
CREATE OR REPLACE FUNCTION end_meeting(meeting_id UUID, ended_by UUID)
RETURNS VOID AS $$
BEGIN
    -- Update meeting status
    UPDATE meetings 
    SET 
        status = 'ended',
        ended_at = NOW(),
        updated_at = NOW()
    WHERE id = meeting_id AND status = 'active';
    
    -- Update all active participants
    UPDATE meeting_participants 
    SET left_at = NOW()
    WHERE meeting_id = end_meeting.meeting_id AND left_at IS NULL;
    
    -- Deactivate whiteboards
    UPDATE whiteboard_sessions 
    SET 
        is_active = false,
        updated_at = NOW()
    WHERE meeting_id = end_meeting.meeting_id AND is_active = true;
    
    -- Log analytics event
    INSERT INTO analytics_events (user_id, meeting_id, event_type, event_data)
    VALUES (ended_by, meeting_id, 'meeting_ended', json_build_object('ended_at', NOW()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whiteboard_sessions_updated_at BEFORE UPDATE ON whiteboard_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_recordings_updated_at BEFORE UPDATE ON meeting_recordings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-generate meeting codes
CREATE TRIGGER set_meeting_code BEFORE INSERT ON meetings
    FOR EACH ROW 
    WHEN (NEW.meeting_code IS NULL OR NEW.meeting_code = '')
    EXECUTE FUNCTION (
        CREATE OR REPLACE FUNCTION set_meeting_code_trigger()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.meeting_code = generate_meeting_code();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
    );

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a function to validate meeting participants
CREATE OR REPLACE FUNCTION validate_meeting_participant()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if meeting exists and is not ended
    IF NOT EXISTS (
        SELECT 1 FROM meetings 
        WHERE id = NEW.meeting_id 
        AND status IN ('scheduled', 'active')
    ) THEN
        RAISE EXCEPTION 'Cannot join ended or cancelled meeting';
    END IF;
    
    -- Check max participants limit
    IF (
        SELECT COUNT(*) FROM meeting_participants 
        WHERE meeting_id = NEW.meeting_id AND left_at IS NULL
    ) >= (
        SELECT max_participants FROM meetings WHERE id = NEW.meeting_id
    ) THEN
        RAISE EXCEPTION 'Meeting has reached maximum participant limit';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_meeting_participant_trigger
    BEFORE INSERT ON meeting_participants
    FOR EACH ROW EXECUTE FUNCTION validate_meeting_participant();