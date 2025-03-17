/**
 * ParagraphFieldHandler.js
 * Module for handling paragraph/textarea input fields in Google Forms
 */

/**
 * Handle paragraph field input
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @param {string} dataToFill - Data to fill
 * @returns {Promise<boolean>} - Whether the paragraph was successfully filled
 */
export async function handleParagraphField(page, field, dataToFill) {
  try {
    await page.evaluate((selector, value) => {
      // Clear existing value first
      selector.value = '';
      // Then set new value
      selector.value = value;
      // Trigger input event to ensure form validation is updated
      selector.dispatchEvent(new Event('input', { bubbles: true }));
      // Also trigger change event for good measure
      selector.dispatchEvent(new Event('change', { bubbles: true }));
    }, field.selector, dataToFill);
    
    console.log(`Successfully filled paragraph field ${field.questionText}`);
    return true;
  } catch (error) {
    console.error(`Error filling paragraph field ${field.questionText}:`, error);
    return false;
  }
} 