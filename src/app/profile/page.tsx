'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Avatar, Badge, FileUpload } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, profile, loading, updateProfile } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  })
  const [errors, setErrors] = useState({
    full_name: '',
    avatar_url: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || ''
      })
      setPreviewUrl(profile.avatar_url || '')
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      full_name: '',
      avatar_url: ''
    }

    // Validate full name
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters'
    }

    // Validate avatar URL if provided
    if (formData.avatar_url && formData.avatar_url.trim()) {
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
      if (!urlPattern.test(formData.avatar_url.trim())) {
        newErrors.avatar_url = 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)'
      }
    }

    setErrors(newErrors)
    return !newErrors.full_name && !newErrors.avatar_url
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await updateProfile({
        full_name: formData.full_name.trim(),
        avatar_url: formData.avatar_url.trim() || null
      })

      if (error) {
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to update profile. Please try again.'
        })
      } else {
        addToast({
          type: 'success',
          title: 'Success',
          description: 'Profile updated successfully!'
        })
        setIsEditing(false)
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

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      avatar_url: profile?.avatar_url || ''
    })
    setErrors({
      full_name: '',
      avatar_url: ''
    })
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSubmitting}
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar
                      src={previewUrl || undefined}
                      fallback={formData.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      size="lg"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {profile?.full_name || 'User'}
                    </h3>
                    <p className="text-sm text-gray-500">{profile?.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {profile?.role || 'user'}
                    </Badge>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    {isEditing ? (
                      <div>
                        <Input
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className={errors.full_name ? 'border-red-500' : ''}
                        />
                        {errors.full_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center p-3 rounded-lg bg-gray-50">
                        <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                        <span className="text-gray-900">
                          {profile?.full_name || 'Not set'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="flex items-center p-3 rounded-lg bg-gray-50">
                      <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-gray-900">{profile?.email}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  {isEditing && (
                    <div className="sm:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Avatar URL
                      </label>
                      <Input
                        name="avatar_url"
                        value={formData.avatar_url}
                        onChange={handleInputChange}
                        placeholder="Enter avatar image URL (https://example.com/image.jpg)"
                        className={errors.avatar_url ? 'border-red-500' : ''}
                      />
                      {errors.avatar_url ? (
                        <p className="mt-1 text-sm text-red-600">{errors.avatar_url}</p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          Provide a URL to your profile picture (jpg, jpeg, png, gif, webp)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role</span>
                  <Badge variant="secondary">
                    {profile?.role || 'user'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={profile?.is_online ? 'success' : 'secondary'}>
                    {profile?.is_online ? 'Online' : 'Offline'}
                  </Badge>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span>
                      Joined {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
                    </span>
                  </div>
                </div>

                {profile?.last_seen && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span>
                      Last seen {formatDate(profile.last_seen)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="justify-start w-full"
                  onClick={() => router.push('/settings')}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
                
                <Button
                  variant="outline"
                  className="justify-start w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}