/**
 * index.js
 * Main entry point for the Google Forms Automator
 */

import FormAutomator from './core/FormAutomator.js';
import config from '../config.js';
import { specialDateHandler } from './handlers/DateFieldHandler.js';

/**
 * Main function to run the Google Forms Automator
 */
async function run() {
  console.log('=== Google Forms Automator ===');
  console.log('This tool helps you automatically fill out Google Forms with your information.');
  
  // Check if a form URL was provided as a command-line argument
  if (process.argv.length < 3) {
    console.log('Please provide a Google Form URL as an argument');
    console.log('Example: node index.js "https://docs.google.com/forms/d/e/your-form-id/viewform"');
    process.exit(1);
  }
  
  const formUrl = process.argv[2];
  console.log(`Form URL: ${formUrl}`);
  
  try {
    // Check if Chrome is ready
    console.log('Checking if Chrome is ready for automation...');
    
    // Create a new FormAutomator instance
    const formAutomator = new FormAutomator(config);
    
    // Fill the form
    await formAutomator.fillGoogleForm(formUrl);
    
    // After filling the form, try the specialized date handler as a last resort
    setTimeout(async () => {
      try {
        console.log('Running specialized date handler as a final check...');
        await specialDateHandler(formAutomator.page);
        console.log('Specialized date handler completed.');
      } catch (error) {
        console.error('Error running specialized date handler:', error);
      }
    }, 5000);
    
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

// Run the application
run(); 