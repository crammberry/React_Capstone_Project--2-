// Supabase Edge Function for sending verification codes
// This function sends real emails using Resend (free service)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Cemetery Management <onboarding@resend.dev>', // Using Resend's default domain
        to: [email],
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 2rem; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 2rem;">🔐 Email Verification</h1>
              <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Cemetery Management System</p>
            </div>
            
            <div style="padding: 2rem; background: #f8fafc;">
              <h2 style="color: #374151; margin-top: 0;">Your Verification Code</h2>
              <p style="color: #6b7280; line-height: 1.6;">
                Thank you for registering with our Cemetery Management System. 
                Please use the verification code below to complete your registration:
              </p>
              
              <div style="background: white; border: 2px solid #10b981; border-radius: 0.75rem; padding: 1.5rem; text-align: center; margin: 1.5rem 0;">
                <div style="font-size: 2rem; font-weight: bold; color: #10b981; letter-spacing: 0.5rem; font-family: monospace;">
                  ${code}
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 0.875rem; margin: 1rem 0;">
                <strong>Important:</strong> This code will expire in 10 minutes. 
                If you didn't request this code, please ignore this email.
              </p>
              
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 0.5rem; padding: 1rem; margin-top: 1.5rem;">
                <p style="margin: 0; color: #1e40af; font-size: 0.875rem;">
                  <strong>Need help?</strong> Contact our support team if you have any questions.
                </p>
              </div>
            </div>
            
            <div style="background: #f9fafb; padding: 1rem; text-align: center; color: #6b7280; font-size: 0.75rem;">
              <p style="margin: 0;">© 2024 Cemetery Management System. All rights reserved.</p>
            </div>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      throw new Error(`Email service error: ${errorData.message || 'Failed to send email'}`)
    }

    const emailData = await emailResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully',
        emailId: emailData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending verification code:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send verification code' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

