-- Add waiting room participants table
CREATE TABLE waiting_room_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    guest_name TEXT,
    guest_email TEXT,
    join_request_message TEXT,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'admitted', 'denied', 'left')),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_waiting_room_meeting_id ON waiting_room_participants(meeting_id);
CREATE INDEX idx_waiting_room_status ON waiting_room_participants(status);
CREATE INDEX idx_waiting_room_requested_at ON waiting_room_participants(requested_at);

-- Add meeting access logs table for security auditing
CREATE TABLE meeting_access_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_name TEXT,
    action TEXT NOT NULL CHECK (action IN ('join_attempt', 'join_success', 'join_denied', 'left', 'kicked')),
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for access logs
CREATE INDEX idx_access_logs_meeting_id ON meeting_access_logs(meeting_id);
CREATE INDEX idx_access_logs_action ON meeting_access_logs(action);
CREATE INDEX idx_access_logs_created_at ON meeting_access_logs(created_at);

-- Update meetings table to add security fields if not in settings
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS waiting_room_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS allow_guests BOOLEAN NOT NULL DEFAULT true;