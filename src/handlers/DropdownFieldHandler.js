/**
 * DropdownFieldHandler.js
 * Module for handling dropdown fields in Google Forms
 */

/**
 * Handle dropdown field input
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @param {string} dataToFill - Data to match in dropdown (not fully used)
 * @returns {Promise<boolean>} - Whether the dropdown was successfully selected
 */
export async function handleDropdownField(page, field, dataToFill) {
  try {
    // For dropdowns, clicking again will override the existing selection
    await field.selector.click();
    
    // Wait for dropdown options to appear
    await page.waitForSelector('div[role="option"]', { timeout: 5000 });
    
    // Get all available options
    const options = await page.$$('div[role="option"]');
    
    if (options.length === 0) {
      console.log('No dropdown options found');
      return false;
    }
    
    // Try to find an option that matches our data
    let optionFound = false;
    
    if (dataToFill && dataToFill !== "Not applicable") {
      // Try to find an option that matches our data
      for (let i = 0; i < options.length; i++) {
        const optionText = await page.evaluate(el => el.textContent, options[i]);
        
        // Check if the option text contains our data (case insensitive)
        if (optionText.toLowerCase().includes(dataToFill.toLowerCase())) {
          await options[i].click();
          console.log(`Selected dropdown option: ${optionText}`);
          optionFound = true;
          break;
        }
      }
    }
    
    // If no matching option found, just click the first option
    if (!optionFound && options.length > 0) {
      const firstOptionText = await page.evaluate(el => el.textContent, options[0]);
      await options[0].click();
      console.log(`Selected first dropdown option: ${firstOptionText}`);
      optionFound = true;
    }
    
    return optionFound;
  } catch (error) {
    console.error(`Error handling dropdown field ${field.questionText}:`, error);
    
    // As a fallback, try clicking the dropdown again and selecting the first option
    try {
      await field.selector.click();
      await page.waitForSelector('div[role="option"]', { timeout: 2000 });
      const firstOption = await page.$('div[role="option"]');
      if (firstOption) {
        await firstOption.click();
        console.log('Selected first option as fallback');
        return true;
      }
    } catch (fallbackError) {
      console.error('Fallback dropdown handling also failed:', fallbackError);
    }
    
    return false;
  }
} 