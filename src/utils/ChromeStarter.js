/**
 * ChromeStarter.js
 * Utility to start Chrome with debugging enabled for Puppeteer
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execPromise = promisify(exec);

/**
 * Find the Chrome executable path based on OS
 * @returns {Promise<string|null>} - Path to Chrome executable or null if not found
 */
async function findChromeExecutable() {
  try {
    const platform = process.platform;
    let chromePath = null;
    
    if (platform === 'win32') {
      // Check standard Chrome locations on Windows
      const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        `${os.homedir()}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`,
      ];
      
      for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
          chromePath = path;
          break;
        }
      }
    } else if (platform === 'darwin') {
      // macOS
      chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      if (!fs.existsSync(chromePath)) {
        chromePath = null;
      }
    } else {
      // Linux
      try {
        const { stdout } = await execPromise('which google-chrome');
        chromePath = stdout.trim();
      } catch (e) {
        try {
          const { stdout } = await execPromise('which chrome');
          chromePath = stdout.trim();
        } catch (e2) {
          chromePath = null;
        }
      }
    }
    
    return chromePath;
  } catch (error) {
    console.error('Error finding Chrome executable:', error);
    return null;
  }
}

/**
 * Start Chrome with debugging enabled
 * @returns {Promise<boolean>} - Whether Chrome was started successfully
 */
async function startChromeWithDebugging() {
  try {
    const chromePath = await findChromeExecutable();
    
    if (!chromePath) {
      console.error('Chrome executable not found');
      return false;
    }
    
    console.log(`Found Chrome at: ${chromePath}`);
    
    // Get user data directory
    const platform = process.platform;
    let userDataDir;
    
    if (platform === 'win32') {
      userDataDir = `${os.homedir()}\\AppData\\Local\\Google\\Chrome\\User Data`;
    } else if (platform === 'darwin') {
      userDataDir = `${os.homedir()}/Library/Application Support/Google/Chrome`;
    } else {
      userDataDir = `${os.homedir()}/.config/google-chrome`;
    }
    
    // Construct command to start Chrome with debugging enabled
    const cmd = `"${chromePath}" --remote-debugging-port=9222 --user-data-dir="${userDataDir}"`;
    console.log(`Starting Chrome with command: ${cmd}`);
    
    // Start Chrome process
    const chromeProcess = exec(cmd, (error) => {
      if (error) {
        console.error(`Error starting Chrome: ${error.message}`);
      }
    });
    
    // Give Chrome some time to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return true;
  } catch (error) {
    console.error('Error starting Chrome with debugging:', error);
    return false;
  }
}

export default startChromeWithDebugging; 