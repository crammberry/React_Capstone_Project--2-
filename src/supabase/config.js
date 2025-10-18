import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vwuysllaspphcrfhgtqo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3dXlzbGxhc3BwaGNyZmhndHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTMwODIsImV4cCI6MjA3NTkyOTA4Mn0.w0D9XffDqb3OEVUqB1DM72AMJvE0HjvpIamlMADZ_7E'

// Create Supabase client with error handling
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.warn('Supabase client creation failed:', error);
  // Create a mock client for development
  supabase = {
    auth: {
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  };
}

export { supabase };
export default supabase;
