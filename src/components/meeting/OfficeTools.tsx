'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  DocumentTextIcon,
  PresentationChartBarIcon,
  DocumentArrowUpIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  FilmIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline'

interface OfficeToolsProps {
  roomId: string
  isReadOnly?: boolean
  className?: string
}

interface Document {
  id: string
  name: string
  type: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'txt' | 'image' | 'video' | 'audio'
  url: string
  pages?: number
  uploadedBy: string
  uploadedAt: Date
  size: number
}

interface PresentationState {
  isPresenting: boolean
  currentSlide: number
  totalSlides: number
  presenter: string
  isFullscreen: boolean
}

const SUPPORTED_FORMATS = {
  documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  presentations: ['.ppt', '.pptx', '.key'],
  spreadsheets: ['.xls', '.xlsx', '.csv'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
  videos: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
  audio: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
}

export function OfficeTools({ isReadOnly = false, className }: OfficeToolsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)
  
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Meeting Agenda.pdf',
      type: 'pdf',
      url: '/sample-documents/agenda.pdf',
      pages: 3,
      uploadedBy: 'John Doe',
      uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      size: 245760,
    },
    {
      id: '2',
      name: 'Q4 Presentation.pptx',
      type: 'pptx',
      url: '/sample-documents/presentation.pptx',
      pages: 15,
      uploadedBy: 'Jane Smith',
      uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      size: 1048576,
    },
    {
      id: '3',
      name: 'Budget Analysis.xlsx',
      type: 'xlsx',
      url: '/sample-documents/budget.xlsx',
      uploadedBy: 'Bob Johnson',
      uploadedAt: new Date(Date.now() - 30 * 60 * 1000),
      size: 524288,
    },
  ])
  
  const [activeDocument, setActiveDocument] = useState<Document | null>(null)
  const [currentPage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [viewMode, setViewMode] = useState<'viewer' | 'presentation'>('viewer')
  
  const [presentationState, setPresentationState] = useState<PresentationState>({
    isPresenting: false,
    currentSlide: 1,
    totalSlides: 1,
    presenter: '',
    isFullscreen: false,
  })

  const [isUploading, setIsUploading] = useState(false)

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        // In a real implementation, you would upload to your server/cloud storage
        const newDocument: Document = {
          id: `doc_${Date.now()}_${Math.random()}`,
          name: file.name,
          type: getFileType(file.name),
          url: URL.createObjectURL(file), // Temporary URL for demo
          pages: getEstimatedPages(file),
          uploadedBy: 'You',
          uploadedAt: new Date(),
          size: file.size,
        }
        
        setDocuments(prev => [...prev, newDocument])
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Get file type from extension
  const getFileType = (filename: string): Document['type'] => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    
    if (SUPPORTED_FORMATS.documents.includes(ext)) return 'pdf'
    if (SUPPORTED_FORMATS.presentations.includes(ext)) return 'pptx'
    if (SUPPORTED_FORMATS.spreadsheets.includes(ext)) return 'xlsx'
    if (SUPPORTED_FORMATS.images.includes(ext)) return 'image'
    if (SUPPORTED_FORMATS.videos.includes(ext)) return 'video'
    if (SUPPORTED_FORMATS.audio.includes(ext)) return 'audio'
    
    return 'txt'
  }

  // Estimate pages for demo
  const getEstimatedPages = (file: File): number => {
    const sizeInMB = file.size / (1024 * 1024)
    return Math.max(1, Math.ceil(sizeInMB * 2)) // Rough estimate
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file icon
  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
      case 'docx':
      case 'txt':
        return <DocumentTextIcon className="w-5 h-5" />
      case 'pptx':
        return <PresentationChartBarIcon className="w-5 h-5" />
      case 'xlsx':
        return <DocumentTextIcon className="w-5 h-5" />
      case 'image':
        return <PhotoIcon className="w-5 h-5" />
      case 'video':
        return <FilmIcon className="w-5 h-5" />
      case 'audio':
        return <SpeakerWaveIcon className="w-5 h-5" />
      default:
        return <DocumentTextIcon className="w-5 h-5" />
    }
  }

  // Start presentation
  const startPresentation = (document: Document) => {
    setActiveDocument(document)
    setViewMode('presentation')
    setPresentationState({
      isPresenting: true,
      currentSlide: 1,
      totalSlides: document.pages || 1,
      presenter: 'You',
      isFullscreen: false,
    })
  }

  // Stop presentation
  const stopPresentation = () => {
    setPresentationState(prev => ({
      ...prev,
      isPresenting: false,
      presenter: '',
    }))
    setViewMode('viewer')
  }

  // Navigate slides
  const nextSlide = () => {
    setPresentationState(prev => ({
      ...prev,
      currentSlide: Math.min(prev.currentSlide + 1, prev.totalSlides),
    }))
  }

  const previousSlide = () => {
    setPresentationState(prev => ({
      ...prev,
      currentSlide: Math.max(prev.currentSlide - 1, 1),
    }))
  }

  // Zoom controls
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200))
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50))

  // Download document
  const handleDownloadDocument = (doc: Document) => {
    try {
      // Create a temporary link to download the document
      const link = window.document.createElement('a')
      link.href = doc.url
      link.download = doc.name
      link.target = '_blank'
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to download document:', error)
      // In a real implementation, you'd show a toast notification
    }
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900">Office Tools</h3>
          {presentationState.isPresenting && (
            <Badge variant="primary" className="animate-pulse">
              Presenting: {activeDocument?.name}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!isReadOnly && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload documents"
                title="Upload documents"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-sm"
              >
                <DocumentArrowUpIcon className="w-4 h-4 mr-1" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Document List */}
        <div className="flex flex-col border-r border-gray-200 w-80 bg-gray-50">
          <div className="p-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Documents ({documents.length})</h4>
          </div>
          
          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
            {documents.map(document => (
              <Card
                key={document.id}
                className={`cursor-pointer transition-colors hover:bg-gray-100 ${
                  activeDocument?.id === document.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                }`}
                onClick={() => setActiveDocument(document)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-gray-500">
                      {getFileIcon(document.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {document.name}
                      </h5>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(document.size)}
                        </span>
                        {document.pages && (
                          <span className="text-xs text-gray-500">
                            • {document.pages} pages
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        By {document.uploadedBy} • {document.uploadedAt.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  {!isReadOnly && (
                    <div className="flex items-center mt-2 space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDocument(document)
                          setViewMode('viewer')
                        }}
                        className="px-2 py-1 text-xs"
                      >
                        <EyeIcon className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {(document.type === 'pptx' || document.type === 'pdf') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            startPresentation(document)
                          }}
                          className="px-2 py-1 text-xs"
                        >
                          <PresentationChartBarIcon className="w-3 h-3 mr-1" />
                          Present
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadDocument(document)
                        }}
                        className="px-2 py-1 text-xs"
                      >
                        <DocumentArrowDownIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {documents.length === 0 && (
              <div className="py-8 text-center">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">No documents uploaded</p>
                {!isReadOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload First Document
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex flex-col flex-1">
          {activeDocument ? (
            <>
              {/* Viewer Controls */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <h4 className="font-medium text-gray-900">{activeDocument.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {activeDocument.type.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  {viewMode === 'presentation' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={previousSlide}
                        disabled={presentationState.currentSlide <= 1}
                      >
                        <ArrowLeftIcon className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        {presentationState.currentSlide} / {presentationState.totalSlides}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextSlide}
                        disabled={presentationState.currentSlide >= presentationState.totalSlides}
                      >
                        <ArrowRightIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={stopPresentation}
                      >
                        Stop Presenting
                      </Button>
                    </>
                  )}
                  
                  {viewMode === 'viewer' && (
                    <>
                      <Button variant="ghost" size="sm" onClick={zoomOut}>
                        <MagnifyingGlassMinusIcon className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">{zoomLevel}%</span>
                      <Button variant="ghost" size="sm" onClick={zoomIn}>
                        <MagnifyingGlassPlusIcon className="w-4 h-4" />
                      </Button>
                      
                      {(activeDocument.type === 'pptx' || activeDocument.type === 'pdf') && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => startPresentation(activeDocument)}
                        >
                          <PresentationChartBarIcon className="w-4 h-4 mr-1" />
                          Present
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Document Content */}
              <div 
                ref={viewerRef}
                className="flex-1 p-4 overflow-auto bg-gray-100"
              >
                <div 
                  className="mx-auto bg-white shadow-lg"
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    width: viewMode === 'presentation' ? '100%' : 'auto',
                    maxWidth: viewMode === 'presentation' ? 'none' : '800px',
                  }}
                >
                  {/* Document Preview */}
                  <div className="aspect-[4/3] flex items-center justify-center border border-gray-200 bg-white">
                    {activeDocument.type === 'image' ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={activeDocument.url}
                          alt={activeDocument.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : activeDocument.type === 'video' ? (
                      <video 
                        src={activeDocument.url}
                        controls
                        className="max-w-full max-h-full"
                      />
                    ) : activeDocument.type === 'audio' ? (
                      <div className="p-8">
                        <SpeakerWaveIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <audio src={activeDocument.url} controls className="w-full" />
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        {getFileIcon(activeDocument.type)}
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                          {activeDocument.name}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          {viewMode === 'presentation' 
                            ? `Slide ${presentationState.currentSlide} of ${presentationState.totalSlides}`
                            : `Page ${currentPage} of ${activeDocument.pages || 1}`
                          }
                        </p>
                        <p className="mt-4 text-xs text-gray-400">
                          Document preview would be rendered here in a real implementation
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 bg-gray-50">
              <div className="text-center">
                <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Select a document to view
                </h3>
                <p className="text-sm text-gray-500">
                  Choose a document from the list to preview or present it
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}