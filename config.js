// Configuration for Google Forms Automator

const config = {
    // Path to resume file (PDF, DOCX, etc.)
    resumePath: './resume.pdf',
    
    // Whether to submit the form automatically (true) or leave it for manual review (false)
    autoSubmit: false,
    
    // Delay between filling fields (in milliseconds)
    fieldDelay: {
        min: 500,  // Minimum delay
        max: 1500  // Maximum delay
    },
    
    // Browser settings
    browser: {
        // Whether to use the user's existing Chrome profile
        useExistingProfile: true,  // Set to true to use the real Chrome profile from the system
        
        // Whether to run in headless mode (invisible browser)
        headless: false,
        
        // Whether to connect to an already running Chrome instance
        connectToExisting: true  // Try to connect to an existing Chrome browser first
    }
};

export default config; 