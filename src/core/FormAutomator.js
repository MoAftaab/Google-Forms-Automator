/**
 * FormAutomator.js
 * Core class for automating Google Form filling
 */

import puppeteer from 'puppeteer';
import startChromeWithDebugging from '../utils/ChromeStarter.js';
import { identifyFormFields } from './FormFieldIdentifier.js';
import { fillFormFields } from './FormFiller.js';
import { fixDateFieldDirectly } from '../handlers/DateFieldHandler.js';

class FormAutomator {
  constructor(config = {}) {
    this.config = config;
    this.browser = null;
    this.page = null;
  }

  /**
   * Start the form filling process
   * @param {string} formUrl - URL of the Google Form to fill
   * @returns {Promise<void>}
   */
  async fillGoogleForm(formUrl) {
    console.log(`Starting to fill Google Form: ${formUrl}`);
    
    try {
      // Step 1: Connect to browser
      await this.connectToBrowser();
      
      if (!this.browser) {
        console.error('Failed to connect to a browser. Aborting form filling process.');
        return;
      }
      
      // Step 2: Open form in a new page
      await this.openForm(formUrl);
      
      // Step 3: Apply emergency fix for date fields
      console.log('APPLYING EMERGENCY FIX FOR DATE FIELD');
      await fixDateFieldDirectly(this.page);
      
      // Step 4: Identify form fields
      const formFields = await identifyFormFields(this.page);
      
      // Step 5: Fill the form fields
      await fillFormFields(this.page, formFields, this.config);
      
      // Step 6: Wait for manual review and submission
      await this.waitForManualSubmission();
      
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  /**
   * Connect to an existing Chrome instance or start a new one
   * @returns {Promise<void>}
   */
  async connectToBrowser() {
    try {
      console.log('Attempting to connect to existing Chrome browser...');
      this.browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null
      });
      console.log('Successfully connected to existing Chrome browser.');
    } catch (connectError) {
      console.log(`Could not connect to existing Chrome: ${connectError.message}`);
      console.log('Will try to start Chrome with debugging...');
      
      const chromeStarted = await startChromeWithDebugging();
      
      if (!chromeStarted) {
        this.showChromeStartupInstructions();
        return;
      }
      
      try {
        console.log('Connecting to newly started Chrome...');
        this.browser = await puppeteer.connect({
          browserURL: 'http://localhost:9222',
          defaultViewport: null
        });
        console.log('Successfully connected to Chrome browser.');
      } catch (secondConnectError) {
        console.error(`Could not connect to Chrome after starting it: ${secondConnectError.message}`);
      }
    }
  }

  /**
   * Show instructions for manually starting Chrome with debugging
   */
  showChromeStartupInstructions() {
    console.error('===================================================================');
    console.error('Failed to start Chrome with debugging.');
    console.error('To use your existing Chrome profile:');
    console.error('1. Close all Chrome windows');
    console.error('2. Open Command Prompt as Administrator');
    console.error('3. Navigate to Chrome directory (usually C:\\Program Files\\Google\\Chrome\\Application)');
    console.error('4. Run: chrome.exe --remote-debugging-port=9222');
    console.error('5. Then run this script again');
    console.error('===================================================================');
  }

  /**
   * Open a Google Form in a new page
   * @param {string} formUrl - URL of the Google Form
   * @returns {Promise<void>}
   */
  async openForm(formUrl) {
    // Create a new page in the existing browser
    this.page = await this.browser.newPage();
    
    // Set a longer default timeout
    this.page.setDefaultTimeout(30000);
    
    // Add error handler for page errors
    this.page.on('error', err => {
      console.error('Page error:', err);
    });
    
    this.page.on('console', msg => {
      console.log('Page console:', msg.text());
    });
    
    // Navigate to the form
    await this.page.goto(formUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Form loaded successfully');
    
    // Wait for the form to load completely
    try {
      await this.page.waitForSelector('form', { timeout: 10000 });
    } catch (error) {
      console.log('Form selector not found, but continuing anyway');
    }
    
    // Wait a bit to ensure the form is fully loaded
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Wait for manual review and submission
   * @returns {Promise<void>}
   */
  async waitForManualSubmission() {
    console.log('\n========================================');
    console.log('FORM FILLING COMPLETED');
    console.log('The form has been filled out but NOT submitted.');
    console.log('Please review the form and submit it manually.');
    console.log('========================================\n');
    
    console.log('Browser will remain open for you to review and submit the form manually.');
    console.log('Press Ctrl+C in the terminal to close the browser when you\'re done.');
    
    // Wait indefinitely (until the user terminates the program)
    await new Promise(resolve => {
      // This promise never resolves, keeping the browser open
      // The user can terminate the program with Ctrl+C
    });
  }

  /**
   * Disconnect from the browser
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.browser) {
      try {
        await this.browser.disconnect();
        console.log('Disconnected from browser');
      } catch (closeError) {
        console.error('Error disconnecting from browser:', closeError);
      }
    }
  }
}

export default FormAutomator; 