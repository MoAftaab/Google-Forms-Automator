/**
 * FormFieldIdentifier.js
 * Module for identifying different types of form fields in Google Forms
 */

/**
 * Identify all form fields in a Google Form
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Array>} - Array of identified form fields
 */
export async function identifyFormFields(page) {
  console.log('Identifying form fields...');
  
  const formFields = [];
  
  try {
    // Method 1: Look for question containers
    const formFields1 = await identifyByQuestionContainers(page);
    formFields.push(...formFields1);
    
    // Method 2: Look for direct input elements if method 1 didn't find anything
    if (formFields.length === 0) {
      const formFields2 = await identifyByDirectInputs(page);
      formFields.push(...formFields2);
    }
    
    // Method 3: Look for specific form elements by their attributes
    const formFields3 = await identifyBySpecificAttributes(page, formFields);
    formFields.push(...formFields3);
    
    // Method 4: Look for Google Forms specific elements
    const formFields4 = await identifyByGoogleFormsClasses(page, formFields);
    formFields.push(...formFields4);
    
  } catch (error) {
    console.error('Error identifying form fields:', error);
  }
  
  console.log(`Identified ${formFields.length} form fields`);
  
  // Log all identified fields for debugging
  formFields.forEach((field, index) => {
    console.log(`Field ${index + 1}: "${field.questionText}" (${field.type})`);
  });
  
  return formFields;
}

/**
 * Method 1: Identify form fields by question containers
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Array>} - Array of identified form fields
 */
async function identifyByQuestionContainers(page) {
  const formFields = [];
  
  console.log('Trying to find form fields with different selectors...');
  
  const questionContainers = await page.$$('div[role="listitem"]');
  console.log(`Found ${questionContainers.length} question containers with role="listitem"`);
  
  if (questionContainers.length > 0) {
    for (let i = 0; i < questionContainers.length; i++) {
      const container = questionContainers[i];
      
      // Get question text
      const questionTextElement = await container.$('div[role="heading"]');
      let questionText = '';
      if (questionTextElement) {
        questionText = await page.evaluate(el => el.textContent, questionTextElement);
      }
      
      console.log(`Analyzing field ${i+1}: "${questionText}"`);
      
      // Check specifically for percentage fields by name
      const lowerQuestion = questionText.toLowerCase();
      if (lowerQuestion.includes("percentage") || lowerQuestion.includes("%")) {
        console.log(`Percentage field detected: ${questionText}`);
        
        // Look for input fields for percentage
        const inputElement = await container.$('input');
        if (inputElement) {
          console.log(`Found input element for percentage field: ${questionText}`);
          formFields.push({
            index: i,
            questionText: questionText.trim(),
            type: 'text',  // Handle percentage fields as text
            selector: inputElement
          });
          continue;  // Skip the normal field type detection
        }
      }
      
      // Determine field type
      const fieldType = await determineFieldType(container, page);
      
      formFields.push({
        index: i,
        questionText: questionText.trim(),
        type: fieldType.type,
        selector: fieldType.selector
      });
    }
  }
  
  return formFields;
}

/**
 * Method 2: Identify form fields by direct input elements
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Array>} - Array of identified form fields
 */
async function identifyByDirectInputs(page) {
  const formFields = [];
  
  console.log('No question containers found. Looking for direct input elements...');
  
  // Find all text inputs
  const textInputs = await page.$$('input[type="text"]');
  for (let i = 0; i < textInputs.length; i++) {
    const input = textInputs[i];
    
    // Try to get the label/question text
    const questionText = await page.evaluate((el, index) => {
      // Try to find a label or heading near this input
      const label = el.closest('div').querySelector('label, div[role="heading"]');
      return label ? label.textContent.trim() : `Text Input ${index+1}`;
    }, input, i);
    
    formFields.push({
      index: formFields.length,
      questionText: questionText,
      type: 'text',
      selector: input
    });
  }
  
  // Find all email inputs
  const emailInputs = await page.$$('input[type="email"]');
  for (let i = 0; i < emailInputs.length; i++) {
    const input = emailInputs[i];
    
    // Try to get the label/question text
    const questionText = await page.evaluate((el, index) => {
      const label = el.closest('div').querySelector('label, div[role="heading"]');
      return label ? label.textContent.trim() : `Email ${index+1}`;
    }, input, i);
    
    formFields.push({
      index: formFields.length,
      questionText: questionText,
      type: 'email',
      selector: input
    });
  }
  
  // Find all radio button groups
  const radioGroups = await page.$$('div[role="radiogroup"]');
  for (let i = 0; i < radioGroups.length; i++) {
    const group = radioGroups[i];
    
    // Get the question text
    const questionText = await page.evaluate(el => {
      const heading = el.closest('div[role="listitem"]')?.querySelector('div[role="heading"]');
      return heading ? heading.textContent.trim() : `Radio Group ${i+1}`;
    }, group);
    
    // Get all radio buttons in this group
    const radioButtons = await group.$$('div[role="radio"]');
    
    formFields.push({
      index: formFields.length,
      questionText: questionText,
      type: 'radio',
      selector: radioButtons
    });
  }
  
  // Find all checkboxes
  const checkboxGroups = await page.$$('div[role="group"]');
  for (let i = 0; i < checkboxGroups.length; i++) {
    const group = checkboxGroups[i];
    
    // Get the question text
    const questionText = await page.evaluate(el => {
      const heading = el.closest('div[role="listitem"]')?.querySelector('div[role="heading"]');
      return heading ? heading.textContent.trim() : `Checkbox Group ${i+1}`;
    }, group);
    
    // Get all checkboxes in this group
    const checkboxes = await group.$$('div[role="checkbox"]');
    
    if (checkboxes.length > 0) {
      formFields.push({
        index: formFields.length,
        questionText: questionText,
        type: 'checkbox',
        selector: checkboxes
      });
    }
  }
  
  // Find all dropdowns
  const dropdowns = await page.$$('div[role="listbox"]');
  for (let i = 0; i < dropdowns.length; i++) {
    const dropdown = dropdowns[i];
    
    // Get the question text
    const questionText = await page.evaluate(el => {
      const heading = el.closest('div[role="listitem"]')?.querySelector('div[role="heading"]');
      return heading ? heading.textContent.trim() : `Dropdown ${i+1}`;
    }, dropdown);
    
    formFields.push({
      index: formFields.length,
      questionText: questionText,
      type: 'dropdown',
      selector: dropdown
    });
  }
  
  return formFields;
}

/**
 * Method 3: Identify form fields by specific attributes
 * @param {Page} page - Puppeteer page object
 * @param {Array} existingFields - Previously identified fields to avoid duplicates
 * @returns {Promise<Array>} - Array of identified form fields
 */
async function identifyBySpecificAttributes(page, existingFields) {
  const formFields = [];
  
  console.log('Looking for specific form elements by their attributes...');
  
  // Try to find elements by their specific attributes that might be used in Google Forms
  const specificSelectors = [
    { selector: 'input[aria-label]', type: 'text' },
    { selector: 'textarea[aria-label]', type: 'paragraph' },
    { selector: 'input[type="email"]', type: 'email' }
  ];
  
  for (const { selector, type } of specificSelectors) {
    const elements = await page.$$(selector);
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      // Check if this element is already in our list
      const alreadyIncluded = existingFields.some(field => 
        field.selector === element || 
        (Array.isArray(field.selector) && field.selector.includes(element))
      );
      
      if (!alreadyIncluded) {
        // Get the label from aria-label attribute
        const questionText = await page.evaluate((el, elType, index) => {
          return el.getAttribute('aria-label') || 
                 el.getAttribute('placeholder') || 
                 `${elType.charAt(0).toUpperCase() + elType.slice(1)} ${index+1}`;
        }, element, type, i);
        
        formFields.push({
          index: existingFields.length + formFields.length,
          questionText: questionText,
          type: type,
          selector: element
        });
      }
    }
  }
  
  return formFields;
}

/**
 * Method 4: Identify form fields by Google Forms specific classes
 * @param {Page} page - Puppeteer page object
 * @param {Array} existingFields - Previously identified fields to avoid duplicates
 * @returns {Promise<Array>} - Array of identified form fields
 */
async function identifyByGoogleFormsClasses(page, existingFields) {
  const formFields = [];
  
  console.log('Looking for Google Forms specific elements...');
  
  // Try to find form elements by their specific Google Forms attributes
  const formElements = await page.$$('.freebirdFormviewerComponentsQuestionBaseRoot');
  console.log(`Found ${formElements.length} form elements with class "freebirdFormviewerComponentsQuestionBaseRoot"`);
  
  for (let i = 0; i < formElements.length; i++) {
    const element = formElements[i];
    
    // Get the question text
    const questionTextElement = await element.$('.freebirdFormviewerComponentsQuestionBaseHeader');
    let questionText = '';
    if (questionTextElement) {
      questionText = await page.evaluate(el => el.textContent, questionTextElement);
    } else {
      questionText = `Question ${i+1}`;
    }
    
    // Try to determine the field type
    let fieldType = { type: 'unknown', selector: null };
    
    // Check for text input
    const textInput = await element.$('input[type="text"]');
    if (textInput) {
      fieldType = { type: 'text', selector: textInput };
    }
    
    // Check for paragraph/textarea
    const textarea = await element.$('textarea');
    if (textarea) {
      fieldType = { type: 'paragraph', selector: textarea };
    }
    
    // Check for radio buttons
    const radioButtons = await element.$$('div[role="radio"]');
    if (radioButtons.length > 0) {
      fieldType = { type: 'radio', selector: radioButtons };
    }
    
    // Check for checkboxes
    const checkboxes = await element.$$('div[role="checkbox"]');
    if (checkboxes.length > 0) {
      fieldType = { type: 'checkbox', selector: checkboxes };
    }
    
    // Check for dropdown
    const dropdown = await element.$('div[role="listbox"]');
    if (dropdown) {
      fieldType = { type: 'dropdown', selector: dropdown };
    }
    
    // Only add if we found a valid selector
    if (fieldType.selector) {
      formFields.push({
        index: existingFields.length + formFields.length,
        questionText: questionText.trim(),
        type: fieldType.type,
        selector: fieldType.selector
      });
    }
  }
  
  return formFields;
}

/**
 * Determine the type of a form field
 * @param {ElementHandle} container - Puppeteer element handle for the container
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Object>} - Object with type and selector properties
 */
export async function determineFieldType(container, page) {
  try {
    // First check specifically for date fields that may not have the date type
    // Look for input fields with date-related labels or placeholders
    const possibleDateInputs = await container.$$('input');
    for (const input of possibleDateInputs) {
      const placeholder = await page.evaluate(el => {
        return el.getAttribute('placeholder') || '';
      }, input);
      
      // Check if placeholder matches date format patterns
      if (placeholder.match(/dd[-\/]mm[-\/]yyyy/) || 
          placeholder.match(/mm[-\/]dd[-\/]yyyy/) ||
          placeholder.match(/\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/)) {
        console.log(`Detected date field by placeholder: ${placeholder}`);
        return { type: 'date', selector: input };
      }
      
      // Check if it has a date-picker icon
      const hasDateIcon = await page.evaluate(el => {
        const parentEl = el.parentElement;
        return parentEl && (
          parentEl.querySelector('i[class*="calendar"]') !== null ||
          parentEl.querySelector('svg[class*="calendar"]') !== null ||
          parentEl.querySelector('span[class*="calendar"]') !== null ||
          parentEl.querySelector('button[aria-label*="calendar"]') !== null
        );
      }, input);
      
      if (hasDateIcon) {
        console.log(`Detected date field by calendar icon`);
        return { type: 'date', selector: input };
      }
    }
    
    // Regular checks for different field types
    // Check for short answer/text input
    const textInput = await container.$('input[type="text"]');
    if (textInput) {
      return { type: 'text', selector: textInput };
    }
    
    // Check for paragraph/textarea
    const textarea = await container.$('textarea');
    if (textarea) {
      return { type: 'paragraph', selector: textarea };
    }
    
    // Check for multiple choice (radio buttons)
    const radioButtons = await container.$$('div[role="radio"]');
    if (radioButtons.length > 0) {
      return { type: 'radio', selector: radioButtons };
    }
    
    // Check for checkboxes
    const checkboxes = await container.$$('div[role="checkbox"]');
    if (checkboxes.length > 0) {
      return { type: 'checkbox', selector: checkboxes };
    }
    
    // Check for dropdown
    const dropdown = await container.$('div[role="listbox"]');
    if (dropdown) {
      return { type: 'dropdown', selector: dropdown };
    }
    
    // Check for date input with type="date"
    const dateInput = await container.$('input[type="date"]');
    if (dateInput) {
      return { type: 'date', selector: dateInput };
    }
    
    // Check for email input
    const emailInput = await container.$('input[type="email"]');
    if (emailInput) {
      return { type: 'email', selector: emailInput };
    }
    
    // Check for file upload
    const fileInput = await container.$('input[type="file"]');
    if (fileInput) {
      return { type: 'file', selector: fileInput };
    }
    
    // Check for file upload button (Google Forms specific)
    const fileUploadButton = await container.$('div[role="button"][data-id="fileUploadButton"]');
    if (fileUploadButton) {
      return { type: 'fileButton', selector: fileUploadButton };
    }
    
    // Default to unknown
    return { type: 'unknown', selector: null };
  } catch (error) {
    console.error('Error determining field type:', error);
    return { type: 'unknown', selector: null };
  }
} 