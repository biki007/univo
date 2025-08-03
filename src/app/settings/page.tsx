'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
  GlobeAltIcon,
  KeyIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface UserPreferences {
  notifications: {
    email: boolean
    push: boolean
    meeting_reminders: boolean
    chat_messages: boolean
  }
  video: {
    default_camera: boolean
    default_microphone: boolean
    auto_join_audio: boolean
    hd_video: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    language: string
  }
  privacy: {
    show_online_status: boolean
    allow_recording: boolean
    data_sharing: boolean
  }
}

const defaultPreferences: UserPreferences = {
  notifications: {
    email: true,
    push: true,
    meeting_reminders: true,
    chat_messages: true
  },
  video: {
    default_camera: true,
    default_microphone: false,
    auto_join_audio: true,
    hd_video: true
  },
  appearance: {
    theme: 'system',
    language: 'en'
  },
  privacy: {
    show_online_status: true,
    allow_recording: true,
    data_sharing: false
  }
}

export default function SettingsPage() {
  const { user, profile, loading, updateProfile } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile?.preferences) {
      try {
        const savedPrefs = typeof profile.preferences === 'string' 
          ? JSON.parse(profile.preferences) 
          : profile.preferences
        setPreferences({ ...defaultPreferences, ...savedPrefs })
      } catch (error) {
        console.error('Error parsing preferences:', error)
      }
    }
  }, [profile])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handlePreferenceChange = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      const { error } = await updateProfile({
        preferences: preferences as any
      })

      if (error) {
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to save settings. Please try again.'
        })
      } else {
        addToast({
          type: 'success',
          title: 'Success',
          description: 'Settings saved successfully!'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'An unexpected error occurred.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'video', name: 'Video & Audio', icon: VideoCameraIcon },
    { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account preferences and application settings
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CogIcon className="w-5 h-5 mr-2" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: SunIcon },
                        { value: 'dark', label: 'Dark', icon: MoonIcon },
                        { value: 'system', label: 'System', icon: ComputerDesktopIcon }
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => handlePreferenceChange('appearance', 'theme', theme.value)}
                          className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                            preferences.appearance.theme === theme.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <theme.icon className="w-5 h-5 mr-2" />
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Language
                    </label>
                    <select
                      value={preferences.appearance.language}
                      onChange={(e) => handlePreferenceChange('appearance', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Select language"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BellIcon className="w-5 h-5 mr-2" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'push', label: 'Push Notifications', description: 'Receive browser push notifications' },
                    { key: 'meeting_reminders', label: 'Meeting Reminders', description: 'Get reminded about upcoming meetings' },
                    { key: 'chat_messages', label: 'Chat Messages', description: 'Notifications for new chat messages' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.notifications[setting.key as keyof typeof preferences.notifications]}
                          onChange={(e) => handlePreferenceChange('notifications', setting.key, e.target.checked)}
                          className="sr-only peer"
                          aria-label={setting.label}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === 'video' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <VideoCameraIcon className="w-5 h-5 mr-2" />
                    Video & Audio Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'default_camera', label: 'Camera On by Default', description: 'Turn on camera when joining meetings', icon: VideoCameraIcon },
                    { key: 'default_microphone', label: 'Microphone On by Default', description: 'Turn on microphone when joining meetings', icon: MicrophoneIcon },
                    { key: 'auto_join_audio', label: 'Auto Join Audio', description: 'Automatically connect to meeting audio', icon: SpeakerWaveIcon },
                    { key: 'hd_video', label: 'HD Video Quality', description: 'Use high definition video when possible', icon: VideoCameraIcon }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <setting.icon className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.video[setting.key as keyof typeof preferences.video]}
                          onChange={(e) => handlePreferenceChange('video', setting.key, e.target.checked)}
                          className="sr-only peer"
                          aria-label={setting.label}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    Privacy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'show_online_status', label: 'Show Online Status', description: 'Let others see when you are online' },
                    { key: 'allow_recording', label: 'Allow Meeting Recording', description: 'Allow hosts to record meetings you join' },
                    { key: 'data_sharing', label: 'Analytics Data Sharing', description: 'Share usage data to improve the service' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.privacy[setting.key as keyof typeof preferences.privacy]}
                          onChange={(e) => handlePreferenceChange('privacy', setting.key, e.target.checked)}
                          className="sr-only peer"
                          aria-label={setting.label}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="mb-4 text-sm font-medium text-gray-900">Danger Zone</h4>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="justify-start w-full text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <KeyIcon className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start w-full text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-6"
              >
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}