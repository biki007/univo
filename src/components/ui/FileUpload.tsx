'use client'

import { useState, useRef } from 'react'
import { Button } from './Button'
import { cn } from '@/lib/utils'
import {
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  preview?: string
  className?: string
  disabled?: boolean
}

export function FileUpload({
  onFileSelect,
  accept = 'image/*',
  maxSize = 5,
  preview,
  className,
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (accept === 'image/*' && !file.type.startsWith('image/')) {
      return 'Please select an image file'
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      return `File size must be less than ${maxSize}MB`
    }

    return null
  }

  const handleFile = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    onFileSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return

    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleButtonClick = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleRemove = () => {
    if (disabled) return
    setError('')
    onFileSelect(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-300 bg-red-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          aria-label="File upload"
        />

        {preview ? (
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-32 h-32 rounded-lg"
              />
              <button
                onClick={handleRemove}
                className="absolute p-1 text-white transition-colors bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                disabled={disabled}
                aria-label="Remove image"
                title="Remove image"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              {dragActive ? (
                <CloudArrowUpIcon className="w-full h-full" />
              ) : (
                <PhotoIcon className="w-full h-full" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {dragActive
                  ? 'Drop your image here'
                  : 'Drag and drop your image here, or click to select'
                }
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
                disabled={disabled}
              >
                Choose File
              </Button>
            </div>
            
            <p className="mt-2 text-xs text-gray-500">
              {accept === 'image/*' ? 'PNG, JPG, GIF up to' : 'Files up to'} {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}