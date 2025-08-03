'use client'

import { useMemo } from 'react'
import VideoStream from './VideoStream'
import { cn } from '@/lib/utils'
import {
  MicrophoneIcon,
  VideoCameraIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import {
  MicrophoneIcon as MicrophoneSlashIcon,
  VideoCameraSlashIcon
} from '@heroicons/react/24/solid'

export interface VideoParticipant {
  id: string
  name: string
  stream?: MediaStream | null
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isLocal?: boolean
}

export interface VideoGridProps {
  participants: VideoParticipant[]
  className?: string
  maxParticipants?: number
  showControls?: boolean
  onParticipantClick?: (participant: VideoParticipant) => void
}

const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  className,
  maxParticipants = 12,
  showControls = true,
  onParticipantClick
}) => {
  // Calculate grid layout based on participant count
  const gridLayout = useMemo(() => {
    const count = Math.min(participants.length, maxParticipants)
    
    if (count === 0) return { cols: 1, rows: 1 }
    if (count === 1) return { cols: 1, rows: 1 }
    if (count === 2) return { cols: 2, rows: 1 }
    if (count <= 4) return { cols: 2, rows: 2 }
    if (count <= 6) return { cols: 3, rows: 2 }
    if (count <= 9) return { cols: 3, rows: 3 }
    if (count <= 12) return { cols: 4, rows: 3 }
    
    return { cols: 4, rows: 4 }
  }, [participants.length, maxParticipants])

  // Get visible participants
  const visibleParticipants = useMemo(() => {
    return participants.slice(0, maxParticipants)
  }, [participants, maxParticipants])

  if (participants.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-900 rounded-lg',
        'min-h-[400px] text-white',
        className
      )}>
        <div className="text-center">
          <VideoCameraSlashIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No participants</p>
          <p className="text-gray-400">Waiting for others to join...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'grid gap-2 w-full h-full',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
        gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`
      }}
    >
      {visibleParticipants.map((participant) => (
        <VideoParticipantCard
          key={participant.id}
          participant={participant}
          showControls={showControls}
          onClick={() => onParticipantClick?.(participant)}
        />
      ))}
    </div>
  )
}

interface VideoParticipantCardProps {
  participant: VideoParticipant
  showControls: boolean
  onClick?: () => void
}

const VideoParticipantCard: React.FC<VideoParticipantCardProps> = ({
  participant,
  showControls,
  onClick
}) => {
  const { id, name, stream, isVideoEnabled, isAudioEnabled, isLocal } = participant

  return (
    <div
      className={cn(
        'relative bg-gray-900 rounded-lg overflow-hidden',
        'border-2 border-transparent hover:border-blue-500 transition-colors',
        onClick && 'cursor-pointer',
        isLocal && 'ring-2 ring-blue-500'
      )}
      onClick={onClick}
    >
      {/* Video Stream */}
      {isVideoEnabled && stream ? (
        <VideoStream
          stream={stream}
          muted={isLocal}
          mirror={isLocal}
          className="w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-800">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-2 bg-gray-600 rounded-full">
              <UserIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-medium text-white">{name}</p>
            {!isVideoEnabled && (
              <p className="mt-1 text-sm text-gray-400">Camera off</p>
            )}
          </div>
        </div>
      )}

      {/* Participant Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-white truncate">
              {name}
              {isLocal && ' (You)'}
            </span>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-1">
              {/* Audio Status */}
              <div className={cn(
                'p-1 rounded-full',
                isAudioEnabled ? 'bg-green-500/20' : 'bg-red-500/20'
              )}>
                {isAudioEnabled ? (
                  <MicrophoneIcon className="w-4 h-4 text-green-400" />
                ) : (
                  <MicrophoneSlashIcon className="w-4 h-4 text-red-400" />
                )}
              </div>
              
              {/* Video Status */}
              <div className={cn(
                'p-1 rounded-full',
                isVideoEnabled ? 'bg-green-500/20' : 'bg-red-500/20'
              )}>
                {isVideoEnabled ? (
                  <VideoCameraIcon className="w-4 h-4 text-green-400" />
                ) : (
                  <VideoCameraSlashIcon className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status Indicator */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export default VideoGrid