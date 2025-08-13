// Deployment script for Friday Five system
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Friday Five Deployment Script\n');

try {
    // 1. Build the Next.js admin dashboard
    console.log('📦 Building admin dashboard...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 2. Copy static files to build directory
    console.log('📁 Copying static files...');
    if (!fs.existsSync('.next/static')) {
        fs.mkdirSync('.next/static', { recursive: true });
    }
    
    // Copy main portfolio files
    const staticFiles = [
        'index.html',
        'style.css', 
        'script.js',
        'bg-optimized.jpg',
        'bg-mobile.jpg',
        'notnormal_logo.jpg'
    ];
    
    staticFiles.forEach(file => {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, `.next/${file}`);
            console.log(`  ✅ Copied ${file}`);
        }
    });
    
    // 3. Update paths for production
    console.log('🔧 Updating production paths...');
    
    // Update Supabase config in script.js for production
    let scriptContent = fs.readFileSync('.next/script.js', 'utf8');
    
    // Replace hardcoded URLs with environment variable placeholders
    scriptContent = scriptContent.replace(
        /const supabaseUrl = .+;/,
        `const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || document.querySelector('meta[name="supabase-url"]')?.content;`
    );
    
    scriptContent = scriptContent.replace(
        /const supabaseKey = .+;/,
        `const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || document.querySelector('meta[name="supabase-key"]')?.content;`
    );
    
    fs.writeFileSync('.next/script.js', scriptContent);
    
    console.log('\n✅ Build complete! Ready for deployment.');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy .next/ directory to your hosting platform');
    console.log('2. Set environment variables:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('3. Configure domain routing');
    console.log('\n🎯 Your Friday Five system is production-ready!');
    
} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
}
