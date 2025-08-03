// Advanced Breakout Rooms Service for Univo
// Handles dynamic room allocation, intelligent grouping, and automated management

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: BreakoutParticipant[];
  maxParticipants: number;
  topic?: string;
  duration: number; // in minutes
  status: 'waiting' | 'active' | 'completed' | 'closed';
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  facilitator?: string;
  settings: BreakoutRoomSettings;
  analytics: BreakoutAnalytics;
}

export interface BreakoutParticipant {
  userId: string;
  name: string;
  role: 'participant' | 'facilitator' | 'observer';
  joinedAt?: Date;
  leftAt?: Date;
  isActive: boolean;
  preferences?: ParticipantPreferences;
}

export interface BreakoutRoomSettings {
  allowParticipantSelfAssign: boolean;
  allowRoomSwitching: boolean;
  autoReturnToMain: boolean;
  recordSessions: boolean;
  enableChat: boolean;
  enableScreenShare: boolean;
  enableWhiteboard: boolean;
  timeWarnings: number[]; // minutes before end
  maxDuration: number;
}

export interface BreakoutAnalytics {
  participationTime: Record<string, number>;
  messageCount: number;
  screenShareTime: number;
  whiteboardActivity: number;
  engagementScore: number;
  completionRate: number;
}

export interface ParticipantPreferences {
  preferredGroupSize: number;
  avoidUsers?: string[];
  preferredUsers?: string[];
  skills?: string[];
  interests?: string[];
  workingStyle: 'collaborative' | 'independent' | 'leadership' | 'supportive';
}

export interface GroupingStrategy {
  type: 'random' | 'balanced' | 'skill_based' | 'preference_based' | 'custom';
  parameters: Record<string, any>;
  constraints?: GroupingConstraint[];
}

export interface GroupingConstraint {
  type: 'max_size' | 'min_size' | 'skill_balance' | 'avoid_pairs' | 'ensure_pairs';
  value: any;
}

export interface BreakoutSession {
  id: string;
  mainMeetingId: string;
  title: string;
  description?: string;
  rooms: BreakoutRoom[];
  strategy: GroupingStrategy;
  duration: number;
  status: 'planning' | 'active' | 'completed';
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  settings: BreakoutRoomSettings;
}

class BreakoutRoomsService {
  private activeSessions: Map<string, BreakoutSession> = new Map();
  private roomConnections: Map<string, any> = new Map(); // WebRTC connections
  private groupingAlgorithms: Map<string, (participants: BreakoutParticipant[], strategy: GroupingStrategy) => BreakoutRoom[]> = new Map();

  constructor() {
    this.initializeGroupingAlgorithms();
  }

  // Create a new breakout session
  async createBreakoutSession(
    mainMeetingId: string,
    participants: BreakoutParticipant[],
    options: {
      title: string;
      description?: string;
      roomCount?: number;
      duration: number;
      strategy: GroupingStrategy;
      settings: Partial<BreakoutRoomSettings>;
    }
  ): Promise<BreakoutSession> {
    const sessionId = `breakout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultSettings: BreakoutRoomSettings = {
      allowParticipantSelfAssign: false,
      allowRoomSwitching: true,
      autoReturnToMain: true,
      recordSessions: false,
      enableChat: true,
      enableScreenShare: true,
      enableWhiteboard: true,
      timeWarnings: [5, 2, 1],
      maxDuration: 60,
      ...options.settings
    };

    // Generate rooms based on strategy
    const rooms = await this.generateRooms(participants, options.strategy, options.roomCount);

    const session: BreakoutSession = {
      id: sessionId,
      mainMeetingId,
      title: options.title,
      description: options.description,
      rooms,
      strategy: options.strategy,
      duration: options.duration,
      status: 'planning',
      createdBy: 'system', // Would be actual user ID
      createdAt: new Date(),
      settings: defaultSettings
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  // Start breakout session
  async startBreakoutSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'planning') {
      return false;
    }

    try {
      // Initialize rooms
      for (const room of session.rooms) {
        await this.initializeRoom(room);
      }

      // Update session status
      session.status = 'active';
      session.startedAt = new Date();

      // Set up automatic return timer
      if (session.settings.autoReturnToMain) {
        setTimeout(() => {
          this.endBreakoutSession(sessionId);
        }, session.duration * 60 * 1000);
      }

      // Set up time warnings
      session.settings.timeWarnings.forEach(warning => {
        const warningTime = (session.duration - warning) * 60 * 1000;
        setTimeout(() => {
          this.sendTimeWarning(sessionId, warning);
        }, warningTime);
      });

      return true;
    } catch (error) {
      console.error('Failed to start breakout session:', error);
      return false;
    }
  }

  // End breakout session
  async endBreakoutSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    try {
      // Close all rooms
      for (const room of session.rooms) {
        await this.closeRoom(room.id);
      }

      // Update session status
      session.status = 'completed';
      session.endedAt = new Date();

      // Generate session analytics
      await this.generateSessionAnalytics(session);

      // Return participants to main room
      if (session.settings.autoReturnToMain) {
        await this.returnParticipantsToMain(session);
      }

      return true;
    } catch (error) {
      console.error('Failed to end breakout session:', error);
      return false;
    }
  }

  // Assign participant to room
  async assignParticipantToRoom(sessionId: string, userId: string, roomId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    const room = session.rooms.find(r => r.id === roomId);
    if (!room || room.participants.length >= room.maxParticipants) {
      return false;
    }

    // Remove from current room
    await this.removeParticipantFromAllRooms(sessionId, userId);

    // Add to new room
    const participant = session.rooms
      .flatMap(r => r.participants)
      .find(p => p.userId === userId);

    if (participant) {
      participant.joinedAt = new Date();
      participant.isActive = true;
      room.participants.push(participant);

      // Establish WebRTC connection
      await this.connectParticipantToRoom(userId, roomId);

      return true;
    }

    return false;
  }

  // Move participant between rooms
  async moveParticipant(sessionId: string, userId: string, fromRoomId: string, toRoomId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.settings.allowRoomSwitching) {
      return false;
    }

    const fromRoom = session.rooms.find(r => r.id === fromRoomId);
    const toRoom = session.rooms.find(r => r.id === toRoomId);

    if (!fromRoom || !toRoom || toRoom.participants.length >= toRoom.maxParticipants) {
      return false;
    }

    // Remove from current room
    const participantIndex = fromRoom.participants.findIndex(p => p.userId === userId);
    if (participantIndex === -1) return false;

    const participant = fromRoom.participants.splice(participantIndex, 1)[0];
    participant.leftAt = new Date();

    // Add to new room
    participant.joinedAt = new Date();
    participant.isActive = true;
    toRoom.participants.push(participant);

    // Update connections
    await this.disconnectParticipantFromRoom(userId, fromRoomId);
    await this.connectParticipantToRoom(userId, toRoomId);

    return true;
  }

  // Dynamically rebalance rooms
  async rebalanceRooms(sessionId: string, newStrategy?: GroupingStrategy): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    try {
      // Get all participants
      const allParticipants = session.rooms.flatMap(room => room.participants);
      
      // Use new strategy or existing one
      const strategy = newStrategy || session.strategy;
      
      // Generate new room assignments
      const newRooms = await this.generateRooms(allParticipants, strategy, session.rooms.length);
      
      // Gradually move participants to minimize disruption
      await this.gradualRoomTransition(session, newRooms);
      
      return true;
    } catch (error) {
      console.error('Failed to rebalance rooms:', error);
      return false;
    }
  }

  // Get session analytics
  getSessionAnalytics(sessionId: string): any {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    return {
      session: {
        id: session.id,
        title: session.title,
        duration: session.duration,
        status: session.status,
        participantCount: session.rooms.reduce((sum, room) => sum + room.participants.length, 0),
        roomCount: session.rooms.length
      },
      rooms: session.rooms.map(room => ({
        id: room.id,
        name: room.name,
        participantCount: room.participants.length,
        analytics: room.analytics
      })),
      overall: this.calculateOverallAnalytics(session)
    };
  }

  // Generate rooms based on strategy
  private async generateRooms(
    participants: BreakoutParticipant[],
    strategy: GroupingStrategy,
    roomCount?: number
  ): Promise<BreakoutRoom[]> {
    const algorithm = this.groupingAlgorithms.get(strategy.type);
    if (!algorithm) {
      throw new Error(`Unknown grouping strategy: ${strategy.type}`);
    }

    let rooms = algorithm(participants, strategy);

    // Apply room count constraint if specified
    if (roomCount && rooms.length !== roomCount) {
      rooms = this.adjustRoomCount(rooms, roomCount);
    }

    // Apply constraints
    if (strategy.constraints) {
      rooms = this.applyConstraints(rooms, strategy.constraints);
    }

    return rooms;
  }

  // Initialize grouping algorithms
  private initializeGroupingAlgorithms(): void {
    // Random grouping
    this.groupingAlgorithms.set('random', (participants, strategy) => {
      const roomSize = strategy.parameters.roomSize || Math.ceil(participants.length / (strategy.parameters.roomCount || 3));
      const rooms: BreakoutRoom[] = [];
      const shuffled = [...participants].sort(() => Math.random() - 0.5);

      for (let i = 0; i < shuffled.length; i += roomSize) {
        const roomParticipants = shuffled.slice(i, i + roomSize);
        rooms.push(this.createRoom(`Room ${rooms.length + 1}`, roomParticipants));
      }

      return rooms;
    });

    // Balanced grouping (by skills, experience, etc.)
    this.groupingAlgorithms.set('balanced', (participants, strategy) => {
      const roomCount = strategy.parameters.roomCount || 3;
      const rooms: BreakoutRoom[] = [];

      // Initialize rooms
      for (let i = 0; i < roomCount; i++) {
        rooms.push(this.createRoom(`Room ${i + 1}`, []));
      }

      // Sort participants by balancing criteria
      const sorted = participants.sort((a, b) => {
        const aScore = this.calculateBalanceScore(a);
        const bScore = this.calculateBalanceScore(b);
        return bScore - aScore;
      });

      // Distribute participants round-robin style
      sorted.forEach((participant, index) => {
        const roomIndex = index % roomCount;
        rooms[roomIndex].participants.push(participant);
      });

      return rooms;
    });

    // Skill-based grouping
    this.groupingAlgorithms.set('skill_based', (participants, strategy) => {
      const skillGroups = this.groupBySkills(participants, strategy.parameters.skills || []);
      return skillGroups.map((group, index) => 
        this.createRoom(`${strategy.parameters.skills[index]} Group`, group)
      );
    });

    // Preference-based grouping
    this.groupingAlgorithms.set('preference_based', (participants, strategy) => {
      return this.createPreferenceBasedGroups(participants, strategy.parameters);
    });

    // Custom grouping (user-defined)
    this.groupingAlgorithms.set('custom', (participants, strategy) => {
      const customGroups = strategy.parameters.groups || [];
      return customGroups.map((group: any, index: number) => {
        const roomParticipants = participants.filter(p => group.participantIds.includes(p.userId));
        return this.createRoom(group.name || `Room ${index + 1}`, roomParticipants);
      });
    });
  }

  // Create a room
  private createRoom(name: string, participants: BreakoutParticipant[]): BreakoutRoom {
    return {
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      participants,
      maxParticipants: 8,
      duration: 30,
      status: 'waiting',
      createdAt: new Date(),
      settings: {
        allowParticipantSelfAssign: false,
        allowRoomSwitching: true,
        autoReturnToMain: true,
        recordSessions: false,
        enableChat: true,
        enableScreenShare: true,
        enableWhiteboard: true,
        timeWarnings: [5, 2, 1],
        maxDuration: 60
      },
      analytics: {
        participationTime: {},
        messageCount: 0,
        screenShareTime: 0,
        whiteboardActivity: 0,
        engagementScore: 0,
        completionRate: 0
      }
    };
  }

  // Calculate balance score for participant
  private calculateBalanceScore(participant: BreakoutParticipant): number {
    let score = 0;
    
    if (participant.preferences?.skills) {
      score += participant.preferences.skills.length * 10;
    }
    
    switch (participant.preferences?.workingStyle) {
      case 'leadership': score += 50; break;
      case 'collaborative': score += 30; break;
      case 'supportive': score += 20; break;
      case 'independent': score += 10; break;
    }
    
    return score;
  }

  // Group participants by skills
  private groupBySkills(participants: BreakoutParticipant[], skills: string[]): BreakoutParticipant[][] {
    const groups: BreakoutParticipant[][] = skills.map(() => []);
    
    participants.forEach(participant => {
      const participantSkills = participant.preferences?.skills || [];
      let bestMatch = 0;
      let bestMatchIndex = 0;
      
      skills.forEach((skill, index) => {
        const matches = participantSkills.filter(s => s.toLowerCase().includes(skill.toLowerCase())).length;
        if (matches > bestMatch) {
          bestMatch = matches;
          bestMatchIndex = index;
        }
      });
      
      groups[bestMatchIndex].push(participant);
    });
    
    return groups;
  }

  // Create preference-based groups
  private createPreferenceBasedGroups(participants: BreakoutParticipant[], parameters: any): BreakoutRoom[] {
    const rooms: BreakoutRoom[] = [];
    const unassigned = [...participants];
    
    while (unassigned.length > 0) {
      const seed = unassigned.shift()!;
      const roomParticipants = [seed];
      
      // Find compatible participants
      const compatible = unassigned.filter(p => this.areCompatible(seed, p));
      const roomSize = Math.min(parameters.maxRoomSize || 4, compatible.length + 1);
      
      for (let i = 0; i < roomSize - 1 && compatible.length > 0; i++) {
        const selected = compatible.shift()!;
        roomParticipants.push(selected);
        unassigned.splice(unassigned.indexOf(selected), 1);
      }
      
      rooms.push(this.createRoom(`Room ${rooms.length + 1}`, roomParticipants));
    }
    
    return rooms;
  }

  // Check if two participants are compatible
  private areCompatible(p1: BreakoutParticipant, p2: BreakoutParticipant): boolean {
    const prefs1 = p1.preferences;
    const prefs2 = p2.preferences;
    
    if (!prefs1 || !prefs2) return true;
    
    // Check avoid lists
    if (prefs1.avoidUsers?.includes(p2.userId) || prefs2.avoidUsers?.includes(p1.userId)) {
      return false;
    }
    
    // Check preferred users
    if (prefs1.preferredUsers?.includes(p2.userId) || prefs2.preferredUsers?.includes(p1.userId)) {
      return true;
    }
    
    // Check working style compatibility
    const compatibleStyles: Record<string, string[]> = {
      'leadership': ['supportive', 'collaborative'],
      'collaborative': ['collaborative', 'leadership', 'supportive'],
      'supportive': ['leadership', 'collaborative'],
      'independent': ['independent']
    };
    
    const style1 = prefs1.workingStyle || 'collaborative';
    const style2 = prefs2.workingStyle || 'collaborative';
    
    return compatibleStyles[style1]?.includes(style2) || false;
  }

  // Apply constraints to rooms
  private applyConstraints(rooms: BreakoutRoom[], constraints: GroupingConstraint[]): BreakoutRoom[] {
    let adjustedRooms = [...rooms];
    
    constraints.forEach(constraint => {
      switch (constraint.type) {
        case 'max_size':
          adjustedRooms = this.enforceMaxSize(adjustedRooms, constraint.value);
          break;
        case 'min_size':
          adjustedRooms = this.enforceMinSize(adjustedRooms, constraint.value);
          break;
        // Add more constraint types as needed
      }
    });
    
    return adjustedRooms;
  }

  // Enforce maximum room size
  private enforceMaxSize(rooms: BreakoutRoom[], maxSize: number): BreakoutRoom[] {
    const result: BreakoutRoom[] = [];
    
    rooms.forEach(room => {
      if (room.participants.length <= maxSize) {
        result.push(room);
      } else {
        // Split oversized room
        const chunks = this.chunkArray(room.participants, maxSize);
        chunks.forEach((chunk, index) => {
          result.push(this.createRoom(`${room.name} ${index + 1}`, chunk));
        });
      }
    });
    
    return result;
  }

  // Enforce minimum room size
  private enforceMinSize(rooms: BreakoutRoom[], minSize: number): BreakoutRoom[] {
    const result: BreakoutRoom[] = [];
    const undersized: BreakoutParticipant[] = [];
    
    rooms.forEach(room => {
      if (room.participants.length >= minSize) {
        result.push(room);
      } else {
        undersized.push(...room.participants);
      }
    });
    
    // Redistribute undersized participants
    if (undersized.length >= minSize) {
      const newRoom = this.createRoom('Merged Room', undersized);
      result.push(newRoom);
    } else if (result.length > 0) {
      // Add to existing rooms
      undersized.forEach((participant, index) => {
        const targetRoom = result[index % result.length];
        targetRoom.participants.push(participant);
      });
    }
    
    return result;
  }

  // Utility methods
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private adjustRoomCount(rooms: BreakoutRoom[], targetCount: number): BreakoutRoom[] {
    if (rooms.length === targetCount) return rooms;
    
    const allParticipants = rooms.flatMap(room => room.participants);
    const participantsPerRoom = Math.ceil(allParticipants.length / targetCount);
    const newRooms: BreakoutRoom[] = [];
    
    for (let i = 0; i < targetCount; i++) {
      const start = i * participantsPerRoom;
      const end = start + participantsPerRoom;
      const participants = allParticipants.slice(start, end);
      
      if (participants.length > 0) {
        newRooms.push(this.createRoom(`Room ${i + 1}`, participants));
      }
    }
    
    return newRooms;
  }

  // Room management methods
  private async initializeRoom(room: BreakoutRoom): Promise<void> {
    room.status = 'active';
    room.startedAt = new Date();
    
    // Initialize WebRTC connections for room participants
    // Implementation would depend on WebRTC setup
  }

  private async closeRoom(roomId: string): Promise<void> {
    // Close WebRTC connections and cleanup
    this.roomConnections.delete(roomId);
  }

  private async connectParticipantToRoom(userId: string, roomId: string): Promise<void> {
    // Establish WebRTC connection for participant in room
    // Implementation would depend on WebRTC setup
  }

  private async disconnectParticipantFromRoom(userId: string, roomId: string): Promise<void> {
    // Disconnect participant from room
    // Implementation would depend on WebRTC setup
  }

  private async removeParticipantFromAllRooms(sessionId: string, userId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.rooms.forEach(room => {
      const index = room.participants.findIndex(p => p.userId === userId);
      if (index !== -1) {
        room.participants[index].leftAt = new Date();
        room.participants[index].isActive = false;
        room.participants.splice(index, 1);
      }
    });
  }

  private async gradualRoomTransition(session: BreakoutSession, newRooms: BreakoutRoom[]): Promise<void> {
    // Implement gradual transition to minimize disruption
    // This would involve moving participants in batches with delays
  }

  private async returnParticipantsToMain(session: BreakoutSession): Promise<void> {
    // Return all participants to main meeting room
    // Implementation would depend on main meeting room setup
  }

  private sendTimeWarning(sessionId: string, minutesRemaining: number): void {
    // Send warning to all rooms in session
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.rooms.forEach(room => {
      // Send warning message to room participants
      console.log(`Time warning: ${minutesRemaining} minutes remaining in ${room.name}`);
    });
  }

  private async generateSessionAnalytics(session: BreakoutSession): Promise<void> {
    // Generate comprehensive analytics for the session
    session.rooms.forEach(room => {
      room.analytics.completionRate = room.participants.length > 0 ? 1 : 0;
      room.analytics.engagementScore = this.calculateRoomEngagement(room);
    });
  }

  private calculateRoomEngagement(room: BreakoutRoom): number {
    // Calculate engagement score based on various factors
    let score = 0;
    
    // Participation time factor
    const avgParticipationTime = Object.values(room.analytics.participationTime)
      .reduce((sum, time) => sum + time, 0) / room.participants.length;
    score += Math.min(avgParticipationTime / (room.duration * 60), 1) * 40;
    
    // Activity factors
    score += Math.min(room.analytics.messageCount / 10, 1) * 30;
    score += Math.min(room.analytics.whiteboardActivity / 5, 1) * 20;
    score += room.analytics.screenShareTime > 0 ? 10 : 0;
    
    return Math.round(score);
  }

  private calculateOverallAnalytics(session: BreakoutSession): any {
    const totalParticipants = session.rooms.reduce((sum, room) => sum + room.participants.length, 0);
    const avgEngagement = session.rooms.reduce((sum, room) => sum + room.analytics.engagementScore, 0) / session.rooms.length;
    
    return {
      totalParticipants,
      averageEngagement: Math.round(avgEngagement),
      completionRate: session.rooms.filter(room => room.analytics.completionRate > 0.8).length / session.rooms.length,
      totalMessages: session.rooms.reduce((sum, room) => sum + room.analytics.messageCount, 0),
      activeRooms: session.rooms.filter(room => room.status === 'active').length
    };
  }

  // Public methods for external access
  getActiveSession(sessionId: string): BreakoutSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  getAllActiveSessions(): BreakoutSession[] {
    return Array.from(this.activeSessions.values());
  }

  cleanup(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      // Cleanup all room connections
      session.rooms.forEach(room => {
        this.roomConnections.delete(room.id);
      });
      
      this.activeSessions.delete(sessionId);
    }
  }
}

// Export singleton instance
export const breakoutRoomsService = new BreakoutRoomsService();

// Utility functions
export const createDefaultGroupingStrategy = (type: GroupingStrategy['type'], roomCount: number = 3): GroupingStrategy => {
  const strategies: Record<string, GroupingStrategy> = {
    random: {
      type: 'random',
      parameters: { roomCount }
    },
    balanced: {
      type: 'balanced',
      parameters: { roomCount }
    },
    skill_based: {
      type: 'skill_based',
      parameters: { skills: ['technical', 'creative', 'analytical'] }
    },
    preference_based: {
      type: 'preference_based',
      parameters: { maxRoomSize: 4 }
    }
  };
  
  return strategies[type] || strategies.random;
};

export const validateBreakoutSession = (session: Partial<BreakoutSession>): string[] => {
  const errors: string[] = [];
  
  if (!session.title) errors.push('Session title is required');
  if (!session.duration || session.duration < 5) errors.push('Duration must be at least 5 minutes');
  if (!session.rooms || session.rooms.length === 0) errors.push('At least one room is required');
  
  return errors;
};