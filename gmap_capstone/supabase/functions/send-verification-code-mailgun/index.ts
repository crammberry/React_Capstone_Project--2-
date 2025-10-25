// Supabase Edge Function for sending verification codes using Mailgun
// Mailgun FREE: 5,000 emails/month - works for ANY email address!

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY')
    const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN')

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      throw new Error('Mailgun configuration missing')
    }

    // Create form data for Mailgun
    const formData = new FormData()
    formData.append('from', `San Juan Cemetery <noreply@${MAILGUN_DOMAIN}>`)
    formData.append('to', email)
    formData.append('subject', 'Your Verification Code')
    formData.append('html', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 2rem; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 2rem;">🔐 Email Verification</h1>
          <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">San Juan Cemetery Management</p>
        </div>
        
        <div style="padding: 2rem; background: #f8fafc;">
          <h2 style="color: #374151; margin-top: 0;">Your Verification Code</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Thank you for registering with San Juan Cemetery Management System. 
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
              <strong>Need help?</strong> Contact our office if you have any questions.
            </p>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 1rem; text-align: center; color: #6b7280; font-size: 0.75rem;">
          <p style="margin: 0;">© 2024 San Juan Cemetery Management System. All rights reserved.</p>
        </div>
      </div>
    `)

    // Send email using Mailgun
    const emailResponse = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
        },
        body: formData,
      }
    )

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Mailgun error:', errorData)
      throw new Error(`Mailgun error: ${errorData}`)
    }

    const emailData = await emailResponse.json()
    console.log('✅ Email sent successfully:', emailData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully',
        messageId: emailData.id 
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

