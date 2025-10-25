import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.')
  
  // For development, provide helpful error message
  if (import.meta.env.DEV) {
    console.error('Copy .env.example to .env.local and fill in your Supabase credentials.')
  }
  
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// Production-ready Supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Enable session persistence across page navigations
    autoRefreshToken: true, // Automatically refresh tokens before expiry
    detectSessionInUrl: false, // Disable URL-based session detection for security
    storage: typeof window !== 'undefined' ? window.localStorage : undefined, // Use localStorage for persistence
    storageKey: 'eternal-rest-auth', // Custom storage key to avoid conflicts
    flowType: 'pkce' // Use PKCE flow for better security in production
  }
})

export default supabase
