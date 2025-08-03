// Advanced Analytics Service for Univo
// Handles meeting analytics, user engagement, and reporting

export interface MeetingAnalytics {
  meetingId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  participantCount: number;
  maxConcurrentParticipants: number;
  totalJoins: number;
  totalLeaves: number;
  averageParticipationTime: number;
  engagementScore: number;
  qualityMetrics: QualityMetrics;
  participantAnalytics: ParticipantAnalytics[];
  featureUsage: FeatureUsage;
  aiInsights: AIInsights;
}

export interface QualityMetrics {
  averageVideoQuality: number; // 1-5 scale
  averageAudioQuality: number; // 1-5 scale
  connectionIssues: number;
  dropoutRate: number; // percentage
  latencyAverage: number; // milliseconds
  bandwidthUsage: number; // MB
}

export interface ParticipantAnalytics {
  userId: string;
  name: string;
  joinTime: Date;
  leaveTime: Date;
  participationTime: number; // seconds
  speakingTime: number; // seconds
  microphoneOnTime: number; // seconds
  cameraOnTime: number; // seconds
  chatMessages: number;
  screenShareTime: number; // seconds
  engagementScore: number; // 1-100
  attentionScore: number; // 1-100 (based on activity)
}

export interface FeatureUsage {
  chat: {
    messagesCount: number;
    activeUsers: number;
    averageResponseTime: number;
  };
  whiteboard: {
    totalStrokes: number;
    activeUsers: number;
    sessionDuration: number;
  };
  codeEditor: {
    linesOfCode: number;
    activeUsers: number;
    languagesUsed: string[];
  };
  screenShare: {
    totalSessions: number;
    totalDuration: number;
    uniqueSharers: number;
  };
  recording: {
    wasRecorded: boolean;
    recordingDuration: number;
    fileSize: number;
  };
}

export interface AIInsights {
  transcriptionAccuracy: number;
  keyTopics: string[];
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  actionItemsDetected: number;
  questionsAsked: number;
  decisionsIdentified: number;
  engagementLevel: 'low' | 'medium' | 'high';
  meetingEffectiveness: number; // 1-100
}

export interface UserEngagementMetrics {
  userId: string;
  totalMeetings: number;
  totalMeetingTime: number; // seconds
  averageMeetingDuration: number;
  hostingCount: number;
  participationRate: number; // percentage of invited meetings attended
  punctualityScore: number; // 1-100 based on on-time arrivals
  engagementScore: number; // 1-100 overall engagement
  featureAdoption: {
    chat: number; // usage frequency
    whiteboard: number;
    codeEditor: number;
    screenShare: number;
  };
  qualityRating: number; // average rating given by others
  feedbackScore: number; // average feedback received
}

export interface OrganizationMetrics {
  totalUsers: number;
  activeUsers: number; // last 30 days
  totalMeetings: number;
  totalMeetingHours: number;
  averageMeetingDuration: number;
  peakUsageHours: { hour: number; count: number }[];
  popularFeatures: { feature: string; usage: number }[];
  userGrowth: { date: Date; count: number }[];
  meetingGrowth: { date: Date; count: number }[];
  costPerUser: number;
  roi: number; // return on investment
}

export interface ReportFilter {
  startDate: Date;
  endDate: Date;
  userIds?: string[];
  meetingTypes?: string[];
  departments?: string[];
  includeGuests?: boolean;
}

class AnalyticsService {
  private meetingAnalytics: MeetingAnalytics[] = [];
  private userMetrics: Map<string, UserEngagementMetrics> = new Map();
  private realTimeMetrics: Map<string, any> = new Map();

  // Track meeting start
  async trackMeetingStart(meetingId: string, title: string, hostId: string): Promise<void> {
    const analytics: Partial<MeetingAnalytics> = {
      meetingId,
      title,
      startTime: new Date(),
      participantCount: 0,
      maxConcurrentParticipants: 0,
      totalJoins: 0,
      totalLeaves: 0,
      participantAnalytics: [],
      featureUsage: {
        chat: { messagesCount: 0, activeUsers: 0, averageResponseTime: 0 },
        whiteboard: { totalStrokes: 0, activeUsers: 0, sessionDuration: 0 },
        codeEditor: { linesOfCode: 0, activeUsers: 0, languagesUsed: [] },
        screenShare: { totalSessions: 0, totalDuration: 0, uniqueSharers: 0 },
        recording: { wasRecorded: false, recordingDuration: 0, fileSize: 0 }
      }
    };

    this.realTimeMetrics.set(meetingId, analytics);
  }

  // Track participant join
  async trackParticipantJoin(meetingId: string, userId: string, userName: string): Promise<void> {
    const analytics = this.realTimeMetrics.get(meetingId);
    if (!analytics) return;

    analytics.participantCount++;
    analytics.totalJoins++;
    analytics.maxConcurrentParticipants = Math.max(
      analytics.maxConcurrentParticipants,
      analytics.participantCount
    );

    const participantAnalytic: ParticipantAnalytics = {
      userId,
      name: userName,
      joinTime: new Date(),
      leaveTime: new Date(), // Will be updated on leave
      participationTime: 0,
      speakingTime: 0,
      microphoneOnTime: 0,
      cameraOnTime: 0,
      chatMessages: 0,
      screenShareTime: 0,
      engagementScore: 0,
      attentionScore: 0
    };

    analytics.participantAnalytics.push(participantAnalytic);
    this.realTimeMetrics.set(meetingId, analytics);
  }

  // Track participant leave
  async trackParticipantLeave(meetingId: string, userId: string): Promise<void> {
    const analytics = this.realTimeMetrics.get(meetingId);
    if (!analytics) return;

    analytics.participantCount--;
    analytics.totalLeaves++;

    const participant = analytics.participantAnalytics.find((p: ParticipantAnalytics) => p.userId === userId);
    if (participant) {
      participant.leaveTime = new Date();
      participant.participationTime = Math.floor(
        (participant.leaveTime.getTime() - participant.joinTime.getTime()) / 1000
      );
    }

    this.realTimeMetrics.set(meetingId, analytics);
  }

  // Track feature usage
  async trackFeatureUsage(
    meetingId: string,
    feature: keyof FeatureUsage,
    action: string,
    userId: string,
    data?: any
  ): Promise<void> {
    const analytics = this.realTimeMetrics.get(meetingId);
    if (!analytics) return;

    switch (feature) {
      case 'chat':
        if (action === 'message_sent') {
          analytics.featureUsage.chat.messagesCount++;
          const participant = analytics.participantAnalytics.find((p: ParticipantAnalytics) => p.userId === userId);
          if (participant) participant.chatMessages++;
        }
        break;

      case 'whiteboard':
        if (action === 'stroke_added') {
          analytics.featureUsage.whiteboard.totalStrokes++;
        }
        break;

      case 'codeEditor':
        if (action === 'code_written') {
          analytics.featureUsage.codeEditor.linesOfCode += data?.lines || 1;
          if (data?.language && !analytics.featureUsage.codeEditor.languagesUsed.includes(data.language)) {
            analytics.featureUsage.codeEditor.languagesUsed.push(data.language);
          }
        }
        break;

      case 'screenShare':
        if (action === 'share_started') {
          analytics.featureUsage.screenShare.totalSessions++;
          const participant = analytics.participantAnalytics.find((p: ParticipantAnalytics) => p.userId === userId);
          if (participant) {
            // Track screen share start time
            (participant as any).screenShareStartTime = Date.now();
          }
        } else if (action === 'share_ended') {
          const participant = analytics.participantAnalytics.find((p: ParticipantAnalytics) => p.userId === userId);
          if (participant && (participant as any).screenShareStartTime) {
            const duration = Math.floor((Date.now() - (participant as any).screenShareStartTime) / 1000);
            participant.screenShareTime += duration;
            analytics.featureUsage.screenShare.totalDuration += duration;
          }
        }
        break;

      case 'recording':
        if (action === 'recording_started') {
          analytics.featureUsage.recording.wasRecorded = true;
        } else if (action === 'recording_ended') {
          analytics.featureUsage.recording.recordingDuration = data?.duration || 0;
          analytics.featureUsage.recording.fileSize = data?.fileSize || 0;
        }
        break;
    }

    this.realTimeMetrics.set(meetingId, analytics);
  }

  // Track meeting end
  async trackMeetingEnd(meetingId: string): Promise<MeetingAnalytics> {
    const analytics = this.realTimeMetrics.get(meetingId);
    if (!analytics) throw new Error('Meeting analytics not found');

    analytics.endTime = new Date();
    analytics.duration = Math.floor((analytics.endTime.getTime() - analytics.startTime.getTime()) / 1000);

    // Calculate engagement scores
    analytics.engagementScore = this.calculateMeetingEngagementScore(analytics);
    analytics.averageParticipationTime = this.calculateAverageParticipationTime(analytics);

    // Calculate quality metrics
    analytics.qualityMetrics = await this.calculateQualityMetrics(meetingId);

    // Generate AI insights
    analytics.aiInsights = await this.generateAIInsights(analytics);

    // Store completed analytics
    this.meetingAnalytics.push(analytics as MeetingAnalytics);
    this.realTimeMetrics.delete(meetingId);

    // Update user metrics
    await this.updateUserMetrics(analytics as MeetingAnalytics);

    return analytics as MeetingAnalytics;
  }

  // Calculate meeting engagement score
  private calculateMeetingEngagementScore(analytics: Partial<MeetingAnalytics>): number {
    if (!analytics.participantAnalytics || analytics.participantAnalytics.length === 0) return 0;

    let totalEngagement = 0;
    let participantCount = 0;

    analytics.participantAnalytics.forEach(participant => {
      let engagement = 0;
      const totalTime = participant.participationTime;

      if (totalTime > 0) {
        // Speaking engagement (30% weight)
        const speakingRatio = participant.speakingTime / totalTime;
        engagement += speakingRatio * 30;

        // Camera engagement (20% weight)
        const cameraRatio = participant.cameraOnTime / totalTime;
        engagement += cameraRatio * 20;

        // Chat engagement (25% weight)
        const chatScore = Math.min(participant.chatMessages / 5, 1) * 25;
        engagement += chatScore;

        // Screen share engagement (15% weight)
        const screenShareRatio = participant.screenShareTime / totalTime;
        engagement += screenShareRatio * 15;

        // Participation duration (10% weight)
        const durationScore = Math.min(totalTime / (analytics.duration || 1), 1) * 10;
        engagement += durationScore;

        participant.engagementScore = Math.min(engagement, 100);
        totalEngagement += participant.engagementScore;
        participantCount++;
      }
    });

    return participantCount > 0 ? totalEngagement / participantCount : 0;
  }

  // Calculate average participation time
  private calculateAverageParticipationTime(analytics: Partial<MeetingAnalytics>): number {
    if (!analytics.participantAnalytics || analytics.participantAnalytics.length === 0) return 0;

    const totalTime = analytics.participantAnalytics.reduce(
      (sum, participant) => sum + participant.participationTime,
      0
    );

    return totalTime / analytics.participantAnalytics.length;
  }

  // Calculate quality metrics
  private async calculateQualityMetrics(meetingId: string): Promise<QualityMetrics> {
    // In a real implementation, this would collect actual network and quality data
    return {
      averageVideoQuality: 4.2,
      averageAudioQuality: 4.5,
      connectionIssues: 2,
      dropoutRate: 5.2,
      latencyAverage: 120,
      bandwidthUsage: 450
    };
  }

  // Generate AI insights
  private async generateAIInsights(analytics: Partial<MeetingAnalytics>): Promise<AIInsights> {
    // In a real implementation, this would use actual AI analysis
    const totalMessages = analytics.featureUsage?.chat.messagesCount || 0;
    const participantCount = analytics.participantAnalytics?.length || 0;

    return {
      transcriptionAccuracy: 0.92,
      keyTopics: ['project planning', 'budget review', 'timeline discussion'],
      sentimentAnalysis: {
        positive: 0.65,
        neutral: 0.25,
        negative: 0.10
      },
      actionItemsDetected: Math.floor(totalMessages * 0.1),
      questionsAsked: Math.floor(totalMessages * 0.15),
      decisionsIdentified: Math.floor(totalMessages * 0.05),
      engagementLevel: analytics.engagementScore! > 70 ? 'high' : analytics.engagementScore! > 40 ? 'medium' : 'low',
      meetingEffectiveness: Math.min((analytics.engagementScore! + 20), 100)
    };
  }

  // Update user metrics
  private async updateUserMetrics(analytics: MeetingAnalytics): Promise<void> {
    analytics.participantAnalytics.forEach(participant => {
      let userMetrics = this.userMetrics.get(participant.userId);
      
      if (!userMetrics) {
        userMetrics = {
          userId: participant.userId,
          totalMeetings: 0,
          totalMeetingTime: 0,
          averageMeetingDuration: 0,
          hostingCount: 0,
          participationRate: 0,
          punctualityScore: 0,
          engagementScore: 0,
          featureAdoption: {
            chat: 0,
            whiteboard: 0,
            codeEditor: 0,
            screenShare: 0
          },
          qualityRating: 0,
          feedbackScore: 0
        };
      }

      userMetrics.totalMeetings++;
      userMetrics.totalMeetingTime += participant.participationTime;
      userMetrics.averageMeetingDuration = userMetrics.totalMeetingTime / userMetrics.totalMeetings;
      userMetrics.engagementScore = (userMetrics.engagementScore + participant.engagementScore) / 2;

      // Update feature adoption
      if (participant.chatMessages > 0) userMetrics.featureAdoption.chat++;
      if (participant.screenShareTime > 0) userMetrics.featureAdoption.screenShare++;

      this.userMetrics.set(participant.userId, userMetrics);
    });
  }

  // Get meeting analytics
  getMeetingAnalytics(meetingId: string): MeetingAnalytics | null {
    return this.meetingAnalytics.find(a => a.meetingId === meetingId) || null;
  }

  // Get user metrics
  getUserMetrics(userId: string): UserEngagementMetrics | null {
    return this.userMetrics.get(userId) || null;
  }

  // Generate reports
  async generateReport(filter: ReportFilter): Promise<{
    meetings: MeetingAnalytics[];
    summary: OrganizationMetrics;
    insights: string[];
  }> {
    const filteredMeetings = this.meetingAnalytics.filter(meeting =>
      meeting.startTime >= filter.startDate &&
      meeting.startTime <= filter.endDate
    );

    const summary: OrganizationMetrics = {
      totalUsers: this.userMetrics.size,
      activeUsers: Array.from(this.userMetrics.values()).filter(u => u.totalMeetings > 0).length,
      totalMeetings: filteredMeetings.length,
      totalMeetingHours: filteredMeetings.reduce((sum, m) => sum + m.duration, 0) / 3600,
      averageMeetingDuration: filteredMeetings.reduce((sum, m) => sum + m.duration, 0) / filteredMeetings.length / 60,
      peakUsageHours: this.calculatePeakUsageHours(filteredMeetings),
      popularFeatures: this.calculatePopularFeatures(filteredMeetings),
      userGrowth: [],
      meetingGrowth: [],
      costPerUser: 15, // Example cost
      roi: 250 // Example ROI
    };

    const insights = this.generateInsights(filteredMeetings, summary);

    return { meetings: filteredMeetings, summary, insights };
  }

  // Calculate peak usage hours
  private calculatePeakUsageHours(meetings: MeetingAnalytics[]): { hour: number; count: number }[] {
    const hourCounts = new Map<number, number>();
    
    meetings.forEach(meeting => {
      const hour = meeting.startTime.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Calculate popular features
  private calculatePopularFeatures(meetings: MeetingAnalytics[]): { feature: string; usage: number }[] {
    const features = {
      chat: meetings.reduce((sum, m) => sum + m.featureUsage.chat.messagesCount, 0),
      whiteboard: meetings.reduce((sum, m) => sum + m.featureUsage.whiteboard.totalStrokes, 0),
      codeEditor: meetings.reduce((sum, m) => sum + m.featureUsage.codeEditor.linesOfCode, 0),
      screenShare: meetings.reduce((sum, m) => sum + m.featureUsage.screenShare.totalSessions, 0),
      recording: meetings.filter(m => m.featureUsage.recording.wasRecorded).length
    };

    return Object.entries(features)
      .map(([feature, usage]) => ({ feature, usage }))
      .sort((a, b) => b.usage - a.usage);
  }

  // Generate insights
  private generateInsights(meetings: MeetingAnalytics[], summary: OrganizationMetrics): string[] {
    const insights: string[] = [];

    // Engagement insights
    const avgEngagement = meetings.reduce((sum, m) => sum + m.engagementScore, 0) / meetings.length;
    if (avgEngagement > 75) {
      insights.push('High engagement levels across meetings indicate effective collaboration');
    } else if (avgEngagement < 50) {
      insights.push('Consider strategies to improve meeting engagement and participation');
    }

    // Duration insights
    if (summary.averageMeetingDuration > 60) {
      insights.push('Meetings are running longer than average - consider agenda optimization');
    }

    // Feature adoption insights
    const topFeature = summary.popularFeatures[0];
    if (topFeature) {
      insights.push(`${topFeature.feature} is the most popular feature with ${topFeature.usage} uses`);
    }

    return insights;
  }

  // Export analytics data
  exportAnalytics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        meetings: this.meetingAnalytics,
        users: Array.from(this.userMetrics.values())
      }, null, 2);
    }

    // CSV export would be implemented here
    return 'CSV export not implemented';
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();