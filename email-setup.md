# Email Notifications Setup for NotNormal Friday Five

## 📧 Setting Up Email Notifications in Netlify

### **Step 1: Configure Admin Notifications**

1. **Go to your Netlify Dashboard**
2. **Navigate to**: Site → Forms → Settings & Usage
3. **Add notification emails** where you want to receive submissions
4. **Custom email template** (optional - see templates below)

### **Step 2: Set Up Autoresponder for Submitters**

1. **In Netlify Dashboard**: Forms → Settings & Usage
2. **Scroll to "Email notifications"**
3. **Add autoresponder email** to send confirmation to users
4. **Use the template below** for professional confirmation

---

## 📝 Email Templates

### **1. Admin Notification Email (for you)**

**Subject**: `New Friday Five Portfolio Submission - {{fullName}}`

**Body**:
```
🎨 NEW PORTFOLIO SUBMISSION - NotNormal Friday Five

👤 DESIGNER DETAILS:
Name: {{fullName}}
Email: {{email}}
Location: {{location}}
LinkedIn: {{linkedin}}

🎯 PORTFOLIO INFO:
Portfolio URL: {{portfolioLink}}
Primary Focus: {{designFocus}}
Opportunities: {{opportunities}}

💬 ABOUT THEM:
{{bio}}

📎 UPLOADED FILE: {{portfolioFile}}

---
Submitted: {{created_at}}
View in Netlify: https://app.netlify.com/sites/YOUR-SITE-NAME/forms

Quick Actions:
• Visit their portfolio: {{portfolioLink}}
• Connect on LinkedIn: {{linkedin}}
• Reply to: {{email}}
```

### **2. Confirmation Email (for the submitter)**

**Subject**: `Portfolio Received - NotNormal Friday Five`

**Body**:
```
Hi {{fullName}},

🎉 Thank you for submitting your portfolio to NotNormal Friday Five!

We've received your submission and our team will review it carefully. Here's what happens next:

✅ WHAT WE RECEIVED:
• Portfolio: {{portfolioLink}}
• Focus Area: {{designFocus}}
• Looking for: {{opportunities}}

📅 NEXT STEPS:
• We review all submissions by Wednesday
• If selected, we'll notify you by Thursday
• Your portfolio will be featured on Friday to our 20,518+ LinkedIn followers

🎯 FRIDAY FIVE BENEFITS:
• Job market exposure to recruiters and hiring managers
• Design community recognition and networking
• Valuable feedback and learning opportunities
• Professional portfolio showcase

📱 STAY CONNECTED:
Follow us on LinkedIn to see Friday's featured portfolios and stay updated on the design community.

Questions? Reply to this email and we'll get back to you.

Best regards,
The NotNormal Friday Five Team

---
NotNormal - Showcasing extraordinary design talent
LinkedIn: [Your LinkedIn Profile]
```

---

## ⚙️ Quick Setup Instructions

### **Option 1: Basic Netlify Notifications**

1. **Netlify Dashboard** → Your Site → **Forms** 
2. **Settings & Usage** tab
3. **Email to notify**: Add your email address
4. **Save**

You'll receive basic form data in a simple email format.

### **Option 2: Advanced Email Templates**

1. **Follow Option 1** for basic setup
2. **Consider using Zapier** or **Integromat** to:
   - Send custom formatted emails
   - Add submissions to Google Sheets
   - Post to Slack/Discord
   - Create tasks in project management tools

### **Option 3: Custom Email Service**

For maximum control, integrate with:
- **SendGrid** - Professional email delivery
- **Mailgun** - Developer-friendly email API  
- **EmailJS** - Client-side email sending
- **AWS SES** - Cost-effective email service

---

## 🔧 Advanced Features You Can Add

### **Automated Workflow Ideas:**

1. **Auto-categorize submissions** by design focus
2. **Create calendar events** for review deadlines
3. **Auto-response with submission number** for tracking
4. **Slack notifications** for team collaboration
5. **Portfolio link verification** checks
6. **Duplicate submission detection**

### **Analytics & Tracking:**

1. **Track submission sources** (LinkedIn, direct, etc.)
2. **Monitor submission conversion rates**
3. **Popular design focus areas**
4. **Geographic distribution of designers**

### **Follow-up Automation:**

1. **Thursday notification emails** (accepted/rejected)
2. **Friday feature announcement** to selected designers
3. **Quarterly portfolio review** follow-ups
4. **Design community newsletter** signup

---

## 📊 Email Setup Checklist

- [ ] Basic Netlify notification emails configured
- [ ] Your admin email added for notifications  
- [ ] Autoresponder confirmation email set up
- [ ] Email templates customized with your branding
- [ ] Test submission completed and verified
- [ ] Spam folder checked for email delivery
- [ ] Email template formatting tested
- [ ] Professional signature added to emails

**Your Friday Five email system is ready to collect and manage designer portfolios! 🎨✨** 