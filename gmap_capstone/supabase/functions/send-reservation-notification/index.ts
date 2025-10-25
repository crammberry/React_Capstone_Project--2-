// Supabase Edge Function for sending plot reservation approval/rejection emails
// Deploy with: supabase functions deploy send-reservation-notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
      plotId,
      reservationId,
      status,
      beneficiaryName,
      requestorName,
      reservationType,
      adminNotes,
    } = await req.json()

    console.log('📧 Sending reservation notification:', {
      email,
      plotId,
      status,
      reservationType
    })

    // Validate required fields
    if (!email || !plotId || !status) {
      throw new Error('Missing required fields: email, plotId, or status')
    }

    const getReservationTypeText = (type) => {
      switch (type) {
        case 'PRE_NEED': return 'Pre-Need Planning';
        case 'IMMEDIATE': return 'Immediate Need';
        case 'TRANSFER': return 'Transfer Ownership';
        default: return type;
      }
    };

    // Generate email content based on status
    let subject = ''
    let htmlContent = ''

    if (status === 'APPROVED') {
      subject = '✅ Plot Reservation Approved - Payment Required'
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
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: white; font-weight: 700;">✅ Reservation Approved</h1>
              <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 14px;">
                Reservation #${reservationId || 'N/A'}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear <strong>${requestorName || 'Valued Client'}</strong>,
              </p>
              
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                Your plot reservation request for <strong>Plot ${plotId}</strong> has been <strong style="color: #3b82f6;">APPROVED</strong>!
              </p>
              
              ${beneficiaryName ? `
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #374151; font-size: 14px;">
                  <strong>Beneficiary:</strong> ${beneficiaryName}<br>
                  <strong>Reservation Type:</strong> ${getReservationTypeText(reservationType || 'PRE_NEED')}
                </p>
              </div>
              ` : ''}
              
              <!-- Next Steps -->}
              <div style="background: white; border: 2px solid #3b82f6; padding: 20px; margin: 0 0 24px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 600;">📋 Next Steps:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.8; font-size: 14px;">
                  <li><strong>Visit the Cemetery Office</strong> for payment and document verification</li>
                  <li>Bring the following:
                    <ul style="margin-top: 8px;">
                      <li>Valid Government ID</li>
                      <li>Proof of Relationship (if applicable)</li>
                      <li>This email confirmation</li>
                    </ul>
                  </li>
                  <li>Complete payment at the office</li>
                  <li>Receive your official reservation certificate</li>
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
              
              <!-- Payment Information -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">💰 Payment Information:</h4>
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Payment must be completed within <strong>7 days</strong> to secure your reservation. 
                  Payment plans may be available for Pre-Need reservations. Please inquire at the office.
                </p>
              </div>
              
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
    } else if (status === 'REJECTED') {
      subject = '❌ Plot Reservation Status Update'
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
              <h1 style="margin: 0; font-size: 28px; color: white; font-weight: 700;">Reservation Status Update</h1>
              <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 14px;">
                Reservation #${reservationId || 'N/A'}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear <strong>${requestorName || 'Valued Client'}</strong>,
              </p>
              
              <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                We regret to inform you that your plot reservation request for <strong>Plot ${plotId}</strong> could not be approved at this time.
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
                  <li>Choose a different plot if available</li>
                  <li>Submit a new reservation request if circumstances change</li>
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
    console.error('❌ Error in send-reservation-notification function:', error)
    
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

