# 📧 SendGrid FREE Setup Guide (No Money Required!)

## ✅ **100 Emails/Day FREE - Works for ALL Emails**

---

## 🚀 **Step-by-Step Setup (10 Minutes):**

### **Step 1: Create SendGrid Account (2 min)**

1. Go to: https://sendgrid.com/free
2. Click **"Start for Free"**
3. Fill in:
   - Email: Your email
   - Password: Create one
   - Click **"Create Account"**
4. **Verify your email** (check inbox)

---

### **Step 2: Get API Key (2 min)**

1. Log in to SendGrid dashboard
2. Go to **Settings** → **API Keys** (left sidebar)
3. Click **"Create API Key"**
4. Name: `Cemetery System`
5. Permissions: **"Full Access"**
6. Click **"Create & View"**
7. **COPY THE API KEY** (you won't see it again!)
   - It looks like: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### **Step 3: Add API Key to Supabase (2 min)**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Edge Functions** → **Secrets**
4. Click **"Add new secret"**
5. Name: `SENDGRID_API_KEY`
6. Value: (paste your SendGrid API key)
7. Click **"Save"**

---

### **Step 4: Deploy SendGrid Edge Function (2 min)**

#### **Option A: Using Supabase Dashboard**

1. Go to **Edge Functions** in Supabase
2. Click **"Create Function"**
3. Name: `send-verification-code-sendgrid`
4. Copy the code from: `supabase/functions/send-verification-code-sendgrid/index.ts`
5. Paste it
6. Click **"Deploy"**

#### **Option B: Using CLI (if you have it installed)**

```bash
cd React_Capstone_Project/gmap_capstone
supabase functions deploy send-verification-code-sendgrid
```

---

### **Step 5: Update EmailService.js (2 min)**

Open: `src/services/EmailService.js`

Find line 15 (the URL):
```javascript
const response = await fetch(`${supabaseUrl}/functions/v1/send-verification-code`, {
```

Change to:
```javascript
const response = await fetch(`${supabaseUrl}/functions/v1/send-verification-code-sendgrid`, {
```

Save the file!

---

### **Step 6: Test It! (2 min)**

1. Refresh your app (`Ctrl + Shift + R`)
2. Click **"Register"**
3. Enter **ANY email** (test@gmail.com, friend@yahoo.com, etc.)
4. Fill in the form
5. **Check the email inbox** - code should arrive!
6. **No more alert popups!** ✅

---

## 📧 **What Users Will Receive:**

**From:** San Juan Cemetery (via SendGrid)  
**Subject:** Your Verification Code  
**Content:** Beautiful HTML email with 6-digit code

---

## 🎯 **SendGrid Free Tier Limits:**

- ✅ **100 emails/day** (3,000/month)
- ✅ **Works for ANY email address**
- ✅ **No domain verification needed**
- ✅ **No credit card required**
- ✅ **Forever free**

**Perfect for:**
- Testing and development
- Small to medium cemeteries
- Up to 100 registrations per day

---

## 🔧 **Troubleshooting:**

### **Issue: "Sender not verified"**

**Solution:**
1. Go to SendGrid → Settings → Sender Authentication
2. Click **"Verify Single Sender"**
3. Enter your email
4. Verify it
5. Use that email as the "from" address

### **Issue: Emails going to spam**

**Solution:**
- This is normal for free tier
- Tell users to check spam folder
- For production, upgrade or use a custom domain

### **Issue: API key not working**

**Solution:**
1. Make sure you copied the FULL key
2. Check it's added to Supabase secrets correctly
3. Redeploy the Edge Function

---

## 🚀 **For Production (Later):**

When you're ready to deploy to Vercel:

### **Option 1: Stay on SendGrid Free**
- Works fine for small scale
- Just deploy as-is

### **Option 2: Upgrade SendGrid ($20/month)**
- 40,000 emails/month
- Better deliverability
- No "via SendGrid" in emails

### **Option 3: Buy Domain + Use SendGrid**
- Buy domain ($10/year)
- Verify it in SendGrid
- Professional emails: `noreply@sanjuancemetery.com`
- Best deliverability

---

## ✅ **Summary:**

**Cost:** $0 (FREE!)  
**Time:** 10 minutes  
**Emails:** 100/day to ANY address  
**Works on:** Vercel, anywhere  
**Perfect for:** Development, testing, small production  

---

## 🎯 **Next Steps:**

1. ✅ Sign up for SendGrid
2. ✅ Get API key
3. ✅ Add to Supabase
4. ✅ Deploy function
5. ✅ Update EmailService.js
6. ✅ Test registration
7. ✅ Done! 🎉

---

**This is the FREE solution you're looking for!** 🚀

