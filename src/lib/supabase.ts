/**
 * Univio Platform - Supabase Client Configuration
 * Copyright (c) 2025 Univio Team
 * Licensed under the MIT License - see LICENSE file for details
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have valid Supabase credentials
const hasValidSupabaseConfig = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, userData?: any) => {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signInWithGoogle: async () => {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  signInWithGithub: async () => {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  signOut: async () => {
    if (!hasValidSupabaseConfig) {
      return { error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email: string) => {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  },

  updatePassword: async (password: string) => {
    if (!hasValidSupabaseConfig) {
      return { data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  },

  getCurrentUser: async () => {
    if (!hasValidSupabaseConfig) {
      return { user: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  getSession: async () => {
    if (!hasValidSupabaseConfig) {
      return { session: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }
    }
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}

// Export the config check for use in components
export { hasValidSupabaseConfig }

// Real-time subscriptions
export const subscribeToAuthChanges = (callback: (_event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}