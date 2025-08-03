/**
 * Univio Platform - Next-generation video conferencing
 * Copyright (c) 2025 Univio Team
 * Licensed under the MIT License - see LICENSE file for details
 */

import Link from 'next/link'
import { VideoCameraIcon, SparklesIcon, GlobeAltIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <VideoCameraIcon className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Univo</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline ml-10 space-x-4">
                <Link href="#features" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600">
                  Features
                </Link>
                <Link href="#about" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600">
                  About
                </Link>
                <Link href="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-primary-600 hover:bg-primary-700">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <div className="relative">
          <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 sm:py-24 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Video Conferencing</span>
                <span className="block text-primary-600">Powered by AI</span>
              </h1>
              <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-600">
                Experience the future of online meetings with real-time AI transcription, 
                language translation, and collaborative tools designed for both corporate 
                and educational environments.
              </p>
              <div className="flex justify-center gap-4 mt-10">
                <Link
                  href="/register"
                  className="px-8 py-3 text-base font-medium text-white transition-colors rounded-md shadow bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Start Free Meeting
                </Link>
                <Link
                  href="/meeting/join"
                  className="px-8 py-3 text-base font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Join Meeting
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-16 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Everything you need for modern meetings
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Powerful features designed to enhance collaboration and productivity
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary-100">
                  <VideoCameraIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">HD Video Calls</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Crystal clear video quality with support for up to 50 participants
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary-100">
                  <SparklesIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">AI Transcription</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Real-time speech-to-text with automatic meeting summaries
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary-100">
                  <GlobeAltIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Live Translation</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Break language barriers with real-time translation in 10+ languages
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary-100">
                  <AcademicCapIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Educational Tools</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Interactive whiteboard, code editor, and presentation tools
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600">
          <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to transform your meetings?
              </h2>
              <p className="mt-4 text-lg text-primary-100">
                Join thousands of users who have already upgraded their video conferencing experience
              </p>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-3 text-base font-medium transition-colors bg-white rounded-md shadow text-primary-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <VideoCameraIcon className="w-8 h-8 text-primary-400" />
              <span className="ml-2 text-xl font-bold text-white">Univo</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 Univo. Built with ❤️ for better communication.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}