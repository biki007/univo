-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete profiles" ON profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Meetings policies
CREATE POLICY "Users can view meetings they participate in" ON meetings
    FOR SELECT USING (
        host_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = id AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Users can create meetings" ON meetings
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their meetings" ON meetings
    FOR UPDATE USING (
        host_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Hosts and admins can delete meetings" ON meetings
    FOR DELETE USING (
        host_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Meeting participants policies
CREATE POLICY "Users can view participants in their meetings" ON meeting_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meetings 
            WHERE id = meeting_id AND host_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM meeting_participants mp2 
            WHERE mp2.meeting_id = meeting_id AND mp2.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Users can join meetings" ON meeting_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM meetings 
            WHERE id = meeting_id AND status IN ('scheduled', 'active')
        )
    );

CREATE POLICY "Users can update their own participation" ON meeting_participants
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meetings 
            WHERE id = meeting_id AND host_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Hosts and moderators can remove participants" ON meeting_participants
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meetings 
            WHERE id = meeting_id AND host_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = meeting_participants.meeting_id 
            AND user_id = auth.uid() 
            AND role IN ('host', 'moderator')
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Chat messages policies
CREATE POLICY "Users can view messages in their meetings" ON chat_messages
    FOR SELECT USING (
        user_id = auth.uid() OR
        (NOT is_private) AND EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = chat_messages.meeting_id AND user_id = auth.uid()
        ) OR
        (is_private AND recipient_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Users can send messages in meetings they're in" ON chat_messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = chat_messages.meeting_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON chat_messages
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users and moderators can delete messages" ON chat_messages
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = chat_messages.meeting_id 
            AND user_id = auth.uid() 
            AND role IN ('host', 'moderator')
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Whiteboard sessions policies
CREATE POLICY "Users can view whiteboards in their meetings" ON whiteboard_sessions
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = whiteboard_sessions.meeting_id AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Users can create whiteboards in meetings they're in" ON whiteboard_sessions
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = whiteboard_sessions.meeting_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update whiteboards they created or in meetings they moderate" ON whiteboard_sessions
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = whiteboard_sessions.meeting_id 
            AND user_id = auth.uid() 
            AND role IN ('host', 'moderator')
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- AI transcriptions policies
CREATE POLICY "Users can view transcriptions from their meetings" ON ai_transcriptions
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = ai_transcriptions.meeting_id AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "System can insert transcriptions" ON ai_transcriptions
    FOR INSERT WITH CHECK (true);

-- Meeting recordings policies
CREATE POLICY "Users can view recordings from meetings they participated in" ON meeting_recordings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings 
            WHERE id = meeting_id AND host_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = meeting_recordings.meeting_id AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Hosts can manage recordings" ON meeting_recordings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings 
            WHERE id = meeting_id AND host_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- File uploads policies
CREATE POLICY "Users can view files from their meetings" ON file_uploads
    FOR SELECT USING (
        user_id = auth.uid() OR
        (is_public AND meeting_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = file_uploads.meeting_id AND user_id = auth.uid()
        )) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Users can upload files" ON file_uploads
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        (meeting_id IS NULL OR EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_id = file_uploads.meeting_id AND user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can manage their own files" ON file_uploads
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- User sessions policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Meeting invitations policies
CREATE POLICY "Users can view invitations sent to them or by them" ON meeting_invitations
    FOR SELECT USING (
        inviter_id = auth.uid() OR
        invitee_id = auth.uid() OR
        invitee_email = (SELECT email FROM profiles WHERE id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM meetings 
            WHERE id = meeting_id AND host_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Users can send invitations for their meetings" ON meeting_invitations
    FOR INSERT WITH CHECK (
        inviter_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM meetings 
            WHERE id = meeting_id AND host_id = auth.uid()
        )
    );

CREATE POLICY "Users can update invitations they sent or received" ON meeting_invitations
    FOR UPDATE USING (
        inviter_id = auth.uid() OR
        invitee_id = auth.uid() OR
        invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
    );

-- Analytics events policies
CREATE POLICY "Admins and moderators can view analytics" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "System can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to service role for system operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;