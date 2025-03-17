/**
 * TextFieldHandler.js
 * Module for handling text and email input fields in Google Forms
 */

/**
 * Handle text field input (including email fields)
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @param {string} dataToFill - Data to fill
 * @returns {Promise<boolean>} - Whether the text was successfully filled
 */
export async function handleTextField(page, field, dataToFill) {
  try {
    // First click the field to ensure it's active and focus it
    await field.selector.click();
    
    // Use keyboard shortcuts to clear the field: Ctrl+A to select all, then Backspace
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    
    // Special handling for College Domain Email
    let valueToFill = dataToFill;
    if (field.questionText.toLowerCase().includes('college domain email') && 
        !valueToFill.includes('@')) {
      valueToFill = `${valueToFill}@cuchd.in`;
      console.log(`Added domain to college email: ${valueToFill}`);
    }
    
    // Now type the new value directly with keyboard
    await page.keyboard.type(valueToFill);
    
    // Also dispatch events to ensure Google Forms recognizes the change
    await page.evaluate((selector, value) => {
      selector.value = value;
      selector.dispatchEvent(new Event('input', { bubbles: true }));
      selector.dispatchEvent(new Event('change', { bubbles: true }));
      selector.dispatchEvent(new Event('blur', { bubbles: true }));
    }, field.selector, valueToFill);
    
    console.log(`Successfully filled field ${field.questionText} with ${valueToFill}`);
    return true;
  } catch (error) {
    console.error(`Error filling text field ${field.questionText}:`, error);
    return false;
  }
} 