# NotNormal Friday Five

A modern, responsive website for collecting designer portfolio submissions for the NotNormal Friday Five LinkedIn showcase.

## 🎯 Purpose

NotNormal Friday Five helps showcase talented designers to thousands of LinkedIn followers every Friday. The platform provides:

- **Job Market Exposure** - Connect designers with recruiters and hiring managers
- **Design Community Recognition** - Build professional networks within the design community  
- **Valuable Feedback** - Foster constructive feedback and learning opportunities

## ✨ Features

### 📝 Portfolio Submission Form
- **Basic Information Collection** - Name, email, LinkedIn profile, location
- **Portfolio Details** - Portfolio link, design focus, bio, opportunity preferences
- **File Upload Support** - PDF, ZIP, RAR files up to 10MB with drag-and-drop functionality
- **Consent Management** - Clear agreement terms for public sharing

### 🎨 Modern UI/UX
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Interactive Elements** - Hover effects, smooth animations, and transitions
- **Professional Styling** - Clean, modern design with gradient accents
- **Accessibility** - Proper form labels, keyboard navigation, and ARIA attributes

### ✅ Form Validation
- **Real-time Validation** - Instant feedback as users type
- **Field-specific Rules** - Email format, URL validation, required fields
- **File Type/Size Validation** - Ensures only appropriate files are uploaded
- **Visual Feedback** - Color-coded success/error states

### 📱 User Experience
- **Drag & Drop File Upload** - Intuitive file selection
- **Loading States** - Clear feedback during form submission
- **Success Messaging** - Confirmation of successful submissions
- **FAQ Section** - Answers common questions

## 📁 File Structure

```
notnormal/
├── index.html          # Main website page
├── style.css           # All styling and responsive design
├── script.js           # Form handling and validation logic
└── README.md          # This documentation
```

## 🚀 Quick Start

### Option 1: Simple Static Hosting

1. **Download/Clone the files** to your local machine
2. **Open `index.html`** in a web browser to test locally
3. **Upload to any static hosting service**:
   - GitHub Pages
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Google Cloud Storage

### Option 2: Local Development Server

```bash
# Using Python (if you have Python installed)
python -m http.server 8000

# Using Node.js (if you have Node.js installed)
npx serve .

# Using PHP (if you have PHP installed)
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 🔧 Customization

### Update Branding
1. **Hero Section** - Edit the title, subtitle, and stats in `index.html`
2. **Color Scheme** - Modify CSS variables in `style.css` for brand colors
3. **Example Profiles** - Replace placeholder profile cards with real examples

### Form Configuration
1. **Add/Remove Fields** - Modify form fields in `index.html`
2. **Validation Rules** - Update validation logic in `script.js`
3. **File Types** - Change accepted file types in the JavaScript file upload handler

### Content Updates
1. **FAQ Section** - Update questions and answers in `index.html`
2. **Benefits** - Modify the "Why Submit" section content
3. **Footer** - Update copyright and contact information

## 📤 Form Submission Setup

The current implementation includes a demonstration form handler. For production use, you'll need to implement backend processing:

### Option 1: Form Services (Easiest)
- **Netlify Forms** - Built-in form handling with Netlify hosting
- **Formspree** - Third-party form processing service
- **Google Forms** - Redirect to a Google Form for submissions

### Option 2: Custom Backend
- **Node.js/Express** - Server-side JavaScript processing
- **PHP** - Traditional server-side processing
- **Python/Flask** - Lightweight Python backend
- **Firebase Functions** - Serverless form processing

### Option 3: Integration APIs
- **Google Drive API** - Direct upload to Google Drive
- **Airtable API** - Store submissions in Airtable
- **Notion API** - Create database entries in Notion

## 📊 Analytics & Tracking

The site includes placeholder Google Analytics tracking. To enable:

1. **Add your Google Analytics tracking ID**
2. **Include the gtag script** in the HTML head
3. **Uncomment tracking calls** in `script.js`

## 🔒 Security Considerations

### File Upload Security
- File type validation (client and server-side)
- File size limits (10MB default)
- Virus scanning (recommended for production)
- Secure file storage with access controls

### Form Security  
- CSRF protection (implement server-side)
- Rate limiting for submissions
- Input sanitization and validation
- Spam protection (reCAPTCHA recommended)

## 📱 Mobile Responsiveness

The site is fully responsive with breakpoints:
- **Desktop**: 1200px+ (full grid layouts)
- **Tablet**: 768px-1199px (adjusted columns)
- **Mobile**: Below 768px (single column, stacked layouts)

## 🎨 Design System

### Colors
- **Primary**: #667eea (Brand purple)
- **Secondary**: #764ba2 (Gradient purple)
- **Accent**: #fbbf24 (Gold highlight)
- **Success**: #22c55e (Green)
- **Error**: #ef4444 (Red)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: 600-700 weight
- **Body**: 400 weight
- **UI Elements**: 500 weight

## 📈 Performance Optimization

- **Optimized Images** - Use appropriate formats and sizes
- **Minified CSS/JS** - Reduce file sizes for production
- **CDN Delivery** - Serve static assets from CDN
- **Lazy Loading** - Implement for images and heavy content

## 🆘 Troubleshooting

### Common Issues

**Form not submitting?**
- Check browser console for JavaScript errors
- Verify all required fields are filled
- Ensure file upload meets size/type requirements

**Styling issues?**
- Clear browser cache
- Check for CSS conflicts
- Verify proper file paths

**Mobile layout problems?**
- Test on actual devices
- Use browser dev tools responsive mode
- Check viewport meta tag

### Browser Support
- **Modern browsers**: Chrome 70+, Firefox 60+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 70+
- **Internet Explorer**: Not supported (uses modern CSS Grid and JavaScript features)

## 📞 Support

For questions about implementation or customization:

1. **Check the FAQ section** in the website
2. **Review this documentation** for setup instructions
3. **Test in browser developer tools** for debugging
4. **Validate HTML/CSS** using online validators

## 📄 License

This project is provided as-is for the NotNormal Friday Five initiative. Feel free to modify and adapt for your specific needs.

---

**Ready to showcase amazing designers?** 🎨 Upload the files to your hosting platform and start collecting portfolio submissions! 