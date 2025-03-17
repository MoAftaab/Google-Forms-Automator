# Google Forms Automator

A Node.js tool to automatically fill out Google Forms with your personal information. {I've created this Google Form to simplify placement detail submission for CU students.}

## Features

- Automatically detects and fills various types of form fields
- Works with your existing Chrome profile (bookmarks, cookies, etc.)
- Special handling for date fields (including the problematic DOB field)
- Smart field detection based on field names
- Support for:
  - Text fields and email
  - Date fields
  - Radio buttons
  - Checkboxes
  - Dropdown menus
  - Paragraph fields
- Never submits forms automatically, allowing for manual review

## Prerequisites

- Node.js (v14 or later)
- Google Chrome browser
- npm (usually comes with Node.js)

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Setup

Before using the tool, you need to prepare Chrome for automation:

```bash
npm run prepare-chrome
```

This will guide you through the process of starting Chrome with remote debugging enabled, which allows the tool to control your Chrome browser.

## Usage

To fill out a Google Form, run:

```bash
npm start "https://docs.google.com/forms/d/e/YOUR-FORM-ID/viewform"
```

Replace `YOUR-FORM-ID` with the actual form ID from the URL of the Google Form you want to fill out.

## Customizing Your Information

Your personal information is stored in `information.js`. Edit this file to customize the data used to fill out forms.

## Project Structure

```
GoogleFormsAutomator/
├── src/                        # Source code
│   ├── core/                   # Core functionality
│   │   ├── FormAutomator.js    # Main automation class
│   │   ├── FormFieldIdentifier.js # Form field identification
│   │   └── FormFiller.js       # Form filling orchestration
│   ├── handlers/               # Field type handlers
│   │   ├── TextFieldHandler.js       # Text field handler
│   │   ├── DateFieldHandler.js       # Date field handler
│   │   ├── ParagraphFieldHandler.js  # Paragraph field handler
│   │   ├── RadioFieldHandler.js      # Radio button handler
│   │   ├── CheckboxFieldHandler.js   # Checkbox handler
│   │   └── DropdownFieldHandler.js   # Dropdown handler
│   ├── models/                 # Data models
│   │   └── UserInformation.js  # User information model
│   ├── utils/                  # Utilities
│   │   ├── ChromeStarter.js    # Chrome browser startup
│   │   └── DataMatcher.js      # Field-to-data matching
│   └── index.js                # Main entry point
├── config.js                   # Configuration settings
├── information.js              # Your personal information
├── index.js                    # Root entry point
├── package.json                # Project metadata and dependencies
├── prepareChrome.js            # Chrome preparation script
└── README.md                   # This documentation
```

## Advanced Features

### Date Field Handling

This tool includes special handling for date fields, which can be notoriously difficult to automate. The tool attempts multiple techniques:

1. Direct keyboard input with deliberate pauses
2. DOM manipulation to set values directly
3. Multiple date format attempts (dd-mm-yyyy, yyyy-mm-dd, etc.)
4. Calendar picker interaction when available

### Flexibility
1.Finds the installed Chrome browser on their system
2.Launch it with special parameters to use a dedicated profile directory
3.Control that browser instance to navigate to the Google Form
4.Fill in the fields automatically
5.Either submit the form or let the user review it before submission

### Field-to-Data Matching

The tool uses a sophisticated algorithm to match form field questions to your personal data, supporting variations in how questions might be phrased.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
