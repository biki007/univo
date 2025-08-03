// Meeting Recording Service for Univo
// Handles video/audio recording and file storage

export interface RecordingOptions {
  video: boolean;
  audio: boolean;
  quality: 'low' | 'medium' | 'high';
  format: 'webm' | 'mp4';
}

export interface RecordingMetadata {
  id: string;
  meetingId: string;
  title: string;
  duration: number;
  size: number;
  format: string;
  quality: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
  url?: string;
  thumbnailUrl?: string;
}

export interface RecordingChunk {
  data: Blob;
  timestamp: number;
  type: 'video' | 'audio';
}

class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private startTime: number = 0;
  private recordingOptions: RecordingOptions = {
    video: true,
    audio: true,
    quality: 'medium',
    format: 'webm'
  };

  // Initialize recording with media streams
  async initializeRecording(
    videoStream: MediaStream | null,
    audioStream: MediaStream | null,
    options: Partial<RecordingOptions> = {}
  ): Promise<boolean> {
    try {
      this.recordingOptions = { ...this.recordingOptions, ...options };
      
      // Combine video and audio streams
      const combinedStream = new MediaStream();
      
      if (videoStream && this.recordingOptions.video) {
        videoStream.getVideoTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      }
      
      if (audioStream && this.recordingOptions.audio) {
        audioStream.getAudioTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      }

      if (combinedStream.getTracks().length === 0) {
        throw new Error('No media tracks available for recording');
      }

      // Configure MediaRecorder options based on quality
      const mimeType = this.getMimeType();
      const options_recorder: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: this.getVideoBitrate(),
        audioBitsPerSecond: this.getAudioBitrate(),
      };

      this.mediaRecorder = new MediaRecorder(combinedStream, options_recorder);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      return true;
    } catch (error) {
      console.error('Failed to initialize recording:', error);
      return false;
    }
  }

  // Start recording
  async startRecording(): Promise<boolean> {
    if (!this.mediaRecorder || this.isRecording) {
      return false;
    }

    try {
      this.recordedChunks = [];
      this.startTime = Date.now();
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  // Stop recording
  async stopRecording(): Promise<Blob | null> {
    if (!this.mediaRecorder || !this.isRecording) {
      return null;
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: this.getMimeType()
        });
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder!.stop();
    });
  }

  // Pause recording
  pauseRecording(): boolean {
    if (!this.mediaRecorder || !this.isRecording) {
      return false;
    }

    try {
      this.mediaRecorder.pause();
      return true;
    } catch (error) {
      console.error('Failed to pause recording:', error);
      return false;
    }
  }

  // Resume recording
  resumeRecording(): boolean {
    if (!this.mediaRecorder || !this.isRecording) {
      return false;
    }

    try {
      this.mediaRecorder.resume();
      return true;
    } catch (error) {
      console.error('Failed to resume recording:', error);
      return false;
    }
  }

  // Get recording duration
  getRecordingDuration(): number {
    if (!this.isRecording) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  // Get recording status
  getRecordingStatus(): {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    size: number;
  } {
    return {
      isRecording: this.isRecording,
      isPaused: this.mediaRecorder?.state === 'paused',
      duration: this.getRecordingDuration(),
      size: this.recordedChunks.reduce((total, chunk) => total + chunk.size, 0)
    };
  }

  // Save recording to local storage (for demo purposes)
  async saveRecordingLocally(
    blob: Blob,
    metadata: Omit<RecordingMetadata, 'id' | 'url' | 'size' | 'endTime'>
  ): Promise<RecordingMetadata> {
    const id = `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const url = URL.createObjectURL(blob);
    
    const recordingMetadata: RecordingMetadata = {
      ...metadata,
      id,
      url,
      size: blob.size,
      endTime: new Date(),
    };

    // Store metadata in localStorage (in production, use proper database)
    const existingRecordings = this.getStoredRecordings();
    existingRecordings.push(recordingMetadata);
    localStorage.setItem('univo_recordings', JSON.stringify(existingRecordings));

    return recordingMetadata;
  }

  // Get stored recordings
  getStoredRecordings(): RecordingMetadata[] {
    try {
      const stored = localStorage.getItem('univo_recordings');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored recordings:', error);
      return [];
    }
  }

  // Delete recording
  deleteRecording(recordingId: string): boolean {
    try {
      const recordings = this.getStoredRecordings();
      const recording = recordings.find(r => r.id === recordingId);
      
      if (recording?.url) {
        URL.revokeObjectURL(recording.url);
      }
      
      const updatedRecordings = recordings.filter(r => r.id !== recordingId);
      localStorage.setItem('univo_recordings', JSON.stringify(updatedRecordings));
      
      return true;
    } catch (error) {
      console.error('Failed to delete recording:', error);
      return false;
    }
  }

  // Download recording
  downloadRecording(recording: RecordingMetadata): void {
    if (!recording.url) return;

    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `${recording.title.replace(/[^a-z0-9]/gi, '_')}_${recording.id}.${recording.format}`;
    a.click();
  }

  // Generate thumbnail from video blob
  async generateThumbnail(videoBlob: Blob): Promise<string | null> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(null);
        return;
      }

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = Math.min(5, video.duration / 2); // Seek to middle or 5 seconds
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        URL.revokeObjectURL(video.src);
        resolve(thumbnailUrl);
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve(null);
      };

      video.src = URL.createObjectURL(videoBlob);
      video.load();
    });
  }

  // Helper methods
  private getMimeType(): string {
    const format = this.recordingOptions.format;
    
    if (format === 'mp4') {
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        return 'video/mp4';
      }
    }
    
    // Fallback to WebM
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      return 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      return 'video/webm;codecs=vp8';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      return 'video/webm';
    }
    
    return 'video/webm';
  }

  private getVideoBitrate(): number {
    switch (this.recordingOptions.quality) {
      case 'low': return 500000; // 500 kbps
      case 'medium': return 1500000; // 1.5 Mbps
      case 'high': return 4000000; // 4 Mbps
      default: return 1500000;
    }
  }

  private getAudioBitrate(): number {
    switch (this.recordingOptions.quality) {
      case 'low': return 64000; // 64 kbps
      case 'medium': return 128000; // 128 kbps
      case 'high': return 192000; // 192 kbps
      default: return 128000;
    }
  }

  // Check browser support
  static isRecordingSupported(): boolean {
    return typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm');
  }

  // Get supported formats
  static getSupportedFormats(): string[] {
    const formats = [];
    
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      formats.push('webm (VP9)');
    }
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      formats.push('webm (VP8)');
    }
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      formats.push('mp4');
    }
    
    return formats;
  }

  // Cleanup resources
  cleanup(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }
}

// Export singleton instance
export const recordingService = new RecordingService();

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};