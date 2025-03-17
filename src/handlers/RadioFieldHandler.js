/**
 * RadioFieldHandler.js
 * Module for handling radio button fields in Google Forms
 */

import userInfo from '../models/UserInformation.js';

/**
 * Handle radio button field input
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @param {string} dataToFill - Data to match for radio selection
 * @returns {Promise<boolean>} - Whether the radio was successfully selected
 */
export async function handleRadioField(page, field, dataToFill) {
  try {
    // For radio buttons, we'll just select our option even if another is already selected
    let matchFound = false;
    
    // Special handling for specific questions
    if (field.questionText.toLowerCase().includes('gender')) {
      matchFound = await handleGenderRadio(page, field);
    }
    
    // If no match was found, select the first radio button
    if (!matchFound) {
      matchFound = await selectFirstRadio(page, field);
    }
    
    if (!matchFound) {
      console.log('Failed to click any radio button');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error handling radio field ${field.questionText}:`, error);
    return false;
  }
}

/**
 * Handle gender-specific radio buttons
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @returns {Promise<boolean>} - Whether a radio was successfully selected
 */
async function handleGenderRadio(page, field) {
  // Get labels for each radio button to determine which one to select
  for (let i = 0; i < field.selector.length; i++) {
    try {
      const radioButton = field.selector[i];
      const radioLabel = await page.evaluate(async (selector) => {
        const label = selector.getAttribute('aria-label') || 
                   selector.textContent || '';
        return label.trim().toLowerCase();
      }, radioButton);
      
      // Check if this radio button matches the user's gender
      if (radioLabel.includes(userInfo.gender.toLowerCase())) {
        // Click this specific radio button
        await page.evaluate(selector => {
          selector.click();
        }, radioButton);
        
        console.log(`Selected gender radio button: ${radioLabel}`);
        return true;
      }
    } catch (error) {
      console.error(`Error processing radio button at index ${i}:`, error);
    }
  }
  
  return false;
}

/**
 * Select the first radio button in a group
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @returns {Promise<boolean>} - Whether a radio was successfully selected
 */
async function selectFirstRadio(page, field) {
  try {
    // Try to get labels for all radio buttons
    const radioLabels = await Promise.all(field.selector.map(async (radio, idx) => {
      try {
        const label = await page.evaluate(selector => {
          return selector.getAttribute('aria-label') || 
                 selector.textContent || 
                 `Option ${idx+1}`;
        }, radio);
        return { index: idx, label: label.trim() };
      } catch (err) {
        return { index: idx, label: `Option ${idx+1}` };
      }
    }));
    
    console.log(`Radio options for "${field.questionText}":`, 
      radioLabels.map(r => r.label).join(', '));
    
    // Just click the first one if we don't have specific logic
    const firstRadio = field.selector[0];
    await page.evaluate(selector => {
      selector.click();
    }, firstRadio);
    
    console.log(`Clicked first radio button: ${radioLabels[0]?.label || 'Option 1'}`);
    return true;
  } catch (error) {
    console.error(`Error clicking first radio button:`, error);
    return false;
  }
} 