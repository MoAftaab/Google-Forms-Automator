/**
 * FormFiller.js
 * Module for filling form fields with user data
 */

import userInfo from '../models/UserInformation.js';
import { handleDateField } from '../handlers/DateFieldHandler.js';
import { handleTextField } from '../handlers/TextFieldHandler.js';
import { handleParagraphField } from '../handlers/ParagraphFieldHandler.js';
import { handleRadioField } from '../handlers/RadioFieldHandler.js';
import { handleCheckboxField } from '../handlers/CheckboxFieldHandler.js';
import { handleDropdownField } from '../handlers/DropdownFieldHandler.js';
import { determineDataToFill } from '../utils/DataMatcher.js';

/**
 * Fill form fields based on identified types
 * @param {Page} page - Puppeteer page object
 * @param {Array} formFields - Array of identified form fields
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
export async function fillFormFields(page, formFields, config) {
  console.log('Filling form fields...');
  
  // Skip file upload handling as requested
  console.log('Automatic file upload functionality is disabled as requested');
  
  // Continue with the rest of the form filling process
  // Handle all other fields
  for (const field of formFields) {
    try {
      // Skip file fields entirely
      if (field.type === 'file' || field.type === 'fileButton') {
        console.log(`Skipping file field: ${field.questionText} (auto-upload is disabled)`);
        continue;
      }
      
      console.log(`Processing field: ${field.questionText} (${field.type})`);
      
      // Skip unknown field types
      if (field.type === 'unknown' || !field.selector) {
        console.log(`Skipping unknown field type: ${field.questionText}`);
        continue;
      }
      
      // Determine what data to use based on the question text
      const dataToFill = determineDataToFill(field.questionText);
      console.log(`Data to fill: ${dataToFill}`);
      
      // Fill the field based on its type
      await fillFieldByType(page, field, dataToFill);
      
      // Wait a bit between fields to avoid detection as a bot
      await new Promise(resolve => setTimeout(resolve, 
        config.fieldDelay?.min || 500 + Math.random() * ((config.fieldDelay?.max || 1000) - (config.fieldDelay?.min || 500))
      ));
    } catch (error) {
      console.error(`Error processing field "${field.questionText}":`, error);
    }
  }
  
  console.log('Form filling completed (file upload fields skipped as requested)');
}

/**
 * Fill a field based on its type
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @param {string} dataToFill - Data to fill in the field
 * @returns {Promise<void>}
 */
async function fillFieldByType(page, field, dataToFill) {
  switch (field.type) {
    case 'text':
    case 'email':
      await handleTextField(page, field, dataToFill);
      break;
      
    case 'date':
      await handleDateField(page, field, dataToFill);
      break;
      
    case 'paragraph':
      await handleParagraphField(page, field, dataToFill);
      break;
      
    case 'radio':
      await handleRadioField(page, field, dataToFill);
      break;
      
    case 'checkbox':
      await handleCheckboxField(page, field, dataToFill);
      break;
      
    case 'dropdown':
      await handleDropdownField(page, field, dataToFill);
      break;
      
    default:
      console.log(`Unsupported field type: ${field.type}`);
  }
} 