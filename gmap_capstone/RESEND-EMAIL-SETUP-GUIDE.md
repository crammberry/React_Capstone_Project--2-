# 📧 Resend Email Setup Guide for Production

## 🚨 Current Issue
**Error**: "You can only send testing emails to your own email address"

**Why**: Resend's free tier requires domain verification to send emails to any address other than your registered email.

---

## ✅ **Quick Fix for Development/Testing**

The system now shows an **alert popup** with the verification code when email sending fails.

### How it works:
1. User enters email during registration
2. System tries to send email via Resend
3. If it fails → Shows alert with the 6-digit code
4. User copies the code from alert
5. Pastes it in the verification field
6. Registration continues normally

**This works for testing but NOT for production!**

---

## 🏭 **Production Solution: Verify Your Domain**

### Option 1: Use Your Own Domain (Recommended)

If you have a domain (e.g., `eternalmemorial.com`):

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/domains
   - Click "Add Domain"

2. **Add Your Domain**
   - Enter your domain: `eternalmemorial.com`
   - Click "Add"

3. **Add DNS Records**
   - Resend will show you DNS records to add
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add the DNS records (SPF, DKIM, DMARC)
   - Wait 24-48 hours for DNS propagation

4. **Update Edge Function**
   ```javascript
   // In supabase/functions/send-verification-code/index.ts
   const { data, error } = await resend.emails.send({
     from: 'noreply@eternalmemorial.com', // Use your domain
     to: email,
     subject: 'Email Verification Code',
     html: `Your code is: ${code}`
   });
   ```

5. **Verify Domain**
   - Return to Resend dashboard
   - Click "Verify" next to your domain
   - Once verified, you can send to ANY email!

---

### Option 2: Use Resend's Subdomain (Free)

If you don't have a domain:

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/domains
   - Click "Add Domain"

2. **Use Resend Subdomain**
   - Enter: `yourbusiness.resend.dev`
   - This is instantly verified!

3. **Update Edge Function**
   ```javascript
   from: 'noreply@yourbusiness.resend.dev'
   ```

4. **Done!** You can now send to any email.

---

### Option 3: Use a Different Email Service

If Resend doesn't work for you, alternatives:

#### **SendGrid** (Free tier: 100 emails/day)
```javascript
// Install: npm install @sendgrid/mail
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: email,
  from: 'noreply@yourdomain.com',
  subject: 'Verification Code',
  text: `Your code is: ${code}`
});
```

#### **Mailgun** (Free tier: 5,000 emails/month)
```javascript
// Install: npm install mailgun-js
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

await mailgun.messages().send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Verification Code',
  text: `Your code is: ${code}`
});
```

#### **AWS SES** (Free tier: 62,000 emails/month)
```javascript
// Install: npm install @aws-sdk/client-ses
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const client = new SESClient({ region: 'us-east-1' });
await client.send(new SendEmailCommand({
  Source: 'noreply@yourdomain.com',
  Destination: { ToAddresses: [email] },
  Message: {
    Subject: { Data: 'Verification Code' },
    Body: { Text: { Data: `Your code is: ${code}` } }
  }
}));
```

---

## 🔧 **Current Development Workaround**

### For Testing (Already Implemented):
1. User registers with any email
2. Alert popup shows the 6-digit code
3. User copies and pastes the code
4. Registration completes

### Files Modified:
- `src/services/EmailService.js` - Added alert fallback

---

## 📋 **Recommended Steps for Production**

1. **Short-term** (Now):
   - ✅ Use alert popup for testing
   - Test the entire registration flow
   - Verify code validation works

2. **Before Deployment** (Required):
   - [ ] Verify a domain in Resend
   - [ ] Update Edge Function with verified domain
   - [ ] Test with real emails
   - [ ] Remove alert fallback (optional)

3. **Alternative** (If Resend doesn't work):
   - [ ] Switch to SendGrid/Mailgun/AWS SES
   - [ ] Update Edge Function code
   - [ ] Test thoroughly

---

## 🎯 **Quick Test**

1. Refresh your app
2. Try registering with `amoromonste2@gmail.com`
3. You should see an **alert popup** with the code
4. Copy the code from the alert
5. Paste it in the verification field
6. Registration should complete!

---

## ❓ **Need Help?**

- **Resend Docs**: https://resend.com/docs
- **Domain Verification**: https://resend.com/docs/dashboard/domains/introduction
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

---

## 📝 **Summary**

**Current State**: ✅ Development mode with alert fallback  
**Production Ready**: ❌ Need domain verification  
**Timeline**: ~1-2 days for domain verification  
**Cost**: Free (with verified domain)

