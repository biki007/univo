'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card, CardContent, useToastHelpers } from '@/components/ui'
import { VideoCameraIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth()
  const router = useRouter()
  const toast = useToastHelpers()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast.error('Sign In Failed', error.message)
      } else {
        toast.success('Welcome back!', 'You have been signed in successfully.')
        router.push('/dashboard')
      }
    } catch (err) {
      toast.error('Sign In Failed', 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setLoading(true)
    
    try {
      const signInMethod = provider === 'google' ? signInWithGoogle : signInWithGithub
      const { error } = await signInMethod()
      
      if (error) {
        toast.error('Sign In Failed', error.message)
      } else {
        toast.success('Welcome!', `Signed in with ${provider === 'google' ? 'Google' : 'GitHub'} successfully.`)
      }
    } catch (err) {
      toast.error('Sign In Failed', 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const socialProviders = [
    {
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      onClick: () => handleSocialSignIn('google'),
      color: 'hover:bg-red-50 hover:border-red-300'
    },
    {
      name: 'GitHub',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      onClick: () => handleSocialSignIn('github'),
      color: 'hover:bg-gray-50 hover:border-gray-400'
    },
    {
      name: 'Microsoft',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#f25022" d="M1 1h10v10H1z"/>
          <path fill="#00a4ef" d="M13 1h10v10H13z"/>
          <path fill="#7fba00" d="M1 13h10v10H1z"/>
          <path fill="#ffb900" d="M13 13h10v10H13z"/>
        </svg>
      ),
      onClick: () => toast.info('Coming Soon', 'Microsoft sign-in will be available soon.'),
      color: 'hover:bg-blue-50 hover:border-blue-300'
    },
    {
      name: 'Apple',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ),
      onClick: () => toast.info('Coming Soon', 'Apple sign-in will be available soon.'),
      color: 'hover:bg-gray-50 hover:border-gray-400'
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="#1877f2" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      onClick: () => toast.info('Coming Soon', 'Facebook sign-in will be available soon.'),
      color: 'hover:bg-blue-50 hover:border-blue-300'
    }
  ]

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center mb-8 space-x-2">
            <VideoCameraIcon className="w-10 h-10 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Univo</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <Card variant="elevated" className="p-8">
          <CardContent>
            {/* Social Sign In */}
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {socialProviders.slice(0, 2).map((provider) => (
                  <Button
                    key={provider.name}
                    type="button"
                    variant="outline"
                    onClick={provider.onClick}
                    disabled={loading}
                    className={`w-full justify-center transition-colors ${provider.color}`}
                  >
                    {provider.icon}
                    <span className="ml-2">{provider.name}</span>
                  </Button>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {socialProviders.slice(2).map((provider) => (
                  <Button
                    key={provider.name}
                    type="button"
                    variant="outline"
                    onClick={provider.onClick}
                    disabled={loading}
                    className={`w-full justify-center transition-colors ${provider.color}`}
                    title={`Sign in with ${provider.name}`}
                  >
                    {provider.icon}
                  </Button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute text-gray-400 right-3 top-9 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="p-4 rounded-lg bg-blue-50">
                <h3 className="mb-3 text-sm font-medium text-blue-900">🚀 Demo Credentials</h3>
                <div className="space-y-2 text-xs text-blue-800">
                  <div className="flex justify-between">
                    <span className="font-medium">User:</span>
                    <span>demo@univo.com / demo123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Host:</span>
                    <span>host@univo.com / host123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Admin:</span>
                    <span>admin@univo.com / admin123</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Access */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="mb-3 text-sm text-gray-600">
                  Don&apos;t have an account yet?
                </p>
                <div className="space-y-2">
                  <Link href="/register" className="block">
                    <Button variant="outline" className="w-full">
                      Create new account
                    </Button>
                  </Link>
                  <Link href="/meeting/join-secure" className="block">
                    <Button variant="ghost" className="w-full">
                      Join as guest (Secure)
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}