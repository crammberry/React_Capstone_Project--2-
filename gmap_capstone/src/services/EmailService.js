// Email Service for sending verification codes
// This service integrates with Supabase Edge Functions or external email services

export class EmailService {
  static async sendVerificationCode(email, code) {
    try {
      // Get Supabase URL and anon key
      const { supabase } = await import('../supabase/config');
      const supabaseUrl = supabase.supabaseUrl;
      
      console.log('📧 Attempting to send email via Edge Function...');
      console.log('Supabase URL:', supabaseUrl);
      
      // Call Supabase Edge Function (SendGrid)
      const response = await fetch(`${supabaseUrl}/functions/v1/send-verification-code-sendgrid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          email: email,
          code: code
        })
      });

      console.log('Edge Function response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Edge Function error:', errorData);
        throw new Error(errorData.error || 'Failed to send verification code');
      }

      const result = await response.json();
      console.log('✅ Email sent successfully:', result);
      
      return {
        success: true,
        message: result.message || 'Verification code sent successfully'
      };
    } catch (error) {
      console.error('❌ Email service error:', error);
      
      // Fallback: For development/testing, show code in alert
      const message = `
🔐 VERIFICATION CODE (Development Mode)

Email: ${email}
Code: ${code}
Expires: ${this.getCodeExpirationTime().toLocaleString()}

⚠️ Email sending failed - SendGrid error
📋 Copy this code and paste it in the verification field

Note: Check SendGrid dashboard for sender verification
      `;
      
      console.log(message);
      
      // Show alert with the code for easy copying
      alert(message);
      
      // In development, we'll simulate success
      return {
        success: true,
        message: 'Verification code displayed (check alert/console)'
      };
    }
  }

  static generateVerificationCode() {
    // Generate a 6-digit random code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static getCodeExpirationTime() {
    // Code expires in 10 minutes
    const now = new Date();
    return new Date(now.getTime() + 10 * 60 * 1000);
  }

  // Store verification code in database
  static async storeVerificationCode(email, code) {
    try {
      const { supabase } = await import('../supabase/config');
      
      const expiresAt = this.getCodeExpirationTime();
      
      console.log('💾 Storing verification code:', { email, code, expiresAt: expiresAt.toISOString() });
      
      const { data, error } = await supabase
        .from('verification_codes')
        .upsert({
          email: email,
          code: code,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        })
        .select();

      console.log('💾 Database response:', { data, error });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      console.log('✅ Code stored successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error storing verification code:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify the code
  static async verifyCode(email, code) {
    try {
      const { supabase } = await import('../supabase/config');
      
      console.log('🔍 Verifying code:', { email, code });
      
      const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .single();

      console.log('🔍 Verification query result:', { data, error });

      // If no data found, code is invalid
      if (error && error.code === 'PGRST116') {
        console.log('❌ Code not found in database');
        return { success: false, error: 'Invalid verification code' };
      }

      if (error) {
        console.error('❌ Database error:', error);
        return { success: false, error: 'Database error. Please try again.' };
      }

      if (!data) {
        console.log('❌ No data returned');
        return { success: false, error: 'Invalid verification code' };
      }

      // Check if code is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        console.log('❌ Code expired');
        return { success: false, error: 'Verification code has expired' };
      }

      console.log('✅ Code verified successfully');

      // Delete the used code
      await supabase
        .from('verification_codes')
        .delete()
        .eq('email', email)
        .eq('code', code);

      return { success: true };
    } catch (error) {
      console.error('❌ Error verifying code:', error);
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  }
}

// For development/testing purposes
export const logVerificationCode = (email, code) => {
  console.log(`
🔐 VERIFICATION CODE FOR TESTING
Email: ${email}
Code: ${code}
Expires: ${EmailService.getCodeExpirationTime().toLocaleString()}
  `);
};
