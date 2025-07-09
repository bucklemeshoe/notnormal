# EmailJS Setup Guide for NotNormal Friday Five

## 🚀 Quick Setup (10 minutes)

Your form is now integrated with EmailJS! Follow these steps to configure your account:

### **Step 1: Get Your EmailJS Configuration**

1. **Login to EmailJS Dashboard**: https://www.emailjs.com/account
2. **Get your Public Key**:
   - Go to **"Account"** → **"General"**
   - Copy your **"Public Key"** 
3. **Create/Configure Email Service**:
   - Go to **"Email Services"** 
   - Add your email provider (Gmail, Outlook, etc.)
   - Note the **"Service ID"**

### **Step 2: Create Email Templates**

You need to create **2 email templates**:

#### **Template 1: Admin Notification (for you)**

**Template ID**: `admin_notification`

**Subject**: `New Friday Five Portfolio - {{fullName}}`

**HTML Content**:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
    <div style="background: #1a1a1a; color: white; padding: 30px; border-radius: 12px;">
        <h1 style="color: #6495ED; margin-bottom: 10px;">🎨 New Portfolio Submission</h1>
        <h2 style="color: #ffffff; margin-bottom: 30px;">NotNormal Friday Five</h2>
        
        <div style="background: #262626; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #6495ED; margin-bottom: 15px;">👤 Designer Details</h3>
            <p><strong>Name:</strong> {{fullName}}</p>
            <p><strong>Email:</strong> {{from_email}}</p>
            <p><strong>Location:</strong> {{location}}</p>
            <p><strong>LinkedIn:</strong> <a href="{{linkedin}}" style="color: #6495ED;">{{linkedin}}</a></p>
        </div>
        
        <div style="background: #262626; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #6495ED; margin-bottom: 15px;">🎯 Portfolio Information</h3>
            <p><strong>Portfolio URL:</strong> <a href="{{portfolioLink}}" style="color: #6495ED;">{{portfolioLink}}</a></p>
            <p><strong>Primary Focus:</strong> {{designFocus}}</p>
            <p><strong>Looking for:</strong> {{opportunities}}</p>
            <p><strong>Uploaded File:</strong> {{portfolioFile}}</p>
        </div>
        
        <div style="background: #262626; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #6495ED; margin-bottom: 15px;">💬 About Them</h3>
            <p style="line-height: 1.6;">{{bio}}</p>
        </div>
        
        <div style="background: #6495ED; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: white;"><strong>Submitted:</strong> {{submissionDate}}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="{{portfolioLink}}" style="background: #6495ED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px;">View Portfolio</a>
            <a href="mailto:{{from_email}}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px;">Reply to Designer</a>
        </div>
    </div>
</div>
```

#### **Template 2: User Confirmation (for the submitter)**

**Template ID**: `user_confirmation`

**Subject**: `Portfolio Received - NotNormal Friday Five`

**HTML Content**:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
    <div style="background: #1a1a1a; color: white; padding: 30px; border-radius: 12px;">
        <h1 style="color: #6495ED; margin-bottom: 10px;">🎉 Portfolio Received!</h1>
        <h2 style="color: #ffffff; margin-bottom: 30px;">NotNormal Friday Five</h2>
        
        <p style="font-size: 18px; margin-bottom: 20px;">Hi {{to_name}},</p>
        
        <p style="line-height: 1.6; margin-bottom: 20px;">
            Thank you for submitting your portfolio to NotNormal Friday Five! We've received your submission and our team will review it carefully.
        </p>
        
        <div style="background: #262626; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #6495ED; margin-bottom: 15px;">✅ What We Received</h3>
            <p><strong>Portfolio:</strong> <a href="{{portfolioLink}}" style="color: #6495ED;">{{portfolioLink}}</a></p>
            <p><strong>Focus Area:</strong> {{designFocus}}</p>
            <p><strong>Looking for:</strong> {{opportunities}}</p>
        </div>
        
        <div style="background: #262626; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #6495ED; margin-bottom: 15px;">📅 Next Steps</h3>
            <ul style="line-height: 1.8;">
                <li>We review all submissions by Wednesday</li>
                <li>If selected, we'll notify you by Thursday</li>
                <li>Your portfolio will be featured on Friday to our 20,518+ LinkedIn followers</li>
            </ul>
        </div>
        
        <div style="background: #262626; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #6495ED; margin-bottom: 15px;">🎯 Friday Five Benefits</h3>
            <ul style="line-height: 1.8;">
                <li>Job market exposure to recruiters and hiring managers</li>
                <li>Design community recognition and networking</li>
                <li>Valuable feedback and learning opportunities</li>
                <li>Professional portfolio showcase</li>
            </ul>
        </div>
        
        <div style="background: #6495ED; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: white;">📱 Stay Connected</h3>
            <p style="margin: 10px 0 0 0; color: white;">Follow us on LinkedIn to see Friday's featured portfolios and stay updated on the design community.</p>
        </div>
        
        <p style="line-height: 1.6; margin-bottom: 20px;">
            Questions? Reply to this email and we'll get back to you.
        </p>
        
        <p style="margin-bottom: 30px;">
            Best regards,<br>
            <strong>The NotNormal Friday Five Team</strong>
        </p>
        
        <div style="text-align: center; border-top: 1px solid #444; padding-top: 20px; color: #999;">
            <p style="margin: 0;">NotNormal - Showcasing extraordinary design talent</p>
        </div>
    </div>
</div>
```

### **Step 3: Update Your Configuration**

In your `script.js` file, replace these values:

```javascript
// EmailJS Configuration - Update these with your EmailJS account details
this.emailJSConfig = {
    publicKey: 'YOUR_ACTUAL_PUBLIC_KEY',        // From Step 1
    serviceId: 'YOUR_ACTUAL_SERVICE_ID',        // From Step 1
    adminTemplateId: 'admin_notification',      // From Step 2
    userTemplateId: 'user_confirmation'         // From Step 2
};
```

**Also update your email address**:
```javascript
to_email: 'your-actual-email@domain.com', // Replace with your email
```

---

## 🎯 EmailJS Dashboard Configuration

### **1. Email Templates Setup**

**Navigate to**: EmailJS Dashboard → **"Email Templates"** → **"Create New Template"**

**For each template:**
1. **Template Name**: Admin Notification / User Confirmation
2. **Template ID**: `admin_notification` / `user_confirmation`
3. **Subject**: Copy from templates above
4. **Content**: Paste HTML from templates above
5. **Test**: Send test email to verify formatting

### **2. Service Configuration**

**Supported Email Services:**
- **Gmail** (most common)
- **Outlook/Hotmail**
- **Yahoo Mail**
- **Custom SMTP**

**Gmail Setup:**
1. **Service Type**: Gmail
2. **Service ID**: Note this for your config
3. **User ID**: Your Gmail address
4. **Access Token**: Generated automatically

### **3. Public Key Setup**

**Navigate to**: Account → General → **"Public Key"**
- Copy this key for your configuration
- This allows your website to send emails

---

## 🧪 Testing Your Setup

### **1. Test Email Templates**

In EmailJS Dashboard:
1. **Go to Email Templates**
2. **Click "Test" on each template**
3. **Fill in sample data**
4. **Send test emails to yourself**

### **2. Test Form Integration**

1. **Update your config values** in `script.js`
2. **Submit a test portfolio** on your website
3. **Check that you receive**:
   - ✅ Admin notification with all details
   - ✅ User gets confirmation email
   - ✅ Files are stored in Netlify

### **3. Check Email Delivery**

- **Inbox**: Primary emails should arrive
- **Spam Folder**: Check if emails are filtered
- **Formatting**: Verify HTML renders correctly
- **Links**: Test portfolio and email links work

---

## 📊 EmailJS Pricing & Limits

### **Free Tier Includes:**
- **200 emails/month**
- **All email services**
- **Custom templates**
- **No setup fees**

### **Paid Plans:**
- **$15/month**: 1,000 emails
- **$30/month**: 10,000 emails
- **Custom plans** available

---

## 🔧 Advanced Configuration

### **Custom Variables**

You can add these variables to your email templates:

```javascript
// Available in all templates:
{{fullName}}         // Designer's name
{{from_email}}       // Designer's email
{{portfolioLink}}    // Portfolio URL
{{designFocus}}      // Design focus area
{{bio}}              // About section
{{opportunities}}    // What they're looking for
{{portfolioFile}}    // Uploaded file name
{{submissionDate}}   // When submitted
{{linkedin}}         // LinkedIn profile
{{location}}         // Location
{{siteUrl}}          // Your website URL
```

### **Email Service Backup**

For reliability, configure multiple email services:
1. **Primary**: Gmail
2. **Backup**: Outlook
3. **EmailJS automatically failover** if primary fails

### **Analytics Integration**

Track email performance:
```javascript
// Add to your email success callback
gtag('event', 'email_sent', {
    event_category: 'email',
    event_label: 'portfolio_notification'
});
```

---

## ✅ Setup Checklist

- [ ] EmailJS account configured with email service
- [ ] Public key and service ID copied
- [ ] Admin notification template created (`admin_notification`)
- [ ] User confirmation template created (`user_confirmation`)
- [ ] Configuration updated in `script.js`
- [ ] Your email address updated in admin notification
- [ ] Test emails sent and received successfully
- [ ] Form submission tested end-to-end
- [ ] Spam folder checked for email delivery
- [ ] HTML formatting verified in emails

**Your EmailJS integration is complete! You'll now receive beautifully formatted emails with all portfolio submission details.** 🎨✨

---

## 📞 Support

**EmailJS Issues:**
- **Documentation**: https://www.emailjs.com/docs/
- **Support**: https://www.emailjs.com/contact
- **Community**: GitHub Issues

**Integration Issues:**
- Check browser console for JavaScript errors
- Verify all configuration values are correct
- Test with simple text templates first
- Ensure EmailJS SDK loads properly 