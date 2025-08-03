// Video Effects Service for Univo
// Handles virtual backgrounds, filters, and video processing

export interface VirtualBackground {
  id: string;
  name: string;
  type: 'image' | 'video' | 'blur' | 'none';
  url?: string;
  thumbnail: string;
  category: 'office' | 'nature' | 'abstract' | 'custom';
}

export interface VideoFilter {
  id: string;
  name: string;
  type: 'color' | 'artistic' | 'beauty' | 'fun';
  intensity: number; // 0-100
  parameters: Record<string, number>;
}

export interface VideoEffectSettings {
  background: VirtualBackground | null;
  filter: VideoFilter | null;
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  blur: number; // 0-10
  flipHorizontal: boolean;
  enableNoiseReduction: boolean;
  enableAutoFraming: boolean;
}

class VideoEffectsService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private outputStream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private isProcessing = false;
  private currentSettings: VideoEffectSettings = {
    background: null,
    filter: null,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    flipHorizontal: false,
    enableNoiseReduction: false,
    enableAutoFraming: false,
  };

  // Predefined virtual backgrounds
  private virtualBackgrounds: VirtualBackground[] = [
    {
      id: 'none',
      name: 'None',
      type: 'none',
      thumbnail: '/backgrounds/none.jpg',
      category: 'office'
    },
    {
      id: 'blur',
      name: 'Blur Background',
      type: 'blur',
      thumbnail: '/backgrounds/blur.jpg',
      category: 'office'
    },
    {
      id: 'office-1',
      name: 'Modern Office',
      type: 'image',
      url: '/backgrounds/office-1.jpg',
      thumbnail: '/backgrounds/office-1-thumb.jpg',
      category: 'office'
    },
    {
      id: 'office-2',
      name: 'Conference Room',
      type: 'image',
      url: '/backgrounds/office-2.jpg',
      thumbnail: '/backgrounds/office-2-thumb.jpg',
      category: 'office'
    },
    {
      id: 'nature-1',
      name: 'Mountain View',
      type: 'image',
      url: '/backgrounds/nature-1.jpg',
      thumbnail: '/backgrounds/nature-1-thumb.jpg',
      category: 'nature'
    },
    {
      id: 'nature-2',
      name: 'Beach Sunset',
      type: 'image',
      url: '/backgrounds/nature-2.jpg',
      thumbnail: '/backgrounds/nature-2-thumb.jpg',
      category: 'nature'
    },
    {
      id: 'abstract-1',
      name: 'Geometric Pattern',
      type: 'image',
      url: '/backgrounds/abstract-1.jpg',
      thumbnail: '/backgrounds/abstract-1-thumb.jpg',
      category: 'abstract'
    }
  ];

  // Predefined video filters
  private videoFilters: VideoFilter[] = [
    {
      id: 'none',
      name: 'None',
      type: 'color',
      intensity: 0,
      parameters: {}
    },
    {
      id: 'vintage',
      name: 'Vintage',
      type: 'artistic',
      intensity: 70,
      parameters: { sepia: 0.8, contrast: 1.2, brightness: 0.9 }
    },
    {
      id: 'black-white',
      name: 'Black & White',
      type: 'artistic',
      intensity: 100,
      parameters: { grayscale: 1.0 }
    },
    {
      id: 'warm',
      name: 'Warm',
      type: 'color',
      intensity: 50,
      parameters: { temperature: 1.2, tint: 1.1 }
    },
    {
      id: 'cool',
      name: 'Cool',
      type: 'color',
      intensity: 50,
      parameters: { temperature: 0.8, tint: 0.9 }
    },
    {
      id: 'beauty',
      name: 'Beauty',
      type: 'beauty',
      intensity: 30,
      parameters: { smoothing: 0.3, brightening: 0.2 }
    }
  ];

  // Initialize video effects processing
  async initialize(videoStream: MediaStream): Promise<MediaStream | null> {
    try {
      // Create canvas for processing
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      
      if (!this.ctx) {
        throw new Error('Could not get canvas context');
      }

      // Create video element
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = videoStream;
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;
      this.videoElement.playsInline = true;

      // Wait for video to load
      await new Promise((resolve) => {
        this.videoElement!.onloadedmetadata = resolve;
      });

      // Set canvas dimensions
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;

      // Create output stream
      this.outputStream = this.canvas.captureStream(30);

      // Copy audio tracks from original stream
      const audioTracks = videoStream.getAudioTracks();
      audioTracks.forEach(track => {
        this.outputStream!.addTrack(track);
      });

      return this.outputStream;
    } catch (error) {
      console.error('Failed to initialize video effects:', error);
      return null;
    }
  }

  // Start processing video effects
  startProcessing(): void {
    if (this.isProcessing || !this.canvas || !this.ctx || !this.videoElement) {
      return;
    }

    this.isProcessing = true;
    this.processFrame();
  }

  // Stop processing video effects
  stopProcessing(): void {
    this.isProcessing = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // Process each video frame
  private processFrame(): void {
    if (!this.isProcessing || !this.canvas || !this.ctx || !this.videoElement) {
      return;
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply horizontal flip if enabled
    if (this.currentSettings.flipHorizontal) {
      this.ctx.save();
      this.ctx.scale(-1, 1);
      this.ctx.translate(-this.canvas.width, 0);
    }

    // Draw video frame
    this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

    // Restore context if flipped
    if (this.currentSettings.flipHorizontal) {
      this.ctx.restore();
    }

    // Apply virtual background
    this.applyVirtualBackground();

    // Apply video filters
    this.applyVideoFilters();

    // Apply color adjustments
    this.applyColorAdjustments();

    // Apply blur if needed
    if (this.currentSettings.blur > 0) {
      this.applyBlur();
    }

    // Schedule next frame
    this.animationFrame = requestAnimationFrame(() => this.processFrame());
  }

  // Apply virtual background
  private applyVirtualBackground(): void {
    if (!this.currentSettings.background || !this.ctx || !this.canvas) {
      return;
    }

    const bg = this.currentSettings.background;

    switch (bg.type) {
      case 'blur':
        this.applyBackgroundBlur();
        break;
      case 'image':
        this.applyImageBackground(bg);
        break;
      case 'video':
        this.applyVideoBackground(bg);
        break;
    }
  }

  // Apply background blur effect
  private applyBackgroundBlur(): void {
    if (!this.ctx || !this.canvas) return;

    // Simple background blur implementation
    // In production, this would use more sophisticated person segmentation
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const blurredData = this.gaussianBlur(imageData, 10);
    this.ctx.putImageData(blurredData, 0, 0);
  }

  // Apply image background
  private applyImageBackground(background: VirtualBackground): void {
    if (!this.ctx || !this.canvas || !background.url) return;

    // In production, this would use person segmentation to replace only the background
    // For now, we'll create a simple overlay effect
    const img = new Image();
    img.onload = () => {
      if (this.ctx && this.canvas) {
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'source-over';
      }
    };
    img.src = background.url;
  }

  // Apply video background
  private applyVideoBackground(background: VirtualBackground): void {
    // Similar to image background but with video element
    // Implementation would be more complex for video backgrounds
  }

  // Apply video filters
  private applyVideoFilters(): void {
    if (!this.currentSettings.filter || !this.ctx || !this.canvas) {
      return;
    }

    const filter = this.currentSettings.filter;
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    switch (filter.type) {
      case 'artistic':
        this.applyArtisticFilter(data, filter);
        break;
      case 'color':
        this.applyColorFilter(data, filter);
        break;
      case 'beauty':
        this.applyBeautyFilter(data, filter);
        break;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  // Apply artistic filters
  private applyArtisticFilter(data: Uint8ClampedArray, filter: VideoFilter): void {
    const intensity = filter.intensity / 100;

    if (filter.parameters.grayscale) {
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = data[i + 1] = data[i + 2] = gray * intensity + data[i] * (1 - intensity);
      }
    }

    if (filter.parameters.sepia) {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
    }
  }

  // Apply color filters
  private applyColorFilter(data: Uint8ClampedArray, filter: VideoFilter): void {
    const { temperature = 1, tint = 1 } = filter.parameters;
    const intensity = filter.intensity / 100;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * temperature * intensity + data[i] * (1 - intensity));
      data[i + 1] = Math.min(255, data[i + 1] * tint * intensity + data[i + 1] * (1 - intensity));
    }
  }

  // Apply beauty filters
  private applyBeautyFilter(data: Uint8ClampedArray, filter: VideoFilter): void {
    const { smoothing = 0, brightening = 0 } = filter.parameters;
    const intensity = filter.intensity / 100;

    // Simple brightening effect
    if (brightening > 0) {
      for (let i = 0; i < data.length; i += 4) {
        const brighten = brightening * intensity * 255;
        data[i] = Math.min(255, data[i] + brighten);
        data[i + 1] = Math.min(255, data[i + 1] + brighten);
        data[i + 2] = Math.min(255, data[i + 2] + brighten);
      }
    }
  }

  // Apply color adjustments
  private applyColorAdjustments(): void {
    if (!this.ctx || !this.canvas) return;

    const { brightness, contrast, saturation } = this.currentSettings;
    
    if (brightness !== 0 || contrast !== 0 || saturation !== 0) {
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        if (brightness !== 0) {
          const brightnessValue = brightness * 2.55;
          data[i] = Math.max(0, Math.min(255, data[i] + brightnessValue));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightnessValue));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightnessValue));
        }

        // Apply contrast
        if (contrast !== 0) {
          const contrastValue = (contrast + 100) / 100;
          data[i] = Math.max(0, Math.min(255, ((data[i] - 128) * contrastValue) + 128));
          data[i + 1] = Math.max(0, Math.min(255, ((data[i + 1] - 128) * contrastValue) + 128));
          data[i + 2] = Math.max(0, Math.min(255, ((data[i + 2] - 128) * contrastValue) + 128));
        }
      }

      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  // Apply blur effect
  private applyBlur(): void {
    if (!this.ctx || !this.canvas) return;

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const blurredData = this.gaussianBlur(imageData, this.currentSettings.blur);
    this.ctx.putImageData(blurredData, 0, 0);
  }

  // Gaussian blur implementation
  private gaussianBlur(imageData: ImageData, radius: number): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    // Simple box blur approximation of Gaussian blur
    for (let i = 0; i < radius; i++) {
      this.boxBlur(data, width, height, (radius - i - 1) / radius);
    }

    return new ImageData(data, width, height);
  }

  // Box blur helper
  private boxBlur(data: Uint8ClampedArray, width: number, height: number, radius: number): void {
    const r = Math.floor(radius);
    if (r < 1) return;

    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
        let count = 0;

        for (let dx = -r; dx <= r; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const idx = (y * width + nx) * 4;
          totalR += data[idx];
          totalG += data[idx + 1];
          totalB += data[idx + 2];
          totalA += data[idx + 3];
          count++;
        }

        const idx = (y * width + x) * 4;
        data[idx] = totalR / count;
        data[idx + 1] = totalG / count;
        data[idx + 2] = totalB / count;
        data[idx + 3] = totalA / count;
      }
    }
  }

  // Update settings
  updateSettings(settings: Partial<VideoEffectSettings>): void {
    this.currentSettings = { ...this.currentSettings, ...settings };
  }

  // Get available backgrounds
  getVirtualBackgrounds(): VirtualBackground[] {
    return this.virtualBackgrounds;
  }

  // Get available filters
  getVideoFilters(): VideoFilter[] {
    return this.videoFilters;
  }

  // Add custom background
  addCustomBackground(background: Omit<VirtualBackground, 'id'>): VirtualBackground {
    const customBackground: VirtualBackground = {
      ...background,
      id: `custom_${Date.now()}`,
      category: 'custom'
    };
    
    this.virtualBackgrounds.push(customBackground);
    return customBackground;
  }

  // Remove custom background
  removeCustomBackground(id: string): boolean {
    const index = this.virtualBackgrounds.findIndex(bg => bg.id === id && bg.category === 'custom');
    if (index > -1) {
      this.virtualBackgrounds.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get current settings
  getCurrentSettings(): VideoEffectSettings {
    return { ...this.currentSettings };
  }

  // Cleanup resources
  cleanup(): void {
    this.stopProcessing();
    
    if (this.outputStream) {
      this.outputStream.getTracks().forEach(track => track.stop());
      this.outputStream = null;
    }
    
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    
    this.canvas = null;
    this.ctx = null;
  }

  // Check browser support
  static isSupported(): boolean {
    return !!(
      'captureStream' in HTMLCanvasElement.prototype &&
      CanvasRenderingContext2D &&
      MediaStream
    );
  }
}

// Export singleton instance
export const videoEffectsService = new VideoEffectsService();

// Utility functions
export const getBackgroundsByCategory = (backgrounds: VirtualBackground[], category: string): VirtualBackground[] => {
  return backgrounds.filter(bg => bg.category === category);
};

export const getFiltersByType = (filters: VideoFilter[], type: string): VideoFilter[] => {
  return filters.filter(filter => filter.type === type);
};