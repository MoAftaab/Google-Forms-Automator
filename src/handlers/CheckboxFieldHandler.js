/**
 * CheckboxFieldHandler.js
 * Module for handling checkbox fields in Google Forms
 */

/**
 * Handle checkbox field input
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @param {string} dataToFill - Data to fill (not used for checkboxes)
 * @returns {Promise<boolean>} - Whether the checkboxes were successfully handled
 */
export async function handleCheckboxField(page, field, dataToFill) {
  try {
    // For undertaking/agreement checkboxes, always select them
    if (isAgreementField(field.questionText)) {
      return await handleAgreementCheckboxes(page, field);
    } else {
      // For other checkboxes, select ALL checkboxes in the group
      return await handleStandardCheckboxes(page, field);
    }
  } catch (error) {
    console.error(`Error handling checkbox field ${field.questionText}:`, error);
    return false;
  }
}

/**
 * Check if the field is an agreement/consent field
 * @param {string} questionText - Field question text
 * @returns {boolean} - Whether this is an agreement field
 */
function isAgreementField(questionText) {
  const lowerQuestion = questionText.toLowerCase();
  return lowerQuestion.includes('undertaking') || 
         lowerQuestion.includes('agreement') || 
         lowerQuestion.includes('confirm') || 
         lowerQuestion.includes('acknowledge') ||
         lowerQuestion.includes('terms') ||
         lowerQuestion.includes('consent');
}

/**
 * Handle agreement checkbox fields (select all)
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @returns {Promise<boolean>} - Whether the checkboxes were successfully handled
 */
async function handleAgreementCheckboxes(page, field) {
  try {
    // Select all checkboxes in this group
    for (let i = 0; i < field.selector.length; i++) {
      const checkbox = field.selector[i];
      
      // Check if it's already selected
      const isChecked = await page.evaluate(selector => {
        return selector.getAttribute('aria-checked') === 'true';
      }, checkbox);
      
      if (!isChecked) {
        await page.evaluate(selector => {
          selector.click();
        }, checkbox);
        console.log(`Checked agreement checkbox at index ${i}`);
      } else {
        console.log(`Agreement checkbox at index ${i} already checked`);
      }
    }
    return true;
  } catch (error) {
    console.error('Error clicking agreement checkboxes:', error);
    return false;
  }
}

/**
 * Handle standard checkbox fields (select all)
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @returns {Promise<boolean>} - Whether the checkboxes were successfully handled
 */
async function handleStandardCheckboxes(page, field) {
  try {
    // Check all checkboxes in the group
    for (let i = 0; i < field.selector.length; i++) {
      const checkbox = field.selector[i];
      
      // Check if it's already selected
      const isChecked = await page.evaluate(selector => {
        return selector.getAttribute('aria-checked') === 'true';
      }, checkbox);
      
      if (!isChecked) {
        await page.evaluate(selector => {
          selector.click();
        }, checkbox);
        console.log(`Checked checkbox at index ${i}`);
      } else {
        console.log(`Checkbox at index ${i} already checked`);
      }
    }
    console.log(`Selected all ${field.selector.length} checkboxes in the group`);
    return true;
  } catch (error) {
    console.error('Error handling standard checkboxes:', error);
    return false;
  }
} 