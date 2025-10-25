-- Verification Codes Table
-- This table stores 6-digit verification codes for email verification

CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON public.verification_codes(expires_at);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert verification codes (for registration)
CREATE POLICY "Allow verification code creation" ON public.verification_codes
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read verification codes (for verification)
CREATE POLICY "Allow verification code reading" ON public.verification_codes
  FOR SELECT USING (true);

-- Allow anyone to delete verification codes (after successful verification)
CREATE POLICY "Allow verification code deletion" ON public.verification_codes
  FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON public.verification_codes TO anon, authenticated;

-- Function to clean up expired codes (optional)
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.verification_codes 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired codes (optional)
-- This would need to be set up in your Supabase dashboard or via cron





