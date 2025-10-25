// Supabase Edge Function for sending verification codes using SendGrid
// SendGrid FREE: 100 emails/day - works for ANY email address!

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

    // Send email using SendGrid
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email }],
          subject: 'Your Verification Code'
        }],
        from: {
          email: 'amoromonste@gmail.com', // Your verified SendGrid sender
          name: 'San Juan Cemetery'
        },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 2rem; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 2rem;">🔐 Email Verification</h1>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">San Juan Cemetery Management</p>
              </div>
              
              <div style="padding: 2rem; background: #f8fafc;">
                <h2 style="color: #374151; margin-top: 0;">Your Verification Code</h2>
                <p style="color: #6b7280; line-height: 1.6;">
                  Thank you for registering. Please use the verification code below:
                </p>
                
                <div style="background: white; border: 2px solid #10b981; border-radius: 0.75rem; padding: 1.5rem; text-align: center; margin: 1.5rem 0;">
                  <div style="font-size: 2rem; font-weight: bold; color: #10b981; letter-spacing: 0.5rem; font-family: monospace;">
                    ${code}
                  </div>
                </div>
                
                <p style="color: #6b7280; font-size: 0.875rem; margin: 1rem 0;">
                  <strong>Important:</strong> This code expires in 10 minutes.
                </p>
              </div>
              
              <div style="background: #f9fafb; padding: 1rem; text-align: center; color: #6b7280; font-size: 0.75rem;">
                <p style="margin: 0;">© 2024 San Juan Cemetery. All rights reserved.</p>
              </div>
            </div>
          `
        }]
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      throw new Error(`SendGrid error: ${JSON.stringify(errorData)}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully'
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

