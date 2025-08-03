// Mock AI Service for demonstration purposes
// In a real implementation, this would integrate with actual AI services

export interface TranscriptionResult {
  id: string
  text: string
  speaker: string
  timestamp: number
  confidence: number
  language: string
}

export interface TranslationResult {
  id: string
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence: number
  timestamp: number
}

export interface AIInsight {
  id: string
  type: 'suggestion' | 'question' | 'action' | 'summary'
  content: string
  confidence: number
  timestamp: number
  relatedTranscripts?: string[]
}

export interface MeetingSummary {
  id: string
  title: string
  duration: number
  participants: string[]
  keyPoints: string[]
  actionItems: string[]
  decisions: string[]
  nextSteps: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  timestamp: number
}

export interface SupportedLanguage {
  code: string
  name: string
}

class AIService {
  private isTranscribing = false
  private recognition: any = null
  private transcriptionCallback: ((transcript: TranscriptionResult) => void) | null = null
  private errorCallback: ((error: Error) => void) | null = null

  // Supported languages for translation
  private supportedLanguages: SupportedLanguage[] = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
  ]

  /**
   * Initialize speech recognition
   */
  initializeSpeechRecognition() {
    if (typeof window === 'undefined') return null

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        console.warn('Speech recognition not supported in this browser')
        return null
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1
        const transcript = event.results[last][0].transcript
        const confidence = event.results[last][0].confidence || 0.8

        if (this.transcriptionCallback && event.results[last].isFinal) {
          const result: TranscriptionResult = {
            id: `transcript_${Date.now()}_${Math.random()}`,
            text: transcript,
            speaker: 'Speaker', // In real implementation, this would be detected
            timestamp: Date.now(),
            confidence,
            language: 'en'
          }
          this.transcriptionCallback(result)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (this.errorCallback) {
          this.errorCallback(new Error(`Speech recognition error: ${event.error}`))
        }
      }

      return recognition
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error)
      return null
    }
  }

  /**
   * Start transcription
   */
  async startTranscription(
    onTranscript: (transcript: TranscriptionResult) => void,
    onError: (error: Error) => void
  ): Promise<boolean> {
    try {
      this.transcriptionCallback = onTranscript
      this.errorCallback = onError

      this.recognition = this.initializeSpeechRecognition()
      
      if (!this.recognition) {
        // Fallback to mock transcription for demo
        this.startMockTranscription()
        return true
      }

      this.recognition.start()
      this.isTranscribing = true
      return true
    } catch (error) {
      console.error('Failed to start transcription:', error)
      onError(error as Error)
      return false
    }
  }

  /**
   * Stop transcription
   */
  stopTranscription() {
    this.isTranscribing = false
    if (this.recognition) {
      this.recognition.stop()
      this.recognition = null
    }
    this.transcriptionCallback = null
    this.errorCallback = null
  }

  /**
   * Mock transcription for demo purposes
   */
  private startMockTranscription() {
    const mockTranscripts = [
      "Welcome everyone to today's meeting.",
      "Let's start by reviewing the agenda.",
      "The first item is the quarterly review.",
      "We've seen significant growth this quarter.",
      "Our team has exceeded expectations.",
      "Let's discuss the next steps for the project.",
      "We need to finalize the timeline by Friday.",
      "Any questions or concerns about the proposal?",
    ]

    let index = 0
    const interval = setInterval(() => {
      if (!this.isTranscribing || index >= mockTranscripts.length) {
        clearInterval(interval)
        return
      }

      if (this.transcriptionCallback) {
        const result: TranscriptionResult = {
          id: `mock_transcript_${Date.now()}_${index}`,
          text: mockTranscripts[index],
          speaker: index % 2 === 0 ? 'Host' : 'Participant',
          timestamp: Date.now(),
          confidence: 0.85 + Math.random() * 0.15,
          language: 'en'
        }
        this.transcriptionCallback(result)
      }

      index++
    }, 3000 + Math.random() * 2000) // Random interval between 3-5 seconds
  }

  /**
   * Translate text to target language
   */
  async translateText(text: string, targetLanguage: string): Promise<TranslationResult | null> {
    try {
      // Mock translation - in real implementation, this would call a translation API
      const mockTranslations: { [key: string]: string } = {
        'es': 'Texto traducido al español',
        'fr': 'Texte traduit en français',
        'de': 'Ins Deutsche übersetzter Text',
        'it': 'Testo tradotto in italiano',
        'pt': 'Texto traduzido para português',
        'ru': 'Текст переведен на русский',
        'ja': '日本語に翻訳されたテキスト',
        'ko': '한국어로 번역된 텍스트',
        'zh': '翻译成中文的文本',
        'ar': 'النص المترجم إلى العربية',
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

      const result: TranslationResult = {
        id: `translation_${Date.now()}_${Math.random()}`,
        originalText: text,
        translatedText: mockTranslations[targetLanguage] || `Translated: ${text}`,
        sourceLanguage: 'en',
        targetLanguage,
        confidence: 0.9,
        timestamp: Date.now()
      }

      return result
    } catch (error) {
      console.error('Translation error:', error)
      return null
    }
  }

  /**
   * Generate real-time insights from transcripts
   */
  generateRealTimeInsights(transcripts: TranscriptionResult[]): AIInsight[] {
    if (transcripts.length === 0) return []

    const insights: AIInsight[] = []
    const recentText = transcripts.map(t => t.text).join(' ').toLowerCase()

    // Generate insights based on keywords and patterns
    if (recentText.includes('question') || recentText.includes('?')) {
      insights.push({
        id: `insight_${Date.now()}_question`,
        type: 'question',
        content: 'A question was asked. Consider pausing to ensure everyone understands.',
        confidence: 0.8,
        timestamp: Date.now(),
        relatedTranscripts: transcripts.slice(-2).map(t => t.id)
      })
    }

    if (recentText.includes('action') || recentText.includes('todo') || recentText.includes('task')) {
      insights.push({
        id: `insight_${Date.now()}_action`,
        type: 'action',
        content: 'Action items mentioned. Consider documenting these for follow-up.',
        confidence: 0.85,
        timestamp: Date.now(),
        relatedTranscripts: transcripts.slice(-1).map(t => t.id)
      })
    }

    if (recentText.includes('deadline') || recentText.includes('timeline') || recentText.includes('schedule')) {
      insights.push({
        id: `insight_${Date.now()}_suggestion`,
        type: 'suggestion',
        content: 'Timeline discussed. Consider adding calendar reminders for mentioned dates.',
        confidence: 0.75,
        timestamp: Date.now(),
        relatedTranscripts: transcripts.slice(-1).map(t => t.id)
      })
    }

    return insights
  }

  /**
   * Generate meeting summary
   */
  async generateMeetingSummary(
    transcripts: TranscriptionResult[],
    duration: number,
    participants: string[]
  ): Promise<MeetingSummary> {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    const allText = transcripts.map(t => t.text).join(' ')
    
    // Mock summary generation based on transcript content
    const keyPoints = [
      'Quarterly review completed with positive results',
      'Team exceeded performance expectations',
      'New project timeline discussed and approved',
      'Budget allocation for next quarter finalized'
    ]

    const actionItems = [
      'Finalize project timeline by Friday',
      'Schedule follow-up meeting for next week',
      'Prepare quarterly report for stakeholders',
      'Update team on new procedures'
    ]

    const decisions = [
      'Approved budget increase for Q2',
      'Decided to extend project deadline by one week',
      'Agreed to hire additional team member'
    ]

    const nextSteps = [
      'Send meeting notes to all participants',
      'Schedule individual check-ins with team members',
      'Begin preparation for next quarterly review'
    ]

    // Simple sentiment analysis based on keywords
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
    const positiveWords = ['great', 'excellent', 'success', 'good', 'positive', 'exceeded']
    const negativeWords = ['problem', 'issue', 'concern', 'delay', 'behind', 'difficult']
    
    const positiveCount = positiveWords.filter(word => allText.toLowerCase().includes(word)).length
    const negativeCount = negativeWords.filter(word => allText.toLowerCase().includes(word)).length
    
    if (positiveCount > negativeCount) sentiment = 'positive'
    else if (negativeCount > positiveCount) sentiment = 'negative'

    return {
      id: `summary_${Date.now()}`,
      title: 'Meeting Summary',
      duration,
      participants,
      keyPoints,
      actionItems,
      decisions,
      nextSteps,
      sentiment,
      timestamp: Date.now()
    }
  }

  /**
   * Get supported languages for translation
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return this.supportedLanguages
  }
}

export const aiService = new AIService()