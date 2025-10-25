-- Fix for verification_codes table
-- This handles the case where some parts already exist

-- First, try to create the table (it might already exist)
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes (ignore if they exist)
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON public.verification_codes(expires_at);

-- Enable RLS (ignore if already enabled)
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow verification code operations" ON public.verification_codes;
DROP POLICY IF EXISTS "Allow verification code creation" ON public.verification_codes;
DROP POLICY IF EXISTS "Allow verification code reading" ON public.verification_codes;
DROP POLICY IF EXISTS "Allow verification code deletion" ON public.verification_codes;

-- Create the policy
CREATE POLICY "Allow verification code operations" ON public.verification_codes
  FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.verification_codes TO anon, authenticated;





