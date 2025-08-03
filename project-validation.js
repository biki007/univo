const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description}`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description}`, 'red');
    return false;
  }
}

function validatePackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    log('✓ package.json is valid JSON', 'green');
    
    // Check essential scripts
    const requiredScripts = ['dev', 'build', 'start', 'lint'];
    const hasAllScripts = requiredScripts.every(script => packageJson.scripts[script]);
    
    if (hasAllScripts) {
      log('✓ All required scripts are present', 'green');
    } else {
      log('✗ Missing required scripts', 'red');
    }
    
    // Check essential dependencies
    const requiredDeps = ['next', 'react', 'react-dom'];
    const hasAllDeps = requiredDeps.every(dep => packageJson.dependencies[dep]);
    
    if (hasAllDeps) {
      log('✓ All essential dependencies are present', 'green');
    } else {
      log('✗ Missing essential dependencies', 'red');
    }
    
    return true;
  } catch (error) {
    log('✗ package.json is invalid or missing', 'red');
    return false;
  }
}

function validateTsConfig() {
  try {
    const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    log('✓ tsconfig.json is valid JSON', 'green');
    
    if (tsConfig.compilerOptions && tsConfig.compilerOptions.paths) {
      log('✓ Path mapping is configured', 'green');
    } else {
      log('✗ Path mapping is not configured', 'red');
    }
    
    return true;
  } catch (error) {
    log('✗ tsconfig.json is invalid or missing', 'red');
    return false;
  }
}

function main() {
  log('🚀 Univio Frontend Project Validation', 'blue');
  log('=====================================', 'blue');
  
  let allChecks = true;
  
  // Configuration files
  log('\n📋 Configuration Files:', 'yellow');
  allChecks &= checkFile('package.json', 'package.json exists');
  allChecks &= checkFile('tsconfig.json', 'tsconfig.json exists');
  allChecks &= checkFile('tailwind.config.js', 'tailwind.config.js exists');
  allChecks &= checkFile('next.config.js', 'next.config.js exists');
  allChecks &= checkFile('postcss.config.js', 'postcss.config.js exists');
  allChecks &= checkFile('.eslintrc.json', '.eslintrc.json exists');
  allChecks &= checkFile('.prettierrc', '.prettierrc exists');
  
  // Project structure
  log('\n📁 Project Structure:', 'yellow');
  allChecks &= checkDirectory('src', 'src directory exists');
  allChecks &= checkDirectory('src/app', 'src/app directory exists');
  allChecks &= checkDirectory('src/components', 'src/components directory exists');
  allChecks &= checkDirectory('src/components/ui', 'src/components/ui directory exists');
  allChecks &= checkDirectory('src/lib', 'src/lib directory exists');
  allChecks &= checkDirectory('src/types', 'src/types directory exists');
  allChecks &= checkDirectory('public', 'public directory exists');
  
  // Core files
  log('\n📄 Core Files:', 'yellow');
  allChecks &= checkFile('src/app/layout.tsx', 'Root layout exists');
  allChecks &= checkFile('src/app/page.tsx', 'Home page exists');
  allChecks &= checkFile('src/app/globals.css', 'Global styles exist');
  allChecks &= checkFile('src/lib/utils.ts', 'Utility functions exist');
  allChecks &= checkFile('src/types/index.ts', 'Type definitions exist');
  
  // UI Components
  log('\n🎨 UI Components:', 'yellow');
  allChecks &= checkFile('src/components/ui/Button.tsx', 'Button component exists');
  allChecks &= checkFile('src/components/ui/Input.tsx', 'Input component exists');
  allChecks &= checkFile('src/components/ui/Modal.tsx', 'Modal component exists');
  allChecks &= checkFile('src/components/ui/index.ts', 'UI components index exists');
  
  // Documentation
  log('\n📚 Documentation:', 'yellow');
  allChecks &= checkFile('README.md', 'README.md exists');
  allChecks &= checkFile('.env.local.example', 'Environment template exists');
  allChecks &= checkFile('.gitignore', '.gitignore exists');
  
  // Validate configuration files
  log('\n🔍 Configuration Validation:', 'yellow');
  allChecks &= validatePackageJson();
  allChecks &= validateTsConfig();
  
  // Final result
  log('\n' + '='.repeat(40), 'blue');
  if (allChecks) {
    log('🎉 All checks passed! Project is ready for development.', 'green');
    log('\n📝 Next Steps:', 'blue');
    log('1. Install Node.js (https://nodejs.org/)', 'reset');
    log('2. Run: npm install', 'reset');
    log('3. Copy .env.local.example to .env.local and configure', 'reset');
    log('4. Run: npm run dev', 'reset');
  } else {
    log('❌ Some checks failed. Please review the issues above.', 'red');
  }
}

main();