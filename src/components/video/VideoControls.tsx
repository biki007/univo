'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  MicrophoneIcon,
  VideoCameraIcon,
  PhoneXMarkIcon,
  Cog6ToothIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  ShareIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import {
  MicrophoneIcon as MicrophoneOffIcon,
  VideoCameraSlashIcon
} from '@heroicons/react/24/solid'

export interface VideoControlsProps {
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isConnected: boolean
  participantCount: number
  onToggleVideo: () => void
  onToggleAudio: () => void
  onEndCall: () => void
  onOpenSettings?: () => void
  onOpenChat?: () => void
  onOpenParticipants?: () => void
  onShareScreen?: () => void
  onShowMore?: () => void
  className?: string
  showParticipantCount?: boolean
  showChatButton?: boolean
  showShareButton?: boolean
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  isConnected,
  participantCount,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  onOpenSettings,
  onOpenChat,
  onOpenParticipants,
  onShareScreen,
  onShowMore,
  className,
  showParticipantCount = true,
  showChatButton = true,
  showShareButton = true
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'flex items-center justify-center space-x-4 p-4',
        'bg-gray-900/90 backdrop-blur-sm rounded-lg',
        'transition-all duration-200',
        isHovered && 'bg-gray-900/95',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Audio Control */}
      <ControlButton
        isActive={isAudioEnabled}
        onClick={onToggleAudio}
        activeColor="bg-green-500 hover:bg-green-600"
        inactiveColor="bg-red-500 hover:bg-red-600"
        tooltip={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        disabled={!isConnected}
      >
        {isAudioEnabled ? (
          <MicrophoneIcon className="w-5 h-5" />
        ) : (
          <MicrophoneOffIcon className="w-5 h-5" />
        )}
      </ControlButton>

      {/* Video Control */}
      <ControlButton
        isActive={isVideoEnabled}
        onClick={onToggleVideo}
        activeColor="bg-green-500 hover:bg-green-600"
        inactiveColor="bg-red-500 hover:bg-red-600"
        tooltip={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        disabled={!isConnected}
      >
        {isVideoEnabled ? (
          <VideoCameraIcon className="w-5 h-5" />
        ) : (
          <VideoCameraSlashIcon className="w-5 h-5" />
        )}
      </ControlButton>

      {/* Share Screen */}
      {showShareButton && onShareScreen && (
        <ControlButton
          onClick={onShareScreen}
          tooltip="Share screen"
          disabled={!isConnected}
        >
          <ShareIcon className="w-5 h-5" />
        </ControlButton>
      )}

      {/* Participants */}
      {showParticipantCount && onOpenParticipants && (
        <ControlButton
          onClick={onOpenParticipants}
          tooltip="View participants"
          badge={participantCount > 0 ? participantCount.toString() : undefined}
        >
          <UserGroupIcon className="w-5 h-5" />
        </ControlButton>
      )}

      {/* Chat */}
      {showChatButton && onOpenChat && (
        <ControlButton
          onClick={onOpenChat}
          tooltip="Open chat"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
        </ControlButton>
      )}

      {/* Settings */}
      {onOpenSettings && (
        <ControlButton
          onClick={onOpenSettings}
          tooltip="Settings"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </ControlButton>
      )}

      {/* More Options */}
      {onShowMore && (
        <ControlButton
          onClick={onShowMore}
          tooltip="More options"
        >
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </ControlButton>
      )}

      {/* End Call */}
      <ControlButton
        onClick={onEndCall}
        activeColor="bg-red-500 hover:bg-red-600"
        tooltip="End call"
        size="lg"
      >
        <PhoneXMarkIcon className="w-6 h-6" />
      </ControlButton>
    </div>
  )
}

interface ControlButtonProps {
  children: React.ReactNode
  onClick: () => void
  isActive?: boolean
  activeColor?: string
  inactiveColor?: string
  tooltip?: string
  disabled?: boolean
  badge?: string
  size?: 'sm' | 'md' | 'lg'
}

const ControlButton: React.FC<ControlButtonProps> = ({
  children,
  onClick,
  isActive = true,
  activeColor = 'bg-gray-600 hover:bg-gray-500',
  inactiveColor = 'bg-gray-600 hover:bg-gray-500',
  tooltip,
  disabled = false,
  badge,
  size = 'md'
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  }

  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'rounded-full flex items-center justify-center',
          'text-white transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
          sizeClasses[size],
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          isActive ? activeColor : inactiveColor
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
        
        {/* Badge */}
        {badge && (
          <div className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full -top-1 -right-1">
            {badge}
          </div>
        )}
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && !disabled && (
        <div className="absolute z-50 px-2 py-1 mb-2 text-xs text-white transform -translate-x-1/2 bg-black rounded bottom-full left-1/2 whitespace-nowrap">
          {tooltip}
          <div className="absolute transform -translate-x-1/2 border-4 border-transparent top-full left-1/2 border-t-black" />
        </div>
      )}
    </div>
  )
}

export default VideoControls