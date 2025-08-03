const fs = require('fs');
const path = require('path');

// Icon generation script for PWA icons
const generateIcons = () => {
  console.log('🎨 Starting icon generation...');
  
  const iconsDir = path.join(__dirname, 'public', 'icons');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('📁 Created icons directory');
  }

  // Check if base icon exists
  const baseIconPath = path.join(iconsDir, 'base-icon.svg');
  if (!fs.existsSync(baseIconPath)) {
    console.log('⚠️  Base icon not found, creating default SVG...');
    
    // Create a default SVG icon
    const defaultSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="64" fill="url(#gradient)"/>
  <circle cx="256" cy="200" r="60" fill="white" opacity="0.9"/>
  <rect x="196" y="280" width="120" height="80" rx="8" fill="white" opacity="0.9"/>
  <rect x="176" y="380" width="160" height="12" rx="6" fill="white" opacity="0.7"/>
  <rect x="196" y="400" width="120" height="8" rx="4" fill="white" opacity="0.5"/>
</svg>`;
    
    fs.writeFileSync(baseIconPath, defaultSvg);
    console.log('✅ Created default base icon');
  }

  // Icon sizes to generate
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  console.log('📱 Generating PWA icons...');
  
  // For now, we'll create placeholder PNG files
  // In a real implementation, you'd use a library like sharp to convert SVG to PNG
  iconSizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    if (!fs.existsSync(iconPath)) {
      // Create a simple placeholder file
      // In production, you'd convert the SVG to PNG at the specified size
      fs.writeFileSync(iconPath, ''); // Placeholder
      console.log(`📱 Generated icon-${size}x${size}.png`);
    }
  });

  // Generate shortcut icons
  const shortcuts = ['join', 'schedule', 'start'];
  shortcuts.forEach(shortcut => {
    const shortcutPath = path.join(iconsDir, `shortcut-${shortcut}.png`);
    if (!fs.existsSync(shortcutPath)) {
      fs.writeFileSync(shortcutPath, ''); // Placeholder
      console.log(`🔗 Generated shortcut-${shortcut}.png`);
    }
  });

  // Update manifest.json with proper icon references
  const manifestPath = path.join(__dirname, 'public', 'manifest.json');
  const manifest = {
    "name": "Univio - Universal Video Meetings",
    "short_name": "Univio",
    "description": "Next-generation video conferencing platform with AI, AR/VR, and blockchain features",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#3b82f6",
    "orientation": "portrait-primary",
    "icons": iconSizes.map(size => ({
      "src": `/icons/icon-${size}x${size}.png`,
      "sizes": `${size}x${size}`,
      "type": "image/png",
      "purpose": size >= 192 ? "any maskable" : "any"
    })),
    "shortcuts": [
      {
        "name": "Join Meeting",
        "short_name": "Join",
        "description": "Join an existing meeting",
        "url": "/meeting/join",
        "icons": [{ "src": "/icons/shortcut-join.png", "sizes": "192x192" }]
      },
      {
        "name": "Schedule Meeting",
        "short_name": "Schedule",
        "description": "Schedule a new meeting",
        "url": "/schedule",
        "icons": [{ "src": "/icons/shortcut-schedule.png", "sizes": "192x192" }]
      },
      {
        "name": "Start Meeting",
        "short_name": "Start",
        "description": "Start an instant meeting",
        "url": "/meeting/start",
        "icons": [{ "src": "/icons/shortcut-start.png", "sizes": "192x192" }]
      }
    ],
    "categories": ["productivity", "business", "communication"],
    "screenshots": [
      {
        "src": "/screenshots/desktop-1.png",
        "sizes": "1280x720",
        "type": "image/png",
        "form_factor": "wide"
      },
      {
        "src": "/screenshots/mobile-1.png",
        "sizes": "390x844",
        "type": "image/png",
        "form_factor": "narrow"
      }
    ]
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('📄 Updated manifest.json');

  console.log('✨ Icon generation completed!');
  console.log('');
  console.log('📝 Note: This script creates placeholder PNG files.');
  console.log('   For production, use a proper image conversion library like sharp');
  console.log('   to convert the SVG base icon to actual PNG files at different sizes.');
};

// Run the script
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };