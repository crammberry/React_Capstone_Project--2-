# 📧 Mailgun Complete Setup Guide - BEST for Your Cemetery System

## 🏆 **Why Mailgun is Best for You:**

✅ **5,000 emails/month FREE** (vs SendGrid's 3,000)  
✅ **Perfect for automation** (exhumation emails, reminders)  
✅ **Works for ALL emails** (no domain needed)  
✅ **Scales with your system**  
✅ **Industry-standard reliability**  

---

## 🚀 **Complete Setup (15 Minutes):**

### **Step 1: Create Mailgun Account (3 min)**

1. **Go to**: https://signup.mailgun.com/new/signup
2. **Fill in**:
   - Email: Your email
   - Password: Create one
   - Company name: San Juan Cemetery (or any name)
3. **Click**: "Sign Up"
4. **Verify email**: Check inbox and click verification link
5. **Verify phone**: They'll send SMS code (required for free tier)

---

### **Step 2: Get Your Credentials (3 min)**

After logging in:

1. **Go to**: Dashboard → Sending → Domain settings
2. You'll see your **Sandbox Domain**:
   ```
   sandboxXXXXXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org
   ```
   **Copy this!** ✂️

3. **Go to**: Settings → API Keys (left sidebar)
4. Find **"Private API key"**:
   ```
   key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   **Copy this!** ✂️

---

### **Step 3: Add Authorized Recipients (2 min)**

⚠️ **Important**: Sandbox domain can only send to authorized emails!

1. **Go to**: Sending → Authorized Recipients
2. **Click**: "Add Recipient"
3. **Add your email**: `amoromonste@gmail.com`
4. **Check email** and click verification link
5. **Repeat** for any other test emails you want to use

**Note**: You can add up to 5 authorized recipients for testing!

---

### **Step 4: Add Credentials to Supabase (2 min)**

1. **Go to**: https://supabase.com/dashboard
2. **Select** your project
3. **Go to**: Settings → Edge Functions → Secrets
4. **Add two secrets**:

   **Secret 1:**
   - Name: `MAILGUN_API_KEY`
   - Value: `key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (your Private API key)
   - Click "Add"

   **Secret 2:**
   - Name: `MAILGUN_DOMAIN`
   - Value: `sandboxXXXXXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org` (your Sandbox domain)
   - Click "Add"

---

### **Step 5: Deploy Mailgun Edge Function (3 min)**

#### **Option A: Using Supabase Dashboard (Easier)**

1. **Go to**: Edge Functions in Supabase
2. **Click**: "Create Function"
3. **Name**: `send-verification-code-mailgun`
4. **Copy** the entire code from:
   `supabase/functions/send-verification-code-mailgun/index.ts`
5. **Paste** it in the editor
6. **Click**: "Deploy"

#### **Option B: Using Supabase CLI**

```bash
cd React_Capstone_Project/gmap_capstone
supabase functions deploy send-verification-code-mailgun
```

---

### **Step 6: Update EmailService.js (2 min)**

1. **Open**: `src/services/EmailService.js`

2. **Find line ~15** (the fetch URL):
```javascript
const response = await fetch(`${supabaseUrl}/functions/v1/send-verification-code`, {
```

3. **Change to**:
```javascript
const response = await fetch(`${supabaseUrl}/functions/v1/send-verification-code-mailgun`, {
```

4. **Save** the file!

---

### **Step 7: Test It! (2 min)**

1. **Refresh** your app (`Ctrl + Shift + R`)
2. **Click** "Register"
3. **Enter** an authorized email (e.g., `amoromonste@gmail.com`)
4. **Fill** in the form
5. **Check** your email inbox - code should arrive!
6. **No more alert popups!** ✅

---

## 📧 **What Users Will Receive:**

**From:** San Juan Cemetery <noreply@sandboxXXXX.mailgun.org>  
**Subject:** Your Verification Code  
**Content:** Beautiful HTML email with large 6-digit code  

---

## ⚠️ **Important: Sandbox Limitations**

### **Sandbox Domain (FREE tier):**
- ✅ 5,000 emails/month
- ⚠️ Can only send to **authorized recipients** (up to 5 emails)
- ⚠️ Shows "via mailgun.org" in email

### **To Send to ANY Email (Production):**

You have 2 options:

#### **Option 1: Add Credit Card (Still FREE)**
1. Go to Billing → Add payment method
2. Add credit card (won't be charged)
3. Mailgun verifies you're real
4. **Sandbox domain now works for ALL emails!**
5. Still FREE 5,000 emails/month

#### **Option 2: Add Your Own Domain**
1. Buy domain: `sanjuancemetery.com` ($10/year)
2. Add to Mailgun
3. Verify DNS records
4. Send from: `noreply@sanjuancemetery.com`
5. Professional + works for all emails

---

## 🎯 **Recommended Path:**

### **For Development/Testing (Now):**
1. ✅ Use sandbox domain
2. ✅ Add 5 authorized test emails
3. ✅ Test all features
4. ✅ Build your system

### **Before Vercel Deployment (Production):**

**Option A: Add Credit Card (FREE)**
- Takes 2 minutes
- Still completely FREE
- Works for ALL emails immediately
- **Recommended for quick deployment**

**Option B: Buy Domain ($10/year)**
- More professional
- Better deliverability
- Custom email address
- **Recommended for long-term**

---

## 🤖 **Perfect for Your Automation:**

With 5,000 emails/month, you can send:

- ✅ **Registration codes**: ~50/day
- ✅ **Exhumation approvals**: ~20/day
- ✅ **Payment reminders**: ~30/day
- ✅ **Status updates**: ~20/day
- ✅ **Document requests**: ~20/day
- ✅ **Reservation confirmations**: ~20/day

**Total: ~160 emails/day** - Perfect fit! ✨

---

## 🚀 **For Future Automation:**

The same Mailgun setup will work for:

1. **Exhumation Approved** → Auto-email user
2. **Payment Due** → Auto-reminder
3. **Document Missing** → Auto-request
4. **Plot Reserved** → Auto-confirmation

Just create new Edge Functions using the same Mailgun credentials!

---

## 🔧 **Troubleshooting:**

### **Issue: "Recipient not authorized"**

**Solution:**
1. Go to Mailgun → Authorized Recipients
2. Add the email address
3. Verify it via email link
4. Try again

### **Issue: "Invalid credentials"**

**Solution:**
1. Check API key is correct in Supabase
2. Check domain is correct in Supabase
3. Redeploy the Edge Function

### **Issue: Emails going to spam**

**Solution:**
- Normal for sandbox domain
- Tell users to check spam
- For production, add credit card or use custom domain

---

## ✅ **Summary:**

**Cost:** $0 (FREE)  
**Time:** 15 minutes  
**Emails:** 5,000/month (166/day)  
**Works for:** Development now, production later  
**Perfect for:** Your cemetery system with automation  

---

## 🎯 **Next Steps:**

1. ✅ Sign up for Mailgun
2. ✅ Get API key and domain
3. ✅ Add authorized recipients
4. ✅ Add credentials to Supabase
5. ✅ Deploy Edge Function
6. ✅ Update EmailService.js
7. ✅ Test with authorized email
8. ✅ Build your features!
9. ⏳ Before deployment: Add credit card OR buy domain
10. ✅ Deploy to Vercel!

---

**This is the BEST solution for your cemetery system!** 🏆

