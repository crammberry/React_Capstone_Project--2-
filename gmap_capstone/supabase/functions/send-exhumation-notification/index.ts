// Supabase Edge Function for sending exhumation approval/rejection emails
// Deploy with: supabase functions deploy send-exhumation-notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Parse request body
    const {
      email,
      requestType,
      plotId,
      requestId,
      status,
      deceasedName,
      requestorName,
      adminNotes,
      scheduledDate,
    } = await req.json()

    console.log('📧 Sending exhumation notification:', {
      email,
      plotId,
      status,
      requestType
    })

    // Validate required fields
    if (!email || !plotId || !status) {
      throw new Error('Missing required fields: email, plotId, or status')
    }

    // Generate email content based on status
    let subject = ''
    let htmlContent = ''

    if (status === 'approved') {
      subject = '✅ Exhumation Request Approved - Action Required'
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: white; font-weight: 700;">✅ Request Approved</h1>
              <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 14px;">
                Exhumation Request #${requestId || 'N/A'}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear <strong>${requestorName || 'Valued Client'}</strong>,
              </p>
              
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                Your ${requestType === 'OUT' ? 'exhumation' : 'burial'} request for <strong>Plot ${plotId}</strong> has been <strong style="color: #10b981;">APPROVED</strong>.
              </p>
              
              ${deceasedName ? `
              <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #374151; font-size: 14px;">
                  <strong>Deceased:</strong> ${deceasedName}
                </p>
              </div>
              ` : ''}
              
              <!-- Next Steps -->
              <div style="background: white; border: 2px solid #10b981; padding: 20px; margin: 0 0 24px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">📋 Next Steps:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.8; font-size: 14px;">
                  <li>Prepare the required documents for verification:
                    <ul style="margin-top: 8px;">
                      <li>Valid Government ID</li>
                      <li>Death Certificate</li>
                      <li>Birth Certificate (proof of relationship)</li>
                      <li>Affidavit of Relationship</li>
                    </ul>
                  </li>
                  <li style="margin-top: 8px;">Visit the cemetery office for document verification</li>
                  <li style="margin-top: 8px;">Complete payment at the office</li>
                  ${scheduledDate ? `<li style="margin-top: 8px;">Scheduled Date: <strong>${new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></li>` : '<li style="margin-top: 8px;">Schedule the exhumation/burial date</li>'}
                </ol>
              </div>
              
              ${adminNotes ? `
              <!-- Admin Notes -->
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Admin Notes:</h4>
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  ${adminNotes}
                </p>
              </div>
              ` : ''}
              
              <!-- Office Info -->
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; margin: 0 0 24px 0; border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">📍 Office Hours:</h4>
                <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                  <strong>Monday - Friday:</strong> 8:00 AM - 5:00 PM<br>
                  <strong>Saturday:</strong> 8:00 AM - 12:00 PM<br>
                  <strong>Sunday & Holidays:</strong> Closed
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                If you have any questions, please contact us at the cemetery office or reply to this email.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">
                This is an automated email from Cemetery Management System
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} All rights reserved
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (status === 'rejected') {
      subject = '❌ Exhumation Request Status Update'
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: white; font-weight: 700;">Request Status Update</h1>
              <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 14px;">
                Exhumation Request #${requestId || 'N/A'}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear <strong>${requestorName || 'Valued Client'}</strong>,
              </p>
              
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                We regret to inform you that your ${requestType === 'OUT' ? 'exhumation' : 'burial'} request for <strong>Plot ${plotId}</strong> could not be approved at this time.
              </p>
              
              ${adminNotes ? `
              <!-- Admin Notes / Reason -->
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 8px 0; color: #dc2626; font-size: 14px; font-weight: 600;">Reason:</h4>
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  ${adminNotes}
                </p>
              </div>
              ` : ''}
              
              <!-- Next Steps -->
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; margin: 0 0 24px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">What You Can Do:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.8; font-size: 14px;">
                  <li>Contact the cemetery office for more information</li>
                  <li>Provide additional documentation if needed</li>
                  <li>Submit a new request if circumstances change</li>
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                If you have any questions or need clarification, please don't hesitate to contact us at the cemetery office.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">
                This is an automated email from Cemetery Management System
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} All rights reserved
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    } else {
      throw new Error(`Unsupported status: ${status}`)
    }

    // Send email via Resend API
    console.log('📤 Calling Resend API...')
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Cemetery Management <noreply@eternal-rest.resend.dev>',
        to: [email],
        subject: subject,
        html: htmlContent,
      }),
    })

    const resendData = await resendResponse.json()
    
    if (!resendResponse.ok) {
      console.error('❌ Resend API error:', resendData)
      throw new Error(`Resend API error: ${resendData.message || 'Unknown error'}`)
    }

    console.log('✅ Email sent successfully:', resendData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: resendData.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('❌ Error in send-exhumation-notification function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

