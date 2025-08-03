# Database Setup Guide

This guide explains how to set up the PostgreSQL database with Supabase for the Univio video conferencing platform.

## Overview

The database schema is designed to support:
- User management with role-based access control
- Meeting management and real-time participation
- Chat messaging and file sharing
- Whiteboard collaboration
- AI transcription and analytics
- Recording and playback functionality

## Database Schema

### Core Tables

#### 1. Profiles
Extends the default Supabase auth.users table with additional user information.

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    is_online BOOLEAN NOT NULL DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### 2. Meetings
Core meeting information and metadata.

```sql
CREATE TABLE meetings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    meeting_code TEXT NOT NULL UNIQUE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    status meeting_status NOT NULL DEFAULT 'scheduled',
    max_participants INTEGER NOT NULL DEFAULT 100,
    is_recording BOOLEAN NOT NULL DEFAULT false,
    recording_url TEXT,
    ai_summary TEXT,
    ai_transcript TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### 3. Meeting Participants
Tracks who joins/leaves meetings and their status.

```sql
CREATE TABLE meeting_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    role participant_role NOT NULL DEFAULT 'participant',
    is_muted BOOLEAN NOT NULL DEFAULT false,
    is_video_on BOOLEAN NOT NULL DEFAULT true,
    is_screen_sharing BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);
```

### Supporting Tables

- **chat_messages**: Real-time chat functionality
- **whiteboard_sessions**: Collaborative whiteboard data
- **ai_transcriptions**: AI-generated transcripts
- **meeting_recordings**: Video recording metadata
- **file_uploads**: Shared files and documents
- **user_sessions**: Active user session tracking
- **meeting_invitations**: Meeting invitation system
- **analytics_events**: Usage analytics and tracking

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Migrations

Execute the migration files in order:

```bash
# 1. Create initial schema
psql -h your-host -U postgres -d your-db -f supabase/migrations/001_initial_schema.sql

# 2. Add functions and triggers
psql -h your-host -U postgres -d your-db -f supabase/migrations/002_functions_and_triggers.sql

# 3. Set up Row Level Security
psql -h your-host -U postgres -d your-db -f supabase/migrations/003_row_level_security.sql
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Enable Authentication Providers

In your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable Email authentication
3. Configure Google OAuth (optional)
4. Configure GitHub OAuth (optional)

## Database Functions

### Automated Functions

- **generate_meeting_code()**: Creates unique 8-character meeting codes
- **handle_new_user()**: Automatically creates profile when user signs up
- **update_user_online_status()**: Manages user online/offline status
- **end_meeting()**: Properly closes meetings and updates participants
- **get_meeting_stats()**: Returns meeting statistics and metrics
- **get_user_analytics()**: Provides user usage analytics

### Triggers

- **updated_at triggers**: Automatically update timestamps on record changes
- **meeting_code trigger**: Auto-generates meeting codes on insert
- **new_user trigger**: Creates profile when auth user is created
- **participant_validation**: Validates meeting capacity and status

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

- Users can only access data they're authorized to see
- Meeting hosts have control over their meetings
- Admins and moderators have appropriate elevated access
- Private messages remain private
- File access is properly controlled

### Key Security Features

1. **Profile Access**: Users can view all profiles but only edit their own
2. **Meeting Access**: Users can only see meetings they participate in
3. **Chat Privacy**: Private messages are only visible to sender/recipient
4. **File Security**: Files are only accessible to meeting participants
5. **Admin Controls**: Admins have elevated access for management functions

## Performance Optimizations

### Indexes

The schema includes comprehensive indexes for:
- User lookups by email and role
- Meeting searches by code and status
- Participant queries by meeting and user
- Chat message ordering and filtering
- Analytics event querying

### Query Optimization

- Use of JSONB for flexible metadata storage
- Proper foreign key relationships for data integrity
- Efficient pagination support
- Real-time subscription optimization

## Real-time Features

The database supports real-time updates through Supabase's built-in functionality:

- **Chat Messages**: Live message updates
- **Participant Status**: Real-time join/leave notifications
- **Whiteboard Changes**: Collaborative drawing updates
- **Meeting Status**: Live meeting state changes

## Backup and Maintenance

### Automated Cleanup

- **cleanup_expired_sessions()**: Removes old user sessions
- **Invitation expiry**: Automatic cleanup of expired invitations
- **Analytics retention**: Configurable data retention policies

### Monitoring

Key metrics to monitor:
- Active user sessions
- Meeting duration and frequency
- Database performance and query times
- Storage usage for files and recordings

## Development vs Production

### Development Setup
- Use Supabase free tier
- Enable all authentication providers
- Use local file storage for uploads

### Production Setup
- Upgrade to Supabase Pro for better performance
- Configure custom domain
- Set up proper backup strategies
- Enable database monitoring and alerts
- Configure CDN for file delivery

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Check user permissions and policy conditions
2. **Migration Failures**: Ensure proper order and dependencies
3. **Performance Issues**: Review indexes and query patterns
4. **Real-time Connection Issues**: Verify WebSocket configuration

### Debug Queries

```sql
-- Check user permissions
SELECT * FROM profiles WHERE id = auth.uid();

-- View meeting participants
SELECT m.title, mp.*, p.full_name 
FROM meetings m
JOIN meeting_participants mp ON m.id = mp.meeting_id
JOIN profiles p ON mp.user_id = p.id
WHERE m.meeting_code = 'YOUR_CODE';

-- Analytics overview
SELECT event_type, COUNT(*) 
FROM analytics_events 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_type;
```

## API Usage Examples

### Creating a Meeting

```typescript
import { database } from '@/lib/database'

const meeting = await database.createMeeting({
  title: 'Team Standup',
  description: 'Daily team sync',
  host_id: userId,
  scheduled_at: new Date().toISOString()
})
```

### Joining a Meeting

```typescript
const participant = await database.joinMeeting(
  meetingId, 
  userId, 
  'participant'
)
```

### Sending Chat Message

```typescript
const message = await database.sendMessage({
  meeting_id: meetingId,
  user_id: userId,
  message: 'Hello everyone!',
  message_type: 'text'
})
```

This database schema provides a robust foundation for the Univio video conferencing platform with proper security, performance, and scalability considerations.