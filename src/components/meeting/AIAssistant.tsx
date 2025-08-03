'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  aiService, 
  TranscriptionResult, 
  TranslationResult, 
  MeetingSummary, 
  AIInsight 
} from '@/lib/ai-service';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  participants: string[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  meetingId,
  participants
}) => {
  const [activeTab, setActiveTab] = useState<'transcription' | 'translation' | 'insights' | 'summary'>('transcription');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptionResult[]>([]);
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [meetingSummary, setMeetingSummary] = useState<MeetingSummary | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const meetingStartTime = useRef(Date.now());

  // Auto-scroll transcripts
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

  // Generate insights from recent transcripts
  useEffect(() => {
    if (transcripts.length > 0) {
      const recentInsights = aiService.generateRealTimeInsights(transcripts.slice(-5));
      if (recentInsights.length > 0) {
        setInsights(prev => [...prev, ...recentInsights].slice(-20)); // Keep last 20 insights
      }
    }
  }, [transcripts]);

  const startTranscription = async () => {
    const success = await aiService.startTranscription(
      (transcript) => {
        setTranscripts(prev => [...prev, transcript]);
      },
      (error) => {
        console.error('Transcription error:', error);
        setIsTranscribing(false);
      }
    );

    if (success) {
      setIsTranscribing(true);
      recognitionRef.current = aiService.initializeSpeechRecognition();
    }
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    aiService.stopTranscription();
    setIsTranscribing(false);
  };

  const translateText = async (text: string) => {
    const result = await aiService.translateText(text, selectedLanguage);
    if (result) {
      setTranslations(prev => [...prev, result]);
    }
  };

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const duration = Math.floor((Date.now() - meetingStartTime.current) / 1000);
      const summary = await aiService.generateMeetingSummary(transcripts, duration, participants);
      setMeetingSummary(summary);
      setActiveTab('summary');
    } catch (error) {
      console.error('Summary generation error:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const clearTranscripts = () => {
    setTranscripts([]);
    setTranslations([]);
    setInsights([]);
  };

  const exportTranscripts = () => {
    const content = transcripts.map(t => 
      `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker}: ${t.text}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-transcript-${meetingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-4xl h-[80vh] bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
            <Badge variant={isTranscribing ? 'success' : 'secondary'}>
              {isTranscribing ? 'Recording' : 'Stopped'}
            </Badge>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          {[
            { id: 'transcription', label: 'Live Transcription', count: transcripts.length },
            { id: 'translation', label: 'Translation', count: translations.length },
            { id: 'insights', label: 'AI Insights', count: insights.length },
            { id: 'summary', label: 'Meeting Summary', count: meetingSummary ? 1 : 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Transcription Tab */}
          {activeTab === 'transcription' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={isTranscribing ? stopTranscription : startTranscription}
                    variant={isTranscribing ? 'destructive' : 'default'}
                    size="sm"
                  >
                    {isTranscribing ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                        Start Recording
                      </>
                    )}
                  </Button>
                  <Button onClick={clearTranscripts} variant="ghost" size="sm">
                    Clear
                  </Button>
                  <Button onClick={exportTranscripts} variant="ghost" size="sm" disabled={transcripts.length === 0}>
                    Export
                  </Button>
                </div>
              </div>
              
              <div 
                ref={transcriptContainerRef}
                className="flex-1 p-4 space-y-3 overflow-y-auto"
              >
                {transcripts.length === 0 ? (
                  <div className="mt-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <p>Click &quot;Start Recording&quot; to begin live transcription</p>
                  </div>
                ) : (
                  transcripts.map((transcript, index) => (
                    <div key={index} className="p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {transcript.speaker}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(transcript.timestamp).toLocaleTimeString()}
                          </span>
                          <Badge 
                            variant={transcript.confidence > 0.8 ? 'success' : 'warning'}
                            className="text-xs"
                          >
                            {Math.round(transcript.confidence * 100)}%
                          </Badge>
                          <Button
                            onClick={() => translateText(transcript.text)}
                            variant="ghost"
                            size="sm"
                            className="p-1 text-xs"
                          >
                            Translate
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-900">{transcript.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Translation Tab */}
          {activeTab === 'translation' && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    Target Language:
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                    title="Select target language for translation"
                  >
                    {aiService.getSupportedLanguages().map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {translations.length === 0 ? (
                  <div className="mt-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <p>Click &quot;Translate&quot; on any transcript to see translations here</p>
                  </div>
                ) : (
                  translations.map((translation, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="secondary">Original ({translation.sourceLanguage})</Badge>
                            <Badge variant="primary">Confidence: {Math.round(translation.confidence * 100)}%</Badge>
                          </div>
                          <p className="text-gray-700">{translation.originalText}</p>
                        </div>
                        <div>
                          <Badge variant="success">Translated ({translation.targetLanguage})</Badge>
                          <p className="mt-1 font-medium text-gray-900">{translation.translatedText}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="h-full p-4 space-y-3 overflow-y-auto">
              {insights.length === 0 ? (
                <div className="mt-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p>AI insights will appear here as the meeting progresses</p>
                </div>
              ) : (
                insights.map((insight, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        insight.type === 'suggestion' ? 'bg-blue-500' :
                        insight.type === 'question' ? 'bg-yellow-500' :
                        insight.type === 'action' ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(insight.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{insight.content}</p>
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Confidence: {Math.round(insight.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="h-full p-4 overflow-y-auto">
              <div className="mb-4">
                <Button
                  onClick={generateSummary}
                  disabled={transcripts.length === 0 || isGeneratingSummary}
                  className="w-full"
                >
                  {isGeneratingSummary ? (
                    <>
                      <svg className="w-4 h-4 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Summary...
                    </>
                  ) : (
                    'Generate Meeting Summary'
                  )}
                </Button>
              </div>

              {meetingSummary ? (
                <div className="space-y-6">
                  <Card className="p-4">
                    <h3 className="mb-3 text-lg font-semibold">{meetingSummary.title}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Duration:</span>
                        <span className="ml-2">{Math.floor(meetingSummary.duration / 60)}m {meetingSummary.duration % 60}s</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Participants:</span>
                        <span className="ml-2">{meetingSummary.participants.length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Sentiment:</span>
                        <Badge
                          variant={
                            meetingSummary.sentiment === 'positive' ? 'success' :
                            meetingSummary.sentiment === 'negative' ? 'error' : 'secondary'
                          }
                          className="ml-2"
                        >
                          {meetingSummary.sentiment}
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  {meetingSummary.keyPoints.length > 0 && (
                    <Card className="p-4">
                      <h4 className="mb-3 font-semibold">Key Points</h4>
                      <ul className="space-y-2">
                        {meetingSummary.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full" />
                            <span className="text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {meetingSummary.actionItems.length > 0 && (
                    <Card className="p-4">
                      <h4 className="mb-3 font-semibold">Action Items</h4>
                      <ul className="space-y-2">
                        {meetingSummary.actionItems.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-red-500 rounded-full" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {meetingSummary.decisions.length > 0 && (
                    <Card className="p-4">
                      <h4 className="mb-3 font-semibold">Decisions Made</h4>
                      <ul className="space-y-2">
                        {meetingSummary.decisions.map((decision, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full" />
                            <span className="text-sm">{decision}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {meetingSummary.nextSteps.length > 0 && (
                    <Card className="p-4">
                      <h4 className="mb-3 font-semibold">Next Steps</h4>
                      <ul className="space-y-2">
                        {meetingSummary.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-purple-500 rounded-full" />
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="mt-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Generate a summary to see meeting insights and key takeaways</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};