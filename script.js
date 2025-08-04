// Portfolio Submission Form Handler
class PortfolioFormHandler {
    constructor() {
        this.form = document.getElementById('portfolioForm');
        this.fileInput = document.getElementById('portfolioFile');
        this.fileHelper = document.querySelector('.file-input-helper');
        this.submitButton = document.querySelector('.btn-submit');
        
        // EmailJS Configuration - Update these with your EmailJS account details
        this.emailJSConfig = {
            publicKey: 'JoiXb9s3kPui-MuSM', // Get from EmailJS dashboard
            serviceId: 'service_bg9ww4m',          // Get from EmailJS dashboard  
            adminTemplateId: 'template_admin_notify',      // Admin notification template
            userTemplateId: 'template_user_confirm'         // User confirmation template
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFileUpload();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Mark fields as touched when users interact with them
        this.form.addEventListener('focus', (e) => {
            if (e.target.matches('input, select, textarea')) {
                e.target.dataset.touched = 'true';
            }
        }, true);
        
        this.form.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                e.target.dataset.touched = 'true';
                this.validateField(e.target);
            }
        }, true);
        
        // Real-time validation for touched fields
        this.form.addEventListener('input', (e) => {
            if (e.target.dataset.touched) {
                this.validateField(e.target);
            }
        });
        
        this.form.addEventListener('change', (e) => {
            if (e.target.matches('input, select, textarea')) {
                e.target.dataset.touched = 'true';
                this.validateField(e.target);
            }
        });
    }

    setupFileUpload() {
        // Click to upload
        this.fileHelper.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File selection change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files[0]);
        });

        // Drag and drop functionality
        this.fileHelper.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileHelper.classList.add('drag-over');
        });

        this.fileHelper.addEventListener('dragleave', () => {
            this.fileHelper.classList.remove('drag-over');
        });

        this.fileHelper.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileHelper.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            this.handleFileSelection(file);
        });
    }

    handleFileSelection(file) {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['.pdf', '.zip', '.rar'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            this.showMessage('Please upload a PDF, ZIP, or RAR file.', 'error');
            return;
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            this.showMessage('File size must be less than 10MB.', 'error');
            return;
        }

        // Update UI to show selected file
        this.updateFileDisplay(file);
    }

    updateFileDisplay(file) {
        const fileSize = this.formatFileSize(file.size);
        this.fileHelper.innerHTML = `
            <div class="file-selected">
                <span class="file-icon">📄</span>
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <small class="file-size">${fileSize}</small>
                </div>
                <button type="button" class="remove-file" onclick="portfolioForm.removeFile()">✕</button>
            </div>
        `;
    }

    removeFile() {
        this.fileInput.value = '';
        this.fileHelper.innerHTML = `
            <span>Drop your portfolio file here or click to browse</span>
            <small>Accepted formats: PDF, ZIP, RAR (Max 10MB)</small>
        `;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    setupFormValidation() {
        // Email validation
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', () => this.validateEmail(emailInput));

        // URL validation for LinkedIn
        const linkedinInput = document.getElementById('linkedin');
        linkedinInput.addEventListener('blur', () => this.validateLinkedIn(linkedinInput));
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        
        // Remove previous validation classes
        field.classList.remove('valid', 'invalid');
        
        // Only validate if user has interacted with the field
        if (!field.dataset.touched) {
            return true;
        }
        
        // Skip validation if field is empty and not required
        if (!value && !field.required) {
            return true;
        }

        // Required field validation
        if (field.required && !value) {
            field.classList.add('invalid');
            return false;
        }

        // Field-specific validation
        switch (fieldName) {
            case 'email':
                return this.validateEmail(field);
            case 'linkedin':
                return this.validateLinkedIn(field);
            case 'portfolioLink':
                return this.validatePortfolioLink(field);
            default:
                if (value) {
                    field.classList.add('valid');
                }
                return true;
        }
    }

    validateEmail(field) {
        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            field.classList.add('invalid');
            return false;
        } else if (email) {
            field.classList.add('valid');
        }
        return true;
    }

    validateLinkedIn(field) {
        const url = field.value.trim();
        if (!url) return true; // Optional field
        
        const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
        
        if (!linkedinRegex.test(url)) {
            field.classList.add('invalid');
            this.showFieldError(field, 'Please enter a valid LinkedIn profile URL');
            return false;
        } else {
            field.classList.add('valid');
            this.clearFieldError(field);
        }
        return true;
    }

    validatePortfolioLink(field) {
        const url = field.value.trim();
        if (!url) return false; // Required field
        
        try {
            new URL(url);
            field.classList.add('valid');
            this.clearFieldError(field);
            return true;
        } catch {
            field.classList.add('invalid');
            this.showFieldError(field, 'Please enter a valid portfolio URL');
            return false;
        }
    }

    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);
        
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        // Insert after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Check consent checkbox
        const consentCheckbox = document.getElementById('consent');
        if (!consentCheckbox.checked) {
            isValid = false;
            this.showMessage('Please agree to the terms to submit your portfolio.', 'error');
        }

        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showMessage('Please fix the errors above before submitting.', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Simulate form submission (replace with actual API call)
            await this.submitForm();
            this.showSuccessMessage();
            this.resetForm();
        } catch (error) {
            this.showMessage('There was an error submitting your portfolio. Please try again.', 'error');
            console.error('Submission error:', error);
        } finally {
            this.setLoadingState(false);
        }
    }

    async submitForm() {
        // Prepare form data for Netlify
        const formData = new FormData();
        
        // Add form name first for Netlify detection
        formData.append('form-name', 'portfolio-submission');
        
        // Add all form fields manually to ensure proper handling
        const formElements = this.form.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
            if (element.type === 'file') {
                // Handle file upload specifically
                if (element.files.length > 0) {
                    formData.append(element.name, element.files[0]);
                    console.log(`File uploaded: ${element.files[0].name} (${element.files[0].size} bytes)`);
                }
            } else if (element.type === 'checkbox') {
                // Handle checkbox
                if (element.checked) {
                    formData.append(element.name, element.value || 'on');
                }
            } else if (element.name && element.value) {
                // Handle all other form fields
                formData.append(element.name, element.value);
            }
        });
        
        // Extract form data for EmailJS
        const emailData = this.extractFormDataForEmail(formData);
        
        // Log form data for verification
        console.log('Submitting to Netlify Forms:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: ${value.name} (${value.type}, ${value.size} bytes)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        // Submit to Netlify Forms
        const response = await fetch('/', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Submission failed: ${response.status}`);
        }
        
        console.log('Form submitted successfully to Netlify');
        
        // Send emails via EmailJS if configured
        await this.sendEmailNotifications(emailData);
        
        return { success: true };
    }

    extractFormDataForEmail(formData) {
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                data[key] = value.name ? `${value.name} (${this.formatFileSize(value.size)})` : 'No file uploaded';
            } else {
                data[key] = value;
            }
        }
        
        // Add formatted timestamp
        data.submissionDate = new Date().toLocaleString();
        data.siteUrl = window.location.origin;
        
        return data;
    }

    async sendEmailNotifications(emailData) {
        // Skip if EmailJS not configured
        if (!this.isEmailJSConfigured()) {
            console.log('EmailJS not configured - skipping email notifications');
            return;
        }

        try {
            // Initialize EmailJS
            emailjs.init(this.emailJSConfig.publicKey);
            
            // Send admin notification
            await emailjs.send(
                this.emailJSConfig.serviceId,
                this.emailJSConfig.adminTemplateId,
                {
                    to_email: 'jared@makefriendly.co.za', // Update with your email
                    from_name: emailData.fullName,
                    from_email: emailData.email,
                    subject: `New Friday Five Portfolio - ${emailData.fullName}`,
                    fullName: emailData.fullName,
                    email: emailData.email,
                    linkedin: emailData.linkedin || 'Not provided',
                    location: emailData.location || 'Not provided',
                    portfolioLink: emailData.portfolioLink,
                    designFocus: emailData.designFocus,
                    bio: emailData.bio || 'Not provided',
                    opportunities: emailData.opportunities,
                    portfolioFile: emailData.portfolioFile || 'No file uploaded',
                    submissionDate: emailData.submissionDate,
                    siteUrl: emailData.siteUrl
                }
            );

            // Send user confirmation
            await emailjs.send(
                this.emailJSConfig.serviceId,
                this.emailJSConfig.userTemplateId,
                {
                    email: emailData.email,           // Fixed: matches {{email}} in template
                    to_name: emailData.fullName,
                    fullName: emailData.fullName,     // Added for consistency
                    portfolioLink: emailData.portfolioLink,
                    designFocus: emailData.designFocus,
                    opportunities: emailData.opportunities,
                    submissionDate: emailData.submissionDate
                }
            );

            console.log('Email notifications sent successfully');
        } catch (error) {
            console.error('Failed to send email notifications:', error);
            // Don't throw error - form submission should still succeed
        }
    }

    isEmailJSConfigured() {
        return this.emailJSConfig.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
               this.emailJSConfig.serviceId !== 'YOUR_SERVICE_ID' &&
               typeof emailjs !== 'undefined';
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.form.classList.add('form-loading');
            this.submitButton.textContent = 'Submitting...';
            this.submitButton.disabled = true;
        } else {
            this.form.classList.remove('form-loading');
            this.submitButton.textContent = 'Submit Portfolio';
            this.submitButton.disabled = false;
        }
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'form-success';
        message.innerHTML = `
            <strong>🎉 Portfolio Submitted Successfully!</strong><br>
            Thank you for submitting your portfolio to NotNormal Friday Five. 
            We'll review your submission and notify you by Thursday if you're selected for our Friday feature.
        `;
        
        // Insert message AFTER the form instead of before
        this.form.parentNode.insertBefore(message, this.form.nextSibling);
        
        // Scroll to success message
        message.scrollIntoView({ behavior: 'smooth' });
        
        // Remove message after 10 seconds
        setTimeout(() => {
            message.remove();
        }, 10000);
    }

    showMessage(text, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-success, .form-error, .form-info');
        existingMessages.forEach(msg => msg.remove());
        
        const message = document.createElement('div');
        message.className = `form-${type}`;
        message.textContent = text;
        
        // Insert message AFTER the form instead of before
        this.form.parentNode.insertBefore(message, this.form.nextSibling);
        
        // Scroll to message so user can see it
        message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    resetForm() {
        this.form.reset();
        this.removeFile();
        
        // Clear validation classes
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.classList.remove('valid', 'invalid');
        });
        
        // Clear field errors
        const fieldErrors = this.form.querySelectorAll('.field-error');
        fieldErrors.forEach(error => error.remove());
    }
}

// Smooth scrolling for anchor links
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Add CSS for file upload states and validation
const additionalStyles = `
    .drag-over {
        border-color: #667eea !important;
        background-color: #f0f4ff !important;
    }
    
    .file-selected {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #262626;
        border-radius: 8px;
        border: 2px solid #6495ED;
    }
    
    .file-icon {
        font-size: 2rem;
    }
    
    .file-info {
        flex: 1;
    }
    
    .file-name {
        display: block;
        font-weight: 500;
        color: #e5e7eb;
    }
    
    .file-size {
        color: #d1d5db;
        font-size: 0.875rem;
    }
    
    .remove-file {
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
    }
    
    .remove-file:hover {
        background: #dc2626;
    }
    
    .field-error {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .form-group input.valid,
    .form-group select.valid,
    .form-group textarea.valid {
        border-color: #6495ED;
    }
    
    .form-group input.invalid,
    .form-group select.invalid,
    .form-group textarea.invalid {
        border-color: #ef4444;
    }
`;

// Add the additional styles to the page
const styleElement = document.createElement('style');
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);

// Initialize the form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioForm = new PortfolioFormHandler();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationDelay = '0s';
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

// Observe animated elements
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.benefit-card, .profile-card, .faq-item');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
});

// Google Analytics tracking (placeholder)
function trackFormSubmission() {
    // Replace with actual Google Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'portfolio_submission', {
            event_category: 'form',
            event_label: 'portfolio_drive'
        });
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioFormHandler;
} 

// Counter animation for LinkedIn followers
function animateCounter() {
    const counter = document.getElementById('follower-count');
    const target = 20518;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);
        
        // Format number with comma
        const formatted = current.toLocaleString() + '+';
        counter.textContent = formatted;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    updateCounter();
}

// Start counter animation when page loads
window.addEventListener('load', function() {
    setTimeout(animateCounter, 500); // Small delay for better effect
}); 

// Position trail line from LinkedIn followers to FAQ
function positionTrailLine() {
    // Remove any existing trail line
    const existingTrailLine = document.querySelector('.trail-line');
    if (existingTrailLine) {
        existingTrailLine.remove();
    }
    
    // Find the LinkedIn followers stat and FAQ spinning container
    const linkedinStat = document.getElementById('follower-count');
    const faqSpinningContainer = document.querySelector('.faq-spinning-container');
    
    if (!linkedinStat || !faqSpinningContainer) return;
    
    // Get positions
    const linkedinRect = linkedinStat.getBoundingClientRect();
    const faqRect = faqSpinningContainer.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate positions
    const startY = linkedinRect.bottom + scrollTop + 20; // 20px below LinkedIn stat
    const endY = faqRect.top + scrollTop + (faqRect.height / 2); // Middle of spinning text
    const height = endY - startY;
    
    // Only create if height is positive
    if (height > 0) {
        // Create trail line element
        const trailLine = document.createElement('div');
        trailLine.className = 'trail-line';
        trailLine.style.top = startY + 'px';
        trailLine.style.height = height + 'px';
        
        // Add to body
        document.body.appendChild(trailLine);
    }
}

// Position trail line on load and resize
window.addEventListener('load', function() {
    setTimeout(positionTrailLine, 100);
});

window.addEventListener('resize', function() {
    positionTrailLine();
});

// Also reposition on scroll (for dynamic content)
let scrollTimeout;
window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(positionTrailLine, 10);
}); 

// Progressive background loading for hero section
function initProgressiveBackground() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const bgImage = new Image();
    
    // Show placeholder immediately
    hero.style.background = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)';
    
    // Choose appropriate image based on screen size
    const isMobile = window.innerWidth <= 768;
    const imageSrc = isMobile ? 'bg-mobile.jpg' : 'bg-optimized.jpg';
    
    // Load the background image
    bgImage.onload = function() {
        // Add loaded class to trigger CSS transition
        hero.classList.add('bg-loaded');
    };
    
    bgImage.onerror = function() {
        console.warn('Background image failed to load, using fallback');
        // Keep the gradient background as fallback
    };
    
    // Start loading the image
    bgImage.src = imageSrc;
}

// Initialize progressive background loading when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initProgressiveBackground();
}); 