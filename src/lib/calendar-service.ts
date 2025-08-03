// Calendar and Scheduling Service for Univo
// Handles meeting scheduling, calendar integration, and recurring meetings

export interface MeetingSchedule {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  roomId: string;
  hostId: string;
  hostName: string;
  participants: MeetingParticipant[];
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  meetingType: 'instant' | 'scheduled' | 'recurring';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  settings: MeetingSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingParticipant {
  id: string;
  email: string;
  name: string;
  role: 'host' | 'co-host' | 'participant' | 'optional';
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  joinedAt?: Date;
  leftAt?: Date;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every N days/weeks/months/years
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number; // For monthly recurrence
  endDate?: Date;
  occurrences?: number; // Number of occurrences
}

export interface MeetingSettings {
  requirePassword: boolean;
  password?: string;
  waitingRoom: boolean;
  allowRecording: boolean;
  muteParticipantsOnJoin: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  allowWhiteboard: boolean;
  allowBreakoutRooms: boolean;
  maxParticipants: number;
  autoRecord: boolean;
  enableAI: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: string[];
  isAllDay: boolean;
  recurrence?: RecurrenceRule;
  meetingId?: string;
  calendarProvider: 'google' | 'outlook' | 'apple' | 'univo';
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  conflictingEvents?: CalendarEvent[];
}

class CalendarService {
  private meetings: MeetingSchedule[] = [];
  private calendarEvents: CalendarEvent[] = [];

  // Create a new meeting
  async createMeeting(meetingData: Omit<MeetingSchedule, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<MeetingSchedule> {
    const meeting: MeetingSchedule = {
      ...meetingData,
      id: this.generateMeetingId(),
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate recurring meetings if needed
    if (meeting.isRecurring && meeting.recurrenceRule) {
      const recurringMeetings = this.generateRecurringMeetings(meeting);
      this.meetings.push(...recurringMeetings);
    } else {
      this.meetings.push(meeting);
    }

    // Save to localStorage (in production, use proper database)
    this.saveMeetings();

    // Create calendar event
    await this.createCalendarEvent(meeting);

    return meeting;
  }

  // Update meeting
  async updateMeeting(meetingId: string, updates: Partial<MeetingSchedule>): Promise<MeetingSchedule | null> {
    const meetingIndex = this.meetings.findIndex(m => m.id === meetingId);
    if (meetingIndex === -1) return null;

    const updatedMeeting = {
      ...this.meetings[meetingIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.meetings[meetingIndex] = updatedMeeting;
    this.saveMeetings();

    return updatedMeeting;
  }

  // Cancel meeting
  async cancelMeeting(meetingId: string): Promise<boolean> {
    const meeting = await this.updateMeeting(meetingId, { status: 'cancelled' });
    if (meeting) {
      // Send cancellation notifications
      await this.sendMeetingNotification(meeting, 'cancelled');
      return true;
    }
    return false;
  }

  // Get meeting by ID
  getMeeting(meetingId: string): MeetingSchedule | null {
    return this.meetings.find(m => m.id === meetingId) || null;
  }

  // Get meetings for a user
  getUserMeetings(userId: string, startDate?: Date, endDate?: Date): MeetingSchedule[] {
    let userMeetings = this.meetings.filter(meeting => 
      meeting.hostId === userId || 
      meeting.participants.some(p => p.id === userId)
    );

    if (startDate && endDate) {
      userMeetings = userMeetings.filter(meeting => 
        meeting.startTime >= startDate && meeting.startTime <= endDate
      );
    }

    return userMeetings.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // Get upcoming meetings
  getUpcomingMeetings(userId: string, limit: number = 10): MeetingSchedule[] {
    const now = new Date();
    return this.getUserMeetings(userId)
      .filter(meeting => meeting.startTime > now && meeting.status === 'scheduled')
      .slice(0, limit);
  }

  // Get today's meetings
  getTodaysMeetings(userId: string): MeetingSchedule[] {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.getUserMeetings(userId, startOfDay, endOfDay);
  }

  // Check availability
  checkAvailability(userId: string, startTime: Date, endTime: Date): TimeSlot {
    const conflictingEvents = this.meetings.filter(meeting => 
      (meeting.hostId === userId || meeting.participants.some(p => p.id === userId)) &&
      meeting.status === 'scheduled' &&
      ((meeting.startTime <= startTime && meeting.endTime > startTime) ||
       (meeting.startTime < endTime && meeting.endTime >= endTime) ||
       (meeting.startTime >= startTime && meeting.endTime <= endTime))
    );

    return {
      start: startTime,
      end: endTime,
      available: conflictingEvents.length === 0,
      conflictingEvents: conflictingEvents.map(m => this.meetingToCalendarEvent(m))
    };
  }

  // Find available time slots
  findAvailableSlots(
    userId: string, 
    date: Date, 
    duration: number, // in minutes
    workingHours: { start: number; end: number } = { start: 9, end: 17 }
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), workingHours.start);
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), workingHours.end);
    
    let currentTime = new Date(startOfDay);
    
    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      
      if (slotEnd <= endOfDay) {
        const availability = this.checkAvailability(userId, currentTime, slotEnd);
        slots.push(availability);
      }
      
      currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-minute intervals
    }
    
    return slots.filter(slot => slot.available);
  }

  // Generate meeting link
  generateMeetingLink(meetingId: string): string {
    return `${window.location.origin}/meeting/${meetingId}`;
  }

  // Generate join link for guests
  generateGuestLink(meetingId: string): string {
    return `${window.location.origin}/meeting/join?id=${meetingId}`;
  }

  // Send meeting invitations
  async sendMeetingInvitation(meeting: MeetingSchedule): Promise<boolean> {
    try {
      // In production, integrate with email service
      console.log('Sending meeting invitation:', {
        to: meeting.participants.map(p => p.email),
        subject: `Meeting Invitation: ${meeting.title}`,
        meetingLink: this.generateMeetingLink(meeting.id),
        startTime: meeting.startTime,
        endTime: meeting.endTime,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send meeting invitation:', error);
      return false;
    }
  }

  // Send meeting notifications
  async sendMeetingNotification(meeting: MeetingSchedule, type: 'reminder' | 'cancelled' | 'updated'): Promise<boolean> {
    try {
      console.log('Sending meeting notification:', {
        type,
        meeting: meeting.title,
        participants: meeting.participants.length,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send meeting notification:', error);
      return false;
    }
  }

  // Calendar integration methods
  async syncWithGoogleCalendar(accessToken: string): Promise<CalendarEvent[]> {
    // In production, implement Google Calendar API integration
    console.log('Syncing with Google Calendar...');
    return [];
  }

  async syncWithOutlookCalendar(accessToken: string): Promise<CalendarEvent[]> {
    // In production, implement Microsoft Graph API integration
    console.log('Syncing with Outlook Calendar...');
    return [];
  }

  // Export calendar
  exportToICS(meetings: MeetingSchedule[]): string {
    let ics = 'BEGIN:VCALENDAR\r\n';
    ics += 'VERSION:2.0\r\n';
    ics += 'PRODID:-//Univo//Meeting Scheduler//EN\r\n';
    
    meetings.forEach(meeting => {
      ics += 'BEGIN:VEVENT\r\n';
      ics += `UID:${meeting.id}@univo.com\r\n`;
      ics += `DTSTART:${this.formatDateForICS(meeting.startTime)}\r\n`;
      ics += `DTEND:${this.formatDateForICS(meeting.endTime)}\r\n`;
      ics += `SUMMARY:${meeting.title}\r\n`;
      ics += `DESCRIPTION:${meeting.description || ''}\r\n`;
      ics += `LOCATION:${this.generateMeetingLink(meeting.id)}\r\n`;
      ics += `ORGANIZER:CN=${meeting.hostName}:MAILTO:host@univo.com\r\n`;
      
      meeting.participants.forEach(participant => {
        ics += `ATTENDEE:CN=${participant.name}:MAILTO:${participant.email}\r\n`;
      });
      
      ics += 'END:VEVENT\r\n';
    });
    
    ics += 'END:VCALENDAR\r\n';
    return ics;
  }

  // Helper methods
  private generateMeetingId(): string {
    return `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecurringMeetings(baseMeeting: MeetingSchedule): MeetingSchedule[] {
    const meetings: MeetingSchedule[] = [baseMeeting];
    const rule = baseMeeting.recurrenceRule!;
    
    let currentDate = new Date(baseMeeting.startTime);
    const duration = baseMeeting.endTime.getTime() - baseMeeting.startTime.getTime();
    
    const maxOccurrences = rule.occurrences || 52; // Default to 1 year
    const endDate = rule.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    
    for (let i = 1; i < maxOccurrences; i++) {
      currentDate = this.getNextRecurrenceDate(currentDate, rule);
      
      if (currentDate > endDate) break;
      
      const recurringMeeting: MeetingSchedule = {
        ...baseMeeting,
        id: this.generateMeetingId(),
        startTime: new Date(currentDate),
        endTime: new Date(currentDate.getTime() + duration),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      meetings.push(recurringMeeting);
    }
    
    return meetings;
  }

  private getNextRecurrenceDate(currentDate: Date, rule: RecurrenceRule): Date {
    const nextDate = new Date(currentDate);
    
    switch (rule.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + rule.interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * rule.interval));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + rule.interval);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + rule.interval);
        break;
    }
    
    return nextDate;
  }

  private meetingToCalendarEvent(meeting: MeetingSchedule): CalendarEvent {
    return {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      location: this.generateMeetingLink(meeting.id),
      attendees: meeting.participants.map(p => p.email),
      isAllDay: false,
      recurrence: meeting.recurrenceRule,
      meetingId: meeting.id,
      calendarProvider: 'univo',
    };
  }

  private formatDateForICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private saveMeetings(): void {
    try {
      localStorage.setItem('univo_meetings', JSON.stringify(this.meetings));
    } catch (error) {
      console.error('Failed to save meetings:', error);
    }
  }

  private loadMeetings(): void {
    try {
      const stored = localStorage.getItem('univo_meetings');
      if (stored) {
        this.meetings = JSON.parse(stored).map((m: any) => ({
          ...m,
          startTime: new Date(m.startTime),
          endTime: new Date(m.endTime),
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load meetings:', error);
      this.meetings = [];
    }
  }

  private async createCalendarEvent(meeting: MeetingSchedule): Promise<void> {
    const calendarEvent = this.meetingToCalendarEvent(meeting);
    this.calendarEvents.push(calendarEvent);
  }

  // Initialize service
  initialize(): void {
    this.loadMeetings();
  }
}

// Export singleton instance
export const calendarService = new CalendarService();

// Utility functions
export const formatMeetingTime = (startTime: Date, endTime: Date): string => {
  const start = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const end = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${start} - ${end}`;
};

export const getMeetingDuration = (startTime: Date, endTime: Date): string => {
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const isUpcoming = (startTime: Date): boolean => {
  return startTime > new Date();
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Initialize service
calendarService.initialize();