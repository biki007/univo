const fs = require('fs');
const path = require('path');

// Screenshot generation script for PWA screenshots
const generateScreenshots = () => {
  console.log('📸 Starting screenshot generation...');
  
  const screenshotsDir = path.join(__dirname, 'public', 'screenshots');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log('📁 Created screenshots directory');
  }

  // Create placeholder screenshots for PWA manifest
  const screenshots = [
    {
      name: 'desktop-1.png',
      description: 'Desktop view of the main dashboard',
      width: 1280,
      height: 720,
      formFactor: 'wide'
    },
    {
      name: 'mobile-1.png', 
      description: 'Mobile view of the meeting interface',
      width: 390,
      height: 844,
      formFactor: 'narrow'
    }
  ];

  screenshots.forEach(screenshot => {
    const screenshotPath = path.join(screenshotsDir, screenshot.name);
    
    if (!fs.existsSync(screenshotPath)) {
      // Create SVG placeholder that can be converted to PNG
      const svgContent = `<svg width="${screenshot.width}" height="${screenshot.height}" viewBox="0 0 ${screenshot.width} ${screenshot.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg-gradient)"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="100%" height="64" fill="#3b82f6"/>
  <text x="24" y="40" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white">Univio</text>
  
  <!-- Navigation -->
  ${screenshot.formFactor === 'wide' ? `
  <rect x="0" y="64" width="240" height="${screenshot.height - 64}" fill="white" stroke="#e5e7eb"/>
  <text x="24" y="100" font-family="Arial, sans-serif" font-size="14" fill="#374151">Dashboard</text>
  <text x="24" y="130" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">Meetings</text>
  <text x="24" y="160" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">Schedule</text>
  ` : ''}
  
  <!-- Main Content -->
  <rect x="${screenshot.formFactor === 'wide' ? '240' : '0'}" y="64" width="${screenshot.formFactor === 'wide' ? screenshot.width - 240 : screenshot.width}" height="${screenshot.height - 64}" fill="white"/>
  
  <!-- Video Grid -->
  ${screenshot.formFactor === 'wide' ? `
  <rect x="280" y="100" width="300" height="200" rx="8" fill="#1f2937"/>
  <circle cx="430" cy="200" r="30" fill="#6b7280"/>
  <rect x="620" y="100" width="300" height="200" rx="8" fill="#1f2937"/>
  <circle cx="770" cy="200" r="30" fill="#6b7280"/>
  <rect x="280" y="340" width="300" height="200" rx="8" fill="#1f2937"/>
  <circle cx="430" cy="440" r="30" fill="#6b7280"/>
  <rect x="620" y="340" width="300" height="200" rx="8" fill="#1f2937"/>
  <circle cx="770" cy="440" r="30" fill="#6b7280"/>
  ` : `
  <rect x="20" y="100" width="${screenshot.width - 40}" height="200" rx="8" fill="#1f2937"/>
  <circle cx="${screenshot.width / 2}" cy="200" r="30" fill="#6b7280"/>
  <rect x="20" y="320" width="${screenshot.width - 40}" height="150" rx="8" fill="#f3f4f6"/>
  `}
  
  <!-- Controls -->
  <rect x="${screenshot.formFactor === 'wide' ? '450' : '50'}" y="${screenshot.height - 100}" width="60" height="40" rx="20" fill="#ef4444"/>
  <rect x="${screenshot.formFactor === 'wide' ? '530' : '130'}" y="${screenshot.height - 100}" width="60" height="40" rx="20" fill="#10b981"/>
  <rect x="${screenshot.formFactor === 'wide' ? '610' : '210'}" y="${screenshot.height - 100}" width="60" height="40" rx="20" fill="#6b7280"/>
  
  <!-- Placeholder text -->
  <text x="${screenshot.width / 2}" y="${screenshot.height / 2 + 100}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">
    ${screenshot.description}
  </text>
</svg>`;

      // For now, save as SVG (in production, convert to PNG)
      const svgPath = screenshotPath.replace('.png', '.svg');
      fs.writeFileSync(svgPath, svgContent);
      
      // Create empty PNG placeholder
      fs.writeFileSync(screenshotPath, '');
      
      console.log(`📸 Generated ${screenshot.name} (${screenshot.width}x${screenshot.height})`);
    }
  });

  console.log('✨ Screenshot generation completed!');
  console.log('');
  console.log('📝 Note: This script creates placeholder files.');
  console.log('   For production, use Puppeteer or similar to capture actual screenshots');
  console.log('   of your running application at different screen sizes.');
};

// Function to capture real screenshots using Puppeteer (optional)
const captureRealScreenshots = async () => {
  try {
    const puppeteer = require('puppeteer');
    
    console.log('🚀 Launching browser for real screenshots...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Desktop screenshot
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: path.join(__dirname, 'public', 'screenshots', 'desktop-1.png'),
      fullPage: false
    });
    
    // Mobile screenshot
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: path.join(__dirname, 'public', 'screenshots', 'mobile-1.png'),
      fullPage: false
    });
    
    await browser.close();
    console.log('✅ Real screenshots captured successfully!');
    
  } catch (error) {
    console.log('⚠️  Puppeteer not available, using placeholder screenshots');
    console.log('   Install puppeteer with: npm install --save-dev puppeteer');
    generateScreenshots();
  }
};

// Run the script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--real') || args.includes('-r')) {
    captureRealScreenshots();
  } else {
    generateScreenshots();
  }
}

module.exports = { generateScreenshots, captureRealScreenshots };