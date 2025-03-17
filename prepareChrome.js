// Script to help users prepare Chrome for automation

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Gets the path to Chrome executable based on the OS
 * @returns {string} Path to Chrome executable
 */
function getChromeExecutablePath() {
    let chromePath = '';
    
    if (process.platform === 'win32') {
        // Windows paths
        const possiblePaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe')
        ];
        
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                chromePath = p;
                break;
            }
        }
    } else if (process.platform === 'darwin') {
        // macOS path
        chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else {
        // Linux path
        chromePath = '/usr/bin/google-chrome';
    }
    
    return chromePath;
}

/**
 * Checks if a port is available
 * @param {number} port The port to check
 * @returns {boolean} Whether the port is available
 */
function isPortAvailable(port) {
    try {
        // Try to connect to the port
        const netstat = execSync(`netstat -ano | findstr :${port}`).toString();
        // If the command succeeds and returns output, the port is in use
        return !netstat.includes(`${port}`);
    } catch (error) {
        // If the command fails, the port is likely available
        return true;
    }
}

/**
 * Main function to provide guidance on preparing Chrome
 */
function prepareChrome() {
    console.log('============================================================');
    console.log('       CHROME PREPARATION FOR GOOGLE FORMS AUTOMATOR        ');
    console.log('============================================================');
    console.log();
    
    // Check if Chrome is installed
    const chromePath = getChromeExecutablePath();
    if (!chromePath) {
        console.error('ERROR: Chrome browser was not found on your system.');
        console.error('Please install Google Chrome and try again.');
        return;
    }
    
    console.log(`Found Chrome at: ${chromePath}`);
    
    // Check if debugging port is available
    const debuggingPort = 9222;
    const isPortFree = isPortAvailable(debuggingPort);
    
    if (!isPortFree) {
        console.log('Chrome may already be running with debugging enabled.');
        console.log(`Port ${debuggingPort} is in use.`);
        console.log();
        console.log('You can try running the form automator directly:');
        console.log('  node index.js "YOUR_GOOGLE_FORM_URL"');
        return;
    }
    
    console.log('To use your existing Chrome profile with the form automator,');
    console.log('you need to start Chrome with remote debugging enabled.');
    console.log();
    console.log('STEP 1: Close all running Chrome windows.');
    console.log('STEP 2: Run Chrome with debugging by:');
    console.log();
    
    // Get the user data directory
    let userDataDir = '';
    if (process.platform === 'win32') {
        userDataDir = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data');
    } else if (process.platform === 'darwin') {
        userDataDir = path.join(process.env.HOME, 'Library', 'Application Support', 'Google', 'Chrome');
    } else {
        userDataDir = path.join(process.env.HOME, '.config', 'google-chrome');
    }
    
    // Generate the command to run
    const command = `"${chromePath}" --remote-debugging-port=${debuggingPort} --user-data-dir="${userDataDir}"`;
    
    console.log('   Option A: Copy and paste this command in a new Command Prompt/Terminal:');
    console.log(`   ${command}`);
    console.log();
    console.log('   Option B: I can try to run it for you (Y/N)?');
    
    // Get user input
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdout.write('   Run Chrome for you? (Y/N): ');
    
    process.stdin.on('data', (data) => {
        const input = data.toString().trim().toLowerCase();
        
        if (input === 'y' || input === 'yes') {
            console.log('Launching Chrome with debugging enabled...');
            try {
                // Run the command to start Chrome
                require('child_process').exec(command, (error) => {
                    if (error) {
                        console.error('Error starting Chrome:', error);
                        console.log('Please try running the command manually (Option A above).');
                    } else {
                        console.log('Chrome started successfully with debugging enabled!');
                        console.log();
                        console.log('STEP 3: Now you can run the form automator:');
                        console.log('  node index.js "YOUR_GOOGLE_FORM_URL"');
                    }
                    process.exit();
                });
            } catch (error) {
                console.error('Failed to start Chrome:', error);
                console.log('Please try running the command manually (Option A above).');
                process.exit(1);
            }
        } else {
            console.log();
            console.log('STEP 3: After manually starting Chrome with debugging,');
            console.log('        run the form automator:');
            console.log('  node index.js "YOUR_GOOGLE_FORM_URL"');
            process.exit();
        }
    });
}

// Run the function
prepareChrome(); 