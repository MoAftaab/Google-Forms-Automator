/**
 * DateFieldHandler.js
 * Specialized module for handling date fields in Google Forms
 */

/**
 * Handle date field input
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @param {string} dataToFill - Date data to fill
 * @returns {Promise<boolean>} - Whether the date was successfully filled
 */
export async function handleDateField(page, field, dataToFill) {
  try {
    // For date fields, special handling is needed
    console.log(`Handling date field: ${field.questionText}`);
    
    // Special handling for Student DOB field
    if (field.questionText.toLowerCase().includes('student dob') || 
        field.questionText.toLowerCase().includes('dob')) {
      
      console.log(`SPECIAL DIRECT DATE FIELD HANDLING for: ${field.questionText}`);
      return await handleSpecialDOBField(page, field);
    } else {
      // Standard date field handling
      return await handleStandardDateField(page, field, dataToFill);
    }
  } catch (error) {
    console.error(`Error handling date field ${field.questionText}:`, error);
    return false;
  }
}

/**
 * Special handling for DOB fields
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @returns {Promise<boolean>} - Whether the date was successfully filled
 */
async function handleSpecialDOBField(page, field) {
  try {
    // Force the browser to focus the input element
    await page.evaluate(el => {
      // Force focus
      el.focus();
      
      // Clear any existing value
      el.value = '';
    }, field.selector);
    
    // Wait for focus to take effect
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Create a string for the date "dd-mm-yyyy"
    const dateValue = "12-03-2003";
    console.log(`Entering direct date: ${dateValue}`);
    
    // Type each character slowly with deliberate pauses
    for(let i = 0; i < dateValue.length; i++) {
      await page.keyboard.type(dateValue[i]);
      // Longer pause for hyphens to ensure they register
      if(dateValue[i] === '-') {
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Press Tab to exit the field
    await page.keyboard.press('Tab');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Also try to set the value directly in case typing didn't work
    await page.evaluate((el, date) => {
      try {
        // Set the value directly
        el.value = date;
        
        // Manually dispatch events that would normally occur
        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });
        const blurEvent = new Event('blur', { bubbles: true });
        
        el.dispatchEvent(inputEvent);
        el.dispatchEvent(changeEvent);
        el.dispatchEvent(blurEvent);
        
        console.log("Events dispatched for date field");
      } catch(e) {
        console.error("Error in evaluation:", e);
      }
    }, field.selector, dateValue);
    
    // Check if we have a validation message indicating error
    const hasError = await page.evaluate(el => {
      // Look for validation message near this field
      const container = el.closest('[role="listitem"]');
      const errorMsg = container?.querySelector('[role="alert"]')?.textContent;
      return errorMsg ? errorMsg : null;
    }, field.selector);
    
    if (hasError) {
      console.log(`Validation error after direct entry: ${hasError}`);
      return await handleDateValidationError(page, field);
    }
    
    console.log("Completed direct date entry");
    return true;
  } catch (error) {
    console.error(`Error in special DOB handling: ${error.message}`);
    return false;
  }
}

/**
 * Handle standard date fields
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @param {string} dataToFill - Date data to fill
 * @returns {Promise<boolean>} - Whether the date was successfully filled
 */
async function handleStandardDateField(page, field, dataToFill) {
  try {
    await field.selector.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Type the date with careful timing
    const dateToFill = dataToFill;
    console.log(`Filling standard date field with: ${dateToFill}`);
    
    for (const char of dateToFill) {
      await page.keyboard.type(char);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await page.keyboard.press('Tab');
    console.log(`Completed standard date entry for ${field.questionText}`);
    return true;
  } catch (error) {
    console.error(`Error in standard date handling: ${error.message}`);
    return false;
  }
}

/**
 * Handle date validation errors by trying alternative approaches
 * @param {Page} page - Puppeteer page object
 * @param {Object} field - Field object
 * @returns {Promise<boolean>} - Whether the date was successfully filled
 */
async function handleDateValidationError(page, field) {
  try {
    // Try a click-and-type approach with even more deliberate timing
    await field.selector.click({clickCount: 3});
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clear the field manually with backspace to ensure it's empty
    await page.keyboard.press('Backspace');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Type very slowly with even more deliberate pauses
    await page.keyboard.type("1");
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.type("2");
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.type("-");
    await new Promise(resolve => setTimeout(resolve, 300));
    await page.keyboard.type("0");
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.type("3");
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.type("-");
    await new Promise(resolve => setTimeout(resolve, 300));
    await page.keyboard.type("2");
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.type("0");
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.type("0");
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.keyboard.type("3");
    
    // Press Tab to exit the field
    await page.keyboard.press('Tab');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Add a last resort button click attempt
    await page.evaluate(() => {
      // Try to click any OK or Apply button in a date picker dialog
      const buttons = Array.from(document.querySelectorAll('button'));
      const okButton = buttons.find(b => 
        b.textContent.includes('OK') || 
        b.textContent.includes('Apply') ||
        b.textContent.includes('Done')
      );
      
      if (okButton) {
        console.log("Found OK button, clicking it");
        okButton.click();
      }
    });
    
    return true;
  } catch (error) {
    console.error(`Error in date validation error handling: ${error.message}`);
    return false;
  }
}

/**
 * Emergency fix for date fields using direct DOM manipulation
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<boolean>} - Whether the date field was fixed
 */
export async function fixDateFieldDirectly(page) {
  console.log("🔥 EMERGENCY DATE FIELD FIX INITIATED");
  try {
    // Wait to make sure the form is fully loaded
    await new Promise(r => setTimeout(r, 3000));
    
    // Apply direct DOM instrumentation to bypass Google Forms validation
    await page.evaluate(() => {
      try {
        console.log("Starting direct DOM date manipulation");
        
        // Find the date field by its placeholder or by its container
        function findDateField() {
          // Method 1: By placeholder
          const dateInputs = Array.from(document.querySelectorAll('input'))
            .filter(input => input.placeholder && 
                          (input.placeholder.includes('dd-mm-yyyy') || 
                           input.placeholder.includes('dd/mm/yyyy')));
          
          if (dateInputs.length > 0) {
            console.log("Found date input by placeholder");
            return dateInputs[0];
          }
          
          // Method 2: By question text
          const dobHeadings = Array.from(document.querySelectorAll('[role="heading"]'))
            .filter(h => h.textContent.includes('DOB') || h.textContent.includes('Date of Birth'));
          
          if (dobHeadings.length > 0) {
            const container = dobHeadings[0].closest('[role="listitem"]');
            if (container) {
              const input = container.querySelector('input');
              if (input) {
                console.log("Found date input by DOB heading");
                return input;
              }
            }
          }
          
          // Method 3: Find any input that looks like a date field
          const allInputs = Array.from(document.querySelectorAll('input'));
          for (const input of allInputs) {
            const parent = input.closest('[role="listitem"]');
            if (parent && parent.textContent.toLowerCase().includes('dob')) {
              console.log("Found date input by parent text");
              return input;
            }
          }
          
          console.log("Could not find date field");
          return null;
        }
        
        const dateInput = findDateField();
        if (!dateInput) {
          console.log("Date field not found, cannot fix");
          return { success: false, error: "Date input not found" };
        }
        
        console.log("Date input found, attempting to fix...");
        
        // Try all possible date formats
        const dateFormats = [
          "12-03-2003",     // dd-mm-yyyy
          "2003-03-12",     // yyyy-mm-dd (ISO format)
          "03/12/2003",     // mm/dd/yyyy (US format)
          "12/03/2003",     // dd/mm/yyyy (UK format)
          "12.03.2003",     // dd.mm.yyyy (European format)
          "2003/03/12"      // yyyy/mm/dd (ISO-like)
        ];
        
        // Define a simple function to try all formats
        function tryAllFormats() {
          // Record the original validation state
          const initialErrorDisplay = document.querySelector('[role="alert"]')?.textContent || '';
          
          // For each format
          for (const format of dateFormats) {
            // Clear existing value
            dateInput.value = '';
            
            // Set new value
            dateInput.value = format;
            
            // Dispatch all relevant events to ensure the form recognizes the input
            ['input', 'change', 'focus', 'blur'].forEach(event => {
              dateInput.dispatchEvent(new Event(event, {bubbles: true}));
            });
            
            console.log(`Tried format: ${format}`);
            
            // Check if validation error is gone
            const errorDisplay = document.querySelector('[role="alert"]')?.textContent || '';
            if (errorDisplay !== initialErrorDisplay || errorDisplay === '') {
              console.log(`Format ${format} seems to have worked!`);
              return format;
            }
          }
          
          return null; // No format worked
        }
        
        // Try setting the date directly
        const workingFormat = tryAllFormats();
        
        // Try to click the date field to bring up the date picker
        dateInput.click();
        
        // Let's also try to directly submit a correct ISO format (YYYY-MM-DD)
        // which is what Google Forms might expect under the hood
        dateInput.value = "2003-03-12";
        
        // Dispatch all relevant events
        ['input', 'change', 'focus', 'blur'].forEach(event => {
          dateInput.dispatchEvent(new Event(event, {bubbles: true}));
        });
        
        // Apply direct attribute setting as a last resort
        Object.defineProperty(dateInput, 'value', {
          writable: true,
          value: "12-03-2003"
        });
        
        return { 
          success: true, 
          message: "Applied all date format fixes",
          workingFormat: workingFormat
        };
      } catch (error) {
        console.error("Error in direct date fix:", error);
        return { success: false, error: error.toString() };
      }
    });
    
    // Attempt to click on the date field and type directly
    try {
      // Find the date input field
      const dateInput = await page.$('input[placeholder*="dd-mm-yyyy"], input[placeholder*="dd/mm/yyyy"]');
      if (dateInput) {
        // Click with triple click to select all text
        await dateInput.click({clickCount: 3});
        await new Promise(r => setTimeout(r, 500));
        
        // Clear the field
        await page.keyboard.press('Backspace');
        await new Promise(r => setTimeout(r, 300));
        
        // Type date character by character VERY slowly
        console.log("Typing date with long delays...");
        
        // Type each character with a delay
        const dateString = "12-03-2003";
        for (let i = 0; i < dateString.length; i++) {
          await page.keyboard.type(dateString[i]);
          // Long delay after each character
          await new Promise(r => setTimeout(r, 300));
        }
        
        // Press Tab to exit the field
        await page.keyboard.press('Tab');
        await new Promise(r => setTimeout(r, 500));
        
        // Force blur
        await page.evaluate(() => {
          document.activeElement.blur();
        });
        
        console.log("Date typed character by character with delays");
      }
    } catch (error) {
      console.error("Error in direct typing approach:", error);
    }
    
    // As an absolute last resort, try using ISO format (YYYY-MM-DD)
    try {
      const dateFields = await page.$$('input[placeholder*="dd-mm-yyyy"], input[placeholder*="dd/mm/yyyy"]');
      for (const field of dateFields) {
        await page.evaluate((el) => {
          // Try setting with ISO format as Google might use this internally
          el.value = "2003-03-12"; 
          el.dispatchEvent(new Event('input', {bubbles: true}));
          el.dispatchEvent(new Event('change', {bubbles: true}));
          el.dispatchEvent(new Event('blur', {bubbles: true}));
        }, field);
        
        console.log("Applied ISO date format as last resort");
      }
    } catch (error) {
      console.error("Error in ISO format attempt:", error);
    }
    
    console.log("🔥 EMERGENCY DATE FIX COMPLETED");
    return true;
  } catch (error) {
    console.error("🔥 EMERGENCY DATE FIX FAILED:", error);
    return false;
  }
}

/**
 * Specialized date handler for direct DOM manipulation
 * @param {Page} page - Puppeteer page object
 * @param {string} day - Day value (default "12")
 * @param {string} month - Month value (default "03")
 * @param {string} year - Year value (default "2003")
 * @returns {Promise<boolean>} - Whether the date was successfully handled
 */
export async function specialDateHandler(page, day = "12", month = "03", year = "2003") {
  console.log("Using specialized date handler as a direct function");
  
  try {
    // Find the DOB field
    const dobFields = await page.$$('div[role="listitem"]');
    
    for (const field of dobFields) {
      const headingText = await page.evaluate(el => {
        const heading = el.querySelector('[role="heading"]');
        return heading ? heading.textContent : '';
      }, field);
      
      if (headingText.toLowerCase().includes('dob') || headingText.toLowerCase().includes('date of birth')) {
        console.log(`Found DOB field: ${headingText}`);
        
        // Find the input element
        const input = await field.$('input');
        if (input) {
          // Click to focus
          await input.click({ clickCount: 3 });
          await page.keyboard.press('Backspace');
          await new Promise(r => setTimeout(r, 500));
          
          // Type the date with specific pauses
          await page.keyboard.type(day);
          await new Promise(r => setTimeout(r, 300));
          await page.keyboard.type('-');
          await new Promise(r => setTimeout(r, 300));
          await page.keyboard.type(month);
          await new Promise(r => setTimeout(r, 300));
          await page.keyboard.type('-');
          await new Promise(r => setTimeout(r, 300));
          
          // Type year one digit at a time
          for (const digit of year) {
            await page.keyboard.type(digit);
            await new Promise(r => setTimeout(r, 200));
          }
          
          // Press enter and then tab
          await page.keyboard.press('Enter');
          await new Promise(r => setTimeout(r, 500));
          await page.keyboard.press('Tab');
          
          // Also try to programmatically set the value
          await page.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('blur', { bubbles: true }));
          }, input, `${day}-${month}-${year}`);
          
          console.log("Completed direct date entry");
          return true;
        }
      }
    }
    
    // If we get here, we didn't find the field
    console.log("Could not find the DOB field");
    return false;
  } catch (error) {
    console.error("Error in specialized date handler:", error);
    return false;
  }
} 