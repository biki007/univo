'use client'

import { useEffect, useRef, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface VideoStreamProps {
  stream?: MediaStream | null
  muted?: boolean
  autoPlay?: boolean
  playsInline?: boolean
  className?: string
  onLoadedMetadata?: () => void
  onError?: (error: Event) => void
  mirror?: boolean
  controls?: boolean
  poster?: string
}

const VideoStream = forwardRef<HTMLVideoElement, VideoStreamProps>(
  ({
    stream,
    muted = false,
    autoPlay = true,
    playsInline = true,
    className,
    onLoadedMetadata,
    onError,
    mirror = false,
    controls = false,
    poster
  }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    // Combine refs
    const combinedRef = (element: HTMLVideoElement | null) => {
      if (videoRef.current !== element) {
        (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = element
      }
      if (typeof ref === 'function') {
        ref(element)
      } else if (ref) {
        ref.current = element
      }
    }

    // Set stream to video element
    useEffect(() => {
      const videoElement = videoRef.current
      if (!videoElement) return

      if (stream) {
        videoElement.srcObject = stream
      } else {
        videoElement.srcObject = null
      }

      return () => {
        if (videoElement.srcObject) {
          videoElement.srcObject = null
        }
      }
    }, [stream])

    // Handle video events
    useEffect(() => {
      const videoElement = videoRef.current
      if (!videoElement) return

      const handleLoadedMetadata = () => {
        onLoadedMetadata?.()
      }

      const handleError = (error: Event) => {
        console.error('Video stream error:', error)
        onError?.(error)
      }

      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
      videoElement.addEventListener('error', handleError)

      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        videoElement.removeEventListener('error', handleError)
      }
    }, [onLoadedMetadata, onError])

    return (
      <video
        ref={combinedRef}
        autoPlay={autoPlay}
        playsInline={playsInline}
        muted={muted}
        controls={controls}
        poster={poster}
        className={cn(
          'w-full h-full object-cover bg-gray-900',
          mirror && 'scale-x-[-1]',
          className
        )}
      />
    )
  }
)

VideoStream.displayName = 'VideoStream'

export default VideoStream