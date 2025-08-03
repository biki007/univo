// AI-Powered Meeting Assistant for Univo
// Handles intelligent meeting automation, suggestions, and workflow management

export interface MeetingContext {
  meetingId: string;
  title: string;
  participants: string[];
  agenda?: string[];
  duration: number;
  type: 'standup' | 'review' | 'planning' | 'training' | 'interview' | 'general';
  industry?: string;
  department?: string;
}

export interface AIAssistantAction {
  id: string;
  type: 'suggestion' | 'automation' | 'reminder' | 'insight';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  action?: () => Promise<void>;
  timestamp: Date;
  confidence: number;
}

export interface MeetingTemplate {
  id: string;
  name: string;
  type: string;
  duration: number;
  agenda: AgendaItem[];
  automations: AutomationRule[];
  participants: ParticipantRole[];
}

export interface AgendaItem {
  id: string;
  title: string;
  duration: number;
  type: 'discussion' | 'presentation' | 'decision' | 'action' | 'break';
  presenter?: string;
  materials?: string[];
  objectives: string[];
}

export interface AutomationRule {
  id: string;
  trigger: 'time' | 'keyword' | 'participant_action' | 'silence' | 'engagement';
  condition: any;
  action: 'reminder' | 'transition' | 'record' | 'poll' | 'breakout' | 'summary';
  parameters: Record<string, any>;
}

export interface ParticipantRole {
  role: string;
  permissions: string[];
  responsibilities: string[];
  suggestedCount: number;
}

export interface MeetingInsight {
  type: 'engagement' | 'participation' | 'agenda' | 'time' | 'decision' | 'action';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  suggestion?: string;
  data?: any;
}

class AIMeetingAssistant {
  private activeAssistants: Map<string, MeetingAssistantInstance> = new Map();
  private templates: MeetingTemplate[] = [];
  private learningData: Map<string, any> = new Map();

  // Initialize AI assistant for a meeting
  async initializeAssistant(context: MeetingContext): Promise<string> {
    const assistantId = `assistant_${context.meetingId}`;
    
    const assistant = new MeetingAssistantInstance(context);
    await assistant.initialize();
    
    this.activeAssistants.set(assistantId, assistant);
    
    // Load relevant templates and past meeting data
    await this.loadMeetingIntelligence(context);
    
    return assistantId;
  }

  // Get AI suggestions for the meeting
  async getSuggestions(assistantId: string): Promise<AIAssistantAction[]> {
    const assistant = this.activeAssistants.get(assistantId);
    if (!assistant) return [];

    return assistant.generateSuggestions();
  }

  // Process real-time meeting events
  async processEvent(assistantId: string, event: any): Promise<AIAssistantAction[]> {
    const assistant = this.activeAssistants.get(assistantId);
    if (!assistant) return [];

    return assistant.processEvent(event);
  }

  // Get meeting insights
  async getInsights(assistantId: string): Promise<MeetingInsight[]> {
    const assistant = this.activeAssistants.get(assistantId);
    if (!assistant) return [];

    return assistant.generateInsights();
  }

  // Auto-generate meeting agenda
  async generateAgenda(context: MeetingContext): Promise<AgendaItem[]> {
    const template = this.findBestTemplate(context);
    if (template) {
      return this.customizeAgenda(template.agenda, context);
    }

    // Generate agenda based on meeting type and context
    return this.createAgendaFromContext(context);
  }

  // Create meeting template
  createTemplate(template: Omit<MeetingTemplate, 'id'>): MeetingTemplate {
    const newTemplate: MeetingTemplate = {
      ...template,
      id: `template_${Date.now()}`
    };
    
    this.templates.push(newTemplate);
    return newTemplate;
  }

  // Get available templates
  getTemplates(type?: string): MeetingTemplate[] {
    return type 
      ? this.templates.filter(t => t.type === type)
      : this.templates;
  }

  // Load meeting intelligence from past meetings
  private async loadMeetingIntelligence(context: MeetingContext): Promise<void> {
    // Analyze past meetings with similar participants, type, or context
    const similarMeetings = await this.findSimilarMeetings(context);
    
    // Extract patterns and insights
    const patterns = this.extractPatterns(similarMeetings);
    
    // Store learning data
    this.learningData.set(context.meetingId, {
      patterns,
      recommendations: this.generateRecommendations(patterns),
      riskFactors: this.identifyRiskFactors(patterns)
    });
  }

  // Find best matching template
  private findBestTemplate(context: MeetingContext): MeetingTemplate | null {
    const candidates = this.templates.filter(t => t.type === context.type);
    
    if (candidates.length === 0) return null;
    
    // Score templates based on context similarity
    const scored = candidates.map(template => ({
      template,
      score: this.calculateTemplateScore(template, context)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    return scored[0].score > 0.7 ? scored[0].template : null;
  }

  // Calculate template relevance score
  private calculateTemplateScore(template: MeetingTemplate, context: MeetingContext): number {
    let score = 0;
    
    // Type match
    if (template.type === context.type) score += 0.4;
    
    // Duration similarity
    const durationDiff = Math.abs(template.duration - context.duration) / context.duration;
    score += (1 - durationDiff) * 0.2;
    
    // Participant count similarity
    const participantDiff = Math.abs(template.participants.length - context.participants.length) / context.participants.length;
    score += (1 - participantDiff) * 0.2;
    
    // Industry/department match
    if (context.industry && template.name.toLowerCase().includes(context.industry.toLowerCase())) {
      score += 0.2;
    }
    
    return Math.min(score, 1);
  }

  // Customize agenda based on context
  private customizeAgenda(baseAgenda: AgendaItem[], context: MeetingContext): AgendaItem[] {
    return baseAgenda.map(item => ({
      ...item,
      // Adjust duration based on meeting length
      duration: Math.round(item.duration * (context.duration / 60)),
      // Assign presenters from participants
      presenter: item.presenter || context.participants[0]
    }));
  }

  // Create agenda from context
  private createAgendaFromContext(context: MeetingContext): AgendaItem[] {
    const agenda: AgendaItem[] = [];
    
    // Opening (5 minutes)
    agenda.push({
      id: 'opening',
      title: 'Welcome & Introductions',
      duration: 5,
      type: 'discussion',
      objectives: ['Welcome participants', 'Review agenda']
    });

    // Main content based on meeting type
    switch (context.type) {
      case 'standup':
        agenda.push({
          id: 'updates',
          title: 'Team Updates',
          duration: context.duration - 10,
          type: 'discussion',
          objectives: ['Share progress', 'Identify blockers', 'Plan next steps']
        });
        break;
        
      case 'review':
        agenda.push({
          id: 'review',
          title: 'Review Session',
          duration: context.duration - 15,
          type: 'presentation',
          objectives: ['Present findings', 'Gather feedback', 'Make decisions']
        });
        break;
        
      default:
        agenda.push({
          id: 'main',
          title: 'Main Discussion',
          duration: context.duration - 15,
          type: 'discussion',
          objectives: ['Discuss key topics', 'Make progress on goals']
        });
    }

    // Closing (5 minutes)
    agenda.push({
      id: 'closing',
      title: 'Next Steps & Wrap-up',
      duration: 5,
      type: 'action',
      objectives: ['Summarize decisions', 'Assign action items', 'Schedule follow-ups']
    });

    return agenda;
  }

  // Find similar past meetings
  private async findSimilarMeetings(context: MeetingContext): Promise<any[]> {
    // In production, this would query a database of past meetings
    return [];
  }

  // Extract patterns from meeting data
  private extractPatterns(meetings: any[]): any {
    return {
      averageDuration: 45,
      commonTopics: ['project status', 'blockers', 'next steps'],
      participationPatterns: {},
      successFactors: ['clear agenda', 'time management', 'action items']
    };
  }

  // Generate recommendations based on patterns
  private generateRecommendations(patterns: any): string[] {
    return [
      'Consider keeping the meeting under 45 minutes for better engagement',
      'Prepare a clear agenda with time allocations',
      'Assign action items with owners and deadlines'
    ];
  }

  // Identify potential risk factors
  private identifyRiskFactors(patterns: any): string[] {
    return [
      'Large participant count may reduce engagement',
      'No agenda provided - meeting may lack focus',
      'Scheduled during lunch time - expect lower attendance'
    ];
  }

  // Cleanup assistant instance
  cleanup(assistantId: string): void {
    const assistant = this.activeAssistants.get(assistantId);
    if (assistant) {
      assistant.cleanup();
      this.activeAssistants.delete(assistantId);
    }
  }
}

// Individual meeting assistant instance
class MeetingAssistantInstance {
  private context: MeetingContext;
  private startTime: Date;
  private currentPhase: string = 'pre-meeting';
  private events: any[] = [];
  private automations: AutomationRule[] = [];
  private insights: MeetingInsight[] = [];

  constructor(context: MeetingContext) {
    this.context = context;
    this.startTime = new Date();
  }

  async initialize(): Promise<void> {
    // Set up automations based on meeting type
    this.setupAutomations();
    
    // Initialize monitoring
    this.startMonitoring();
  }

  // Generate AI suggestions
  async generateSuggestions(): Promise<AIAssistantAction[]> {
    const suggestions: AIAssistantAction[] = [];
    
    // Time-based suggestions
    const elapsed = Date.now() - this.startTime.getTime();
    const elapsedMinutes = elapsed / (1000 * 60);
    
    if (elapsedMinutes > this.context.duration * 0.8) {
      suggestions.push({
        id: 'time_warning',
        type: 'reminder',
        priority: 'high',
        title: 'Meeting Time Running Low',
        description: `Only ${Math.round(this.context.duration - elapsedMinutes)} minutes remaining`,
        timestamp: new Date(),
        confidence: 0.95
      });
    }

    // Engagement-based suggestions
    if (this.detectLowEngagement()) {
      suggestions.push({
        id: 'engagement_boost',
        type: 'suggestion',
        priority: 'medium',
        title: 'Boost Engagement',
        description: 'Consider asking a question or taking a quick poll',
        timestamp: new Date(),
        confidence: 0.8
      });
    }

    // Agenda-based suggestions
    if (this.shouldTransitionAgenda()) {
      suggestions.push({
        id: 'agenda_transition',
        type: 'automation',
        priority: 'medium',
        title: 'Move to Next Agenda Item',
        description: 'Ready to transition to the next topic',
        action: async () => this.transitionAgenda(),
        timestamp: new Date(),
        confidence: 0.85
      });
    }

    return suggestions;
  }

  // Process real-time events
  async processEvent(event: any): Promise<AIAssistantAction[]> {
    this.events.push({ ...event, timestamp: new Date() });
    
    const actions: AIAssistantAction[] = [];
    
    // Process different event types
    switch (event.type) {
      case 'participant_joined':
        actions.push(...this.handleParticipantJoined(event));
        break;
      case 'participant_left':
        actions.push(...this.handleParticipantLeft(event));
        break;
      case 'message_sent':
        actions.push(...this.handleMessageSent(event));
        break;
      case 'screen_share_started':
        actions.push(...this.handleScreenShareStarted(event));
        break;
      case 'silence_detected':
        actions.push(...this.handleSilenceDetected(event));
        break;
    }

    return actions;
  }

  // Generate meeting insights
  generateInsights(): MeetingInsight[] {
    const insights: MeetingInsight[] = [];
    
    // Participation analysis
    const participationInsight = this.analyzeParticipation();
    if (participationInsight) insights.push(participationInsight);
    
    // Time management analysis
    const timeInsight = this.analyzeTimeManagement();
    if (timeInsight) insights.push(timeInsight);
    
    // Engagement analysis
    const engagementInsight = this.analyzeEngagement();
    if (engagementInsight) insights.push(engagementInsight);
    
    return insights;
  }

  // Setup automations based on meeting type
  private setupAutomations(): void {
    // Common automations for all meetings
    this.automations.push({
      id: 'time_reminder',
      trigger: 'time',
      condition: { minutesRemaining: 10 },
      action: 'reminder',
      parameters: { message: '10 minutes remaining' }
    });

    // Type-specific automations
    switch (this.context.type) {
      case 'standup':
        this.automations.push({
          id: 'standup_timer',
          trigger: 'time',
          condition: { perPersonMinutes: 2 },
          action: 'reminder',
          parameters: { message: 'Keep updates brief - 2 minutes per person' }
        });
        break;
        
      case 'review':
        this.automations.push({
          id: 'feedback_prompt',
          trigger: 'silence',
          condition: { duration: 30 },
          action: 'poll',
          parameters: { question: 'Any questions or feedback?' }
        });
        break;
    }
  }

  // Start monitoring meeting
  private startMonitoring(): void {
    // Set up periodic checks
    setInterval(() => {
      this.checkAutomations();
      this.updateInsights();
    }, 30000); // Check every 30 seconds
  }

  // Check and execute automations
  private checkAutomations(): void {
    this.automations.forEach(automation => {
      if (this.shouldTriggerAutomation(automation)) {
        this.executeAutomation(automation);
      }
    });
  }

  // Check if automation should trigger
  private shouldTriggerAutomation(automation: AutomationRule): boolean {
    switch (automation.trigger) {
      case 'time':
        const elapsed = Date.now() - this.startTime.getTime();
        const elapsedMinutes = elapsed / (1000 * 60);
        return elapsedMinutes >= (this.context.duration - automation.condition.minutesRemaining);
        
      case 'silence':
        return this.detectSilence(automation.condition.duration);
        
      default:
        return false;
    }
  }

  // Execute automation
  private executeAutomation(automation: AutomationRule): void {
    switch (automation.action) {
      case 'reminder':
        this.sendReminder(automation.parameters.message);
        break;
      case 'poll':
        this.createPoll(automation.parameters.question);
        break;
      case 'breakout':
        this.createBreakoutRooms(automation.parameters);
        break;
    }
  }

  // Helper methods for event handling
  private handleParticipantJoined(event: any): AIAssistantAction[] {
    return [{
      id: 'welcome_participant',
      type: 'suggestion',
      priority: 'low',
      title: 'Welcome New Participant',
      description: `${event.participantName} has joined the meeting`,
      timestamp: new Date(),
      confidence: 0.9
    }];
  }

  private handleParticipantLeft(event: any): AIAssistantAction[] {
    const actions: AIAssistantAction[] = [];
    
    if (this.context.participants.length <= 2) {
      actions.push({
        id: 'low_attendance',
        type: 'insight',
        priority: 'medium',
        title: 'Low Attendance',
        description: 'Consider rescheduling if key participants are missing',
        timestamp: new Date(),
        confidence: 0.8
      });
    }
    
    return actions;
  }

  private handleMessageSent(event: any): AIAssistantAction[] {
    // Analyze message for action items, questions, etc.
    const message = event.message.toLowerCase();
    const actions: AIAssistantAction[] = [];
    
    if (message.includes('action item') || message.includes('todo')) {
      actions.push({
        id: 'action_item_detected',
        type: 'automation',
        priority: 'medium',
        title: 'Action Item Detected',
        description: 'Consider adding this to the meeting summary',
        timestamp: new Date(),
        confidence: 0.85
      });
    }
    
    return actions;
  }

  private handleScreenShareStarted(event: any): AIAssistantAction[] {
    return [{
      id: 'presentation_mode',
      type: 'automation',
      priority: 'low',
      title: 'Presentation Started',
      description: 'Switched to presentation mode',
      timestamp: new Date(),
      confidence: 1.0
    }];
  }

  private handleSilenceDetected(event: any): AIAssistantAction[] {
    return [{
      id: 'break_silence',
      type: 'suggestion',
      priority: 'medium',
      title: 'Break the Silence',
      description: 'Consider asking a question or moving to the next topic',
      timestamp: new Date(),
      confidence: 0.75
    }];
  }

  // Analysis methods
  private analyzeParticipation(): MeetingInsight | null {
    const speakingEvents = this.events.filter(e => e.type === 'speaking');
    const uniqueSpeakers = new Set(speakingEvents.map(e => e.participantId)).size;
    const participationRate = uniqueSpeakers / this.context.participants.length;
    
    if (participationRate < 0.5) {
      return {
        type: 'participation',
        severity: 'warning',
        message: 'Low participation detected',
        suggestion: 'Consider asking quiet participants for their input'
      };
    }
    
    return null;
  }

  private analyzeTimeManagement(): MeetingInsight | null {
    const elapsed = Date.now() - this.startTime.getTime();
    const elapsedMinutes = elapsed / (1000 * 60);
    const overrun = elapsedMinutes - this.context.duration;
    
    if (overrun > 5) {
      return {
        type: 'time',
        severity: 'critical',
        message: `Meeting is running ${Math.round(overrun)} minutes over`,
        suggestion: 'Consider wrapping up or scheduling a follow-up'
      };
    }
    
    return null;
  }

  private analyzeEngagement(): MeetingInsight | null {
    const recentEvents = this.events.filter(e => 
      Date.now() - e.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    
    if (recentEvents.length < 3) {
      return {
        type: 'engagement',
        severity: 'warning',
        message: 'Low activity in the last 5 minutes',
        suggestion: 'Consider taking a break or changing the topic'
      };
    }
    
    return null;
  }

  // Utility methods
  private detectLowEngagement(): boolean {
    const recentEvents = this.events.filter(e => 
      Date.now() - e.timestamp.getTime() < 3 * 60 * 1000 // Last 3 minutes
    );
    return recentEvents.length < 2;
  }

  private shouldTransitionAgenda(): boolean {
    // Logic to determine if it's time to move to next agenda item
    return false; // Placeholder
  }

  private detectSilence(duration: number): boolean {
    const lastSpeakingEvent = this.events
      .filter(e => e.type === 'speaking')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    if (!lastSpeakingEvent) return true;
    
    const silenceDuration = Date.now() - lastSpeakingEvent.timestamp.getTime();
    return silenceDuration > duration * 1000;
  }

  private async transitionAgenda(): Promise<void> {
    // Implementation for agenda transition
  }

  private sendReminder(message: string): void {
    // Implementation for sending reminders
  }

  private createPoll(question: string): void {
    // Implementation for creating polls
  }

  private createBreakoutRooms(parameters: any): void {
    // Implementation for creating breakout rooms
  }

  private updateInsights(): void {
    this.insights = this.generateInsights();
  }

  cleanup(): void {
    // Cleanup resources
  }
}

// Export singleton instance
export const aiMeetingAssistant = new AIMeetingAssistant();

// Predefined meeting templates
export const defaultTemplates: MeetingTemplate[] = [
  {
    id: 'standup',
    name: 'Daily Standup',
    type: 'standup',
    duration: 15,
    agenda: [
      {
        id: 'checkin',
        title: 'Check-in & Updates',
        duration: 10,
        type: 'discussion',
        objectives: ['Share yesterday\'s progress', 'Identify today\'s goals', 'Surface blockers']
      },
      {
        id: 'blockers',
        title: 'Blockers & Help Needed',
        duration: 5,
        type: 'discussion',
        objectives: ['Address blockers', 'Offer help', 'Plan solutions']
      }
    ],
    automations: [
      {
        id: 'time_per_person',
        trigger: 'time',
        condition: { perPersonMinutes: 2 },
        action: 'reminder',
        parameters: { message: 'Keep updates brief' }
      }
    ],
    participants: [
      {
        role: 'scrum_master',
        permissions: ['moderate', 'time_manage'],
        responsibilities: ['facilitate', 'track_time'],
        suggestedCount: 1
      },
      {
        role: 'team_member',
        permissions: ['speak', 'share_screen'],
        responsibilities: ['provide_updates', 'ask_for_help'],
        suggestedCount: 8
      }
    ]
  }
];