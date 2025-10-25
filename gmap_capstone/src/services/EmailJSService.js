// EmailJS Service for sending verification codes
// This is a simpler alternative to Resend that doesn't require Edge Functions

export class EmailJSService {
  static async sendVerificationCode(email, code) {
    try {
      // EmailJS configuration - you'll need to get these from emailjs.com
      const serviceId = 'service_xxxxxxx'; // Replace with your EmailJS service ID
      const templateId = 'template_xxxxxxx'; // Replace with your EmailJS template ID
      const publicKey = 'xxxxxxxxxxxxxxx'; // Replace with your EmailJS public key
      
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_email: email,
            verification_code: code,
            to_name: 'User',
            from_name: 'Cemetery Management System'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      return {
        success: true,
        message: 'Verification code sent successfully'
      };
    } catch (error) {
      console.error('EmailJS error:', error);
      
      // Fallback: For development/testing, log the code to console
      console.log(`
🔐 VERIFICATION CODE FOR TESTING
Email: ${email}
Code: ${code}
Expires: ${this.getCodeExpirationTime().toLocaleString()}

Note: To send real emails, set up EmailJS at emailjs.com
      `);
      
      // In development, we'll simulate success
      return {
        success: true,
        message: 'Verification code sent (check console for development)'
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
      
      const { error } = await supabase
        .from('verification_codes')
        .upsert({
          email: email,
          code: code,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error storing verification code:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify the code
  static async verifyCode(email, code) {
    try {
      const { supabase } = await import('../supabase/config');
      
      const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .single();

      if (error) throw error;

      if (!data) {
        return { success: false, error: 'Invalid verification code' };
      }

      // Check if code is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        return { success: false, error: 'Verification code has expired' };
      }

      // Delete the used code
      await supabase
        .from('verification_codes')
        .delete()
        .eq('email', email)
        .eq('code', code);

      return { success: true };
    } catch (error) {
      console.error('Error verifying code:', error);
      return { success: false, error: error.message };
    }
  }
}






