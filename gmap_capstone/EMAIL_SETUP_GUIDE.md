# 📧 Free Email Service Setup Guide

This guide will help you set up **Resend** (free email service) with your Supabase project to send real verification codes.

## 🆓 **Resend Setup (100% Free)**

### **Step 1: Create Resend Account**
1. Go to [resend.com](https://resend.com)
2. Click **"Sign Up"**
3. Enter your email and create password
4. **No credit card required!**

### **Step 2: Get API Key**
1. After signing up, go to **API Keys** section
2. Click **"Create API Key"**
3. Name it: `Cemetery Management`
4. Copy the API key (starts with `re_`)

### **Step 3: Configure Supabase Edge Functions**

#### **Option A: Using Supabase CLI (Recommended)**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the Edge Function
supabase functions deploy send-verification-code
```

#### **Option B: Using Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click **"Create Function"**
4. Name: `send-verification-code`
5. Copy the code from `supabase/functions/send-verification-code/index.ts`
6. Click **"Deploy"**

### **Step 4: Set Environment Variables**
1. In Supabase Dashboard, go to **Settings** → **Edge Functions**
2. Add environment variable:
   - **Key**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (starts with `re_`)

### **Step 5: Update Email Domain (Optional)**
In the Edge Function code, change this line:
```typescript
from: 'Cemetery Management <noreply@yourdomain.com>'
```
To your actual domain or keep it as is (Resend will use their domain).

## 🚀 **Alternative: EmailJS Setup (Easier)**

If you prefer a simpler setup without Edge Functions:

### **Step 1: Create EmailJS Account**
1. Go to [emailjs.com](https://emailjs.com)
2. Sign up for free account
3. **200 emails/month free**

### **Step 2: Configure Email Service**
1. In EmailJS dashboard, go to **Email Services**
2. Choose **Gmail** or **Outlook**
3. Connect your email account
4. Note the **Service ID**

### **Step 3: Create Email Template**
1. Go to **Email Templates**
2. Create new template with:
   - **Subject**: `Your Verification Code`
   - **Content**: 
   ```
   Your verification code is: {{code}}
   This code expires in 10 minutes.
   ```

### **Step 4: Update EmailService.js**
Replace the `sendVerificationCode` method with:

```javascript
static async sendVerificationCode(email, code) {
  try {
    // EmailJS configuration
    const serviceId = 'YOUR_SERVICE_ID';
    const templateId = 'YOUR_TEMPLATE_ID';
    const publicKey = 'YOUR_PUBLIC_KEY';
    
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
          code: code,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return { success: true, message: 'Verification code sent successfully' };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error: error.message };
  }
}
```

## 🧪 **Testing Your Setup**

### **Test with Console Logs (Current)**
1. Open browser console
2. Try registering with an email
3. Check console for verification code
4. Enter the code to verify

### **Test with Real Emails**
1. Set up Resend or EmailJS
2. Try registering with your real email
3. Check your inbox for verification code
4. Enter the code to verify

## 📊 **Free Tier Limits**

### **Resend**
- ✅ **3,000 emails/month free**
- ✅ **No credit card required**
- ✅ **Professional emails**
- ✅ **Good deliverability**

### **EmailJS**
- ✅ **200 emails/month free**
- ✅ **No backend required**
- ✅ **Easy setup**
- ✅ **Multiple email providers**

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Function not found" error**
   - Make sure Edge Function is deployed
   - Check function name matches exactly

2. **"API key invalid" error**
   - Verify Resend API key is correct
   - Check environment variable is set

3. **Emails not received**
   - Check spam folder
   - Verify email address is correct
   - Check Resend dashboard for delivery status

### **Debug Steps:**
1. Check browser console for errors
2. Check Supabase Edge Functions logs
3. Check Resend dashboard for email status
4. Test with different email addresses

## 🎯 **Next Steps**

1. **Choose your email service** (Resend recommended)
2. **Follow the setup steps** above
3. **Test the verification flow**
4. **Deploy to production** when ready

Your email verification system will be **fully functional** with real emails! 🎉





