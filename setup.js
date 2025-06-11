const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}🚀 Starting Travel Agency App setup...${colors.reset}\n`);

// Function to execute commands and log output
function runCommand(command, cwd = process.cwd()) {
  console.log(`${colors.yellow}> ${command}${colors.reset}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
  const fullPath = path.resolve(dirPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.yellow}Creating directory: ${fullPath}${colors.reset}`);
    fs.mkdirSync(fullPath, { recursive: true });
    return true;
  }
  console.log(`${colors.green}Directory already exists: ${fullPath}${colors.reset}`);
  return true;
}

// Function to copy a file if it doesn't exist
function copyFileIfNotExists(source, destination) {
  const fullSourcePath = path.resolve(source);
  const fullDestPath = path.resolve(destination);
  
  if (!fs.existsSync(fullSourcePath)) {
    console.error(`Source file does not exist: ${fullSourcePath}`);
    return false;
  }
  
  if (!fs.existsSync(fullDestPath)) {
    console.log(`${colors.yellow}Copying ${fullSourcePath} to ${fullDestPath}${colors.reset}`);
    fs.copyFileSync(fullSourcePath, fullDestPath);
    return true;
  }
  
  console.log(`${colors.green}Destination file already exists: ${fullDestPath}${colors.reset}`);
  return true;
}

// Main setup steps
async function setup() {
  console.log(`${colors.magenta}Step 1: Installing dependencies${colors.reset}`);
  
  // Install root dependencies
  console.log(`\n${colors.blue}Installing root dependencies...${colors.reset}`);
  if (!runCommand('npm install')) return false;
  
  // Install client dependencies
  console.log(`\n${colors.blue}Installing client dependencies...${colors.reset}`);
  if (!runCommand('npm install', './client')) return false;
  
  // Install server dependencies
  console.log(`\n${colors.blue}Installing server dependencies...${colors.reset}`);
  if (!runCommand('npm install', './server')) return false;
  
  console.log(`\n${colors.magenta}Step 2: Setting up server${colors.reset}`);
  
  // Create uploads directory
  console.log(`\n${colors.blue}Creating uploads directory...${colors.reset}`);
  if (!ensureDirectoryExists('./server/uploads')) return false;
  
  // Copy .env file
  console.log(`\n${colors.blue}Setting up environment variables...${colors.reset}`);
  if (!copyFileIfNotExists('./server/.env.example', './server/.env')) return false;
  
  // Run database migrations
  console.log(`\n${colors.blue}Running database migrations...${colors.reset}`);
  if (!runCommand('npx prisma migrate dev', './server')) return false;
  
  // Seed the database
  console.log(`\n${colors.blue}Seeding the database...${colors.reset}`);
  if (!runCommand('node prisma/seed.js', './server')) return false;
  
  console.log(`\n${colors.green}✅ Setup completed successfully!${colors.reset}`);
  console.log(`\n${colors.cyan}To start the application, run:${colors.reset}`);
  console.log(`${colors.yellow}npm run dev-full${colors.reset}`);
  
  return true;
}

// Run the setup
setup().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});