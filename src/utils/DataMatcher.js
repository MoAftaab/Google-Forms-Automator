/**
 * DataMatcher.js
 * Utility to match form fields with appropriate user data
 */

import userInfo from '../models/UserInformation.js';

/**
 * Determine what data to use based on the question text
 * @param {string} questionText - Text of the form field question
 * @returns {string} - Data to fill in the field
 */
export function determineDataToFill(questionText) {
  const lowerQuestion = questionText.toLowerCase();
  console.log(`Analyzing question: ${questionText}`);
  
  // Exact matches for specific fields - these take highest priority
  
  // Handle Student DOB specifically with correct format
  if (lowerQuestion === "student dob" || lowerQuestion === "student dob *") {
    console.log("Found Student DOB field - using specific date format");
    // Use exact format as requested by user
    return "12-03-2003"; // Hard-coded specific date as requested
  }
  
  if (lowerQuestion === "university roll no" || lowerQuestion === "university roll no *") {
    console.log("Exact match for University Roll No field");
    return userInfo["University Roll No"] || userInfo.uid;
  }
  
  if (lowerQuestion === "personal email id (not college domain)" || 
      lowerQuestion === "personal email id (not college domain) *" ||
      lowerQuestion === "personal email id" || 
      lowerQuestion === "personal email id *") {
    console.log("Exact match for Personal Email ID field");
    return userInfo.personalEmail;
  }
  
  if (lowerQuestion === "college domain email id" || 
      lowerQuestion === "college domain email id *") {
    console.log("Exact match for College Domain Email ID field");
    return userInfo.collegeDomainEmail;
  }
  
  // =========================================================================
  // PERCENTAGE FIELDS
  // =========================================================================
  
  // Specific handling for percentage fields based on exact field names
  if (lowerQuestion === "10th percentage" || lowerQuestion === "10th percentage *") {
    console.log("Matched 10th percentage field exactly");
    if (userInfo.education["10th %"]) {
      return userInfo.education["10th %"];
    }
    return userInfo.education.schoolPercentage;
  }
  
  if (lowerQuestion === "12th percentage" || lowerQuestion === "12th percentage *") {
    console.log("Matched 12th percentage field exactly");
    if (userInfo.education["12th %"]) {
      return userInfo.education["12th %"];
    }
    return userInfo.education.intermediatePercentage;
  }
  
  if (lowerQuestion === "graduation percentage" || lowerQuestion === "graduation percentage *") {
    console.log("Matched graduation percentage field exactly");
    return userInfo.education.graduationPercentage;
  }
  
  if (lowerQuestion === "post graduation percentage" || lowerQuestion === "post graduation percentage *") {
    console.log("Matched post graduation percentage field exactly");
    return userInfo.education.postGraduationPercentage;
  }
  
  // =========================================================================
  // PERSONAL INFORMATION
  // =========================================================================
  
  if (lowerQuestion.includes('uid') || lowerQuestion.includes('id') || lowerQuestion.includes('identifier')) {
    // Format UID: no spaces, no special characters, lowercase only
    const formattedUID = userInfo.uid.toLowerCase().replace(/[\s-]/g, '');
    console.log(`Formatted UID: ${formattedUID}`);
    return formattedUID;
  }
  
  if (lowerQuestion.includes('name') && !lowerQuestion.includes('company') && !lowerQuestion.includes('school')) {
    return userInfo.name;
  }
  
  if (lowerQuestion.includes('email')) {
    if (lowerQuestion.includes('personal') || lowerQuestion.includes('gmail') || lowerQuestion.includes('personal mail id')) {
      return userInfo.personalEmail;
    }
    if (lowerQuestion.includes('college') || lowerQuestion.includes('university') || lowerQuestion.includes('edu') || lowerQuestion.includes('college domain mail id')) {
      return userInfo.collegeDomainEmail;
    }
    return userInfo.email;
  }
  
  if (lowerQuestion.includes('phone') || lowerQuestion.includes('mobile') || lowerQuestion.includes('contact')) {
    if (lowerQuestion.includes('alternate') || lowerQuestion.includes('secondary')) {
      return userInfo.alternatePhone;
    }
    return userInfo.phone;
  }
  
  if (lowerQuestion.includes('date of birth') || lowerQuestion.includes('dob') || lowerQuestion.includes('birth date')) {
    // Use the alternative format if available
    if (userInfo.dob) {
      return userInfo.dob;
    }
    return userInfo.dateOfBirth;
  }
  
  if (lowerQuestion.includes('age') && !lowerQuestion.includes('page')) {
    return userInfo.age;
  }
  
  if (lowerQuestion.includes('gender') || lowerQuestion.includes('sex')) {
    return userInfo.gender;
  }
  
  if (lowerQuestion.includes('marital') || lowerQuestion.includes('married')) {
    return userInfo.maritalStatus;
  }
  
  if (lowerQuestion.includes('nationality') || lowerQuestion.includes('citizen')) {
    return userInfo.nationality;
  }
  
  // =========================================================================
  // EDUCATION INFORMATION
  // =========================================================================
  
  if (lowerQuestion.includes('university') || lowerQuestion.includes('college') || lowerQuestion.includes('institution')) {
    if (lowerQuestion.includes('post') || lowerQuestion.includes('pg')) {
      return userInfo.education.postGraduationUniversity;
    }
    if (lowerQuestion.includes('graduation') || lowerQuestion.includes('ug')) {
      return userInfo.education.graduationUniversity;
    }
    return userInfo.education.school;
  }
  
  if (lowerQuestion.includes('course') || lowerQuestion.includes('program') || lowerQuestion.includes('degree')) {
    if (lowerQuestion.includes('post') || lowerQuestion.includes('pg')) {
      return userInfo.education.postGraduationDegree || "N/A";
    }
    return userInfo.education.degree;
  }
  
  if (lowerQuestion.includes('cgpa')) {
    return userInfo.education.cgpa;
  }
  
  if (lowerQuestion.includes('percentage')) {
    if (lowerQuestion.includes('school') || lowerQuestion.includes('10th') || lowerQuestion.includes('x') || lowerQuestion.includes('ssc')) {
      return userInfo.education.schoolPercentage;
    }
    if (lowerQuestion.includes('intermediate') || lowerQuestion.includes('12th') || lowerQuestion.includes('xii') || lowerQuestion.includes('higher secondary') || lowerQuestion.includes('hsc')) {
      return userInfo.education.intermediatePercentage;
    }
    if (lowerQuestion.includes('graduation') || lowerQuestion.includes('ug') || lowerQuestion.includes('grad percentage')) {
      return userInfo.education.graduationPercentage;
    }
    if (lowerQuestion.includes('post') || lowerQuestion.includes('pg') || lowerQuestion.includes('post grad percentage')) {
      return userInfo.education.postGraduationPercentage;
    }
    return userInfo.education.percentage;
  }
  
  if (lowerQuestion.includes('10th') || (lowerQuestion.includes('10') && lowerQuestion.includes('%'))) {
    if (userInfo.education["10th %"]) {
      return userInfo.education["10th %"];
    }
    return userInfo.education.schoolPercentage;
  }
  
  if (lowerQuestion.includes('12th') || (lowerQuestion.includes('12') && lowerQuestion.includes('%'))) {
    if (userInfo.education["12th %"]) {
      return userInfo.education["12th %"];
    }
    return userInfo.education.intermediatePercentage;
  }
  
  if (lowerQuestion.includes('board')) {
    if (lowerQuestion.includes('school') || lowerQuestion.includes('10th')) {
      return userInfo.education.schoolBoard;
    }
    if (lowerQuestion.includes('intermediate') || lowerQuestion.includes('12th')) {
      return userInfo.education.intermediateBoard;
    }
    return userInfo.education.schoolBoard;
  }
  
  if (lowerQuestion.includes('semester') || lowerQuestion.includes('sem')) {
    return userInfo.education.currentSemester;
  }
  
  if (lowerQuestion.includes('section') || lowerQuestion.includes('sec')) {
    return userInfo.education.section;
  }
  
  if (lowerQuestion.includes('backlog')) {
    if (lowerQuestion.includes('current')) {
      return userInfo.education.currentBacklogs;
    }
    if (lowerQuestion.includes('total')) {
      return userInfo.education.totalBacklogs;
    }
    return userInfo.education.currentBacklogs;
  }
  
  if (lowerQuestion.includes('batch') || lowerQuestion.includes('passing') || lowerQuestion.includes('graduation year')) {
    return userInfo.education.batch;
  }
  
  if (lowerQuestion.includes('expected') && lowerQuestion.includes('graduation')) {
    return userInfo.education.expectedGraduationDate;
  }
  
  if (lowerQuestion.includes('program') || lowerQuestion.includes('course')) {
    return userInfo.education.program;
  }
  
  if (lowerQuestion.includes('stream') || lowerQuestion.includes('specialization') || lowerQuestion.includes('branch')) {
    return userInfo.education.stream;
  }
  
  if (lowerQuestion.includes('degree')) {
    return userInfo.education.degree;
  }
  
  if (lowerQuestion.includes('major') || lowerQuestion.includes('field of study')) {
    return userInfo.education.major;
  }
  
  // =========================================================================
  // APPLICATION INFORMATION
  // =========================================================================
  
  if (lowerQuestion.includes('position') || lowerQuestion.includes('role') || lowerQuestion.includes('applying for')) {
    return userInfo.application.position;
  }
  
  if (lowerQuestion.includes('registered') || lowerQuestion.includes('corporate link')) {
    return userInfo.application.registeredOnCorporateLink;
  }
  
  if (lowerQuestion.includes('reason') && lowerQuestion.includes('registration')) {
    return userInfo.application.registrationReason;
  }
  
  if (lowerQuestion.includes('preferred location') || lowerQuestion.includes('work location')) {
    return userInfo.application.preferredLocation;
  }
  
  if (lowerQuestion.includes('relocate')) {
    return userInfo.application.willingToRelocate;
  }
  
  if (lowerQuestion.includes('notice period')) {
    return userInfo.application.noticePeriod;
  }
  
  if (lowerQuestion.includes('expected') && lowerQuestion.includes('salary')) {
    return userInfo.application.expectedSalary;
  }
  
  if (lowerQuestion.includes('current') && lowerQuestion.includes('ctc')) {
    return userInfo.application.currentCTC;
  }
  
  if (lowerQuestion.includes('expected') && lowerQuestion.includes('ctc')) {
    return userInfo.application.expectedCTC;
  }
  
  if (lowerQuestion.includes('reason') && lowerQuestion.includes('job change')) {
    return userInfo.application.reasonForJobChange;
  }
  
  if (lowerQuestion.includes('referred')) {
    return userInfo.application.referredBy;
  }
  
  if (lowerQuestion.includes('available') && lowerQuestion.includes('interview')) {
    return userInfo.application.availableForInterview;
  }
  
  if (lowerQuestion.includes('work model') || lowerQuestion.includes('remote') || lowerQuestion.includes('hybrid')) {
    return userInfo.application.preferredWorkModel;
  }
  
  // =========================================================================
  // ADDRESS INFORMATION
  // =========================================================================
  
  if (lowerQuestion.includes('address')) {
    if (lowerQuestion.includes('permanent')) {
      return userInfo.address.permanentAddress.street;
    }
    if (lowerQuestion.includes('current')) {
      return userInfo.address.currentAddress.street;
    }
    return userInfo.address.currentAddress.street;
  }
  
  if (lowerQuestion.includes('city')) {
    if (lowerQuestion.includes('permanent')) {
      return userInfo.address.permanentAddress.city;
    }
    return userInfo.address.currentAddress.city;
  }
  
  if (lowerQuestion.includes('state')) {
    if (lowerQuestion.includes('permanent')) {
      return userInfo.address.permanentAddress.state;
    }
    return userInfo.address.currentAddress.state;
  }
  
  if (lowerQuestion.includes('zip') || lowerQuestion.includes('postal')) {
    if (lowerQuestion.includes('permanent')) {
      return userInfo.address.permanentAddress.zipCode;
    }
    return userInfo.address.currentAddress.zipCode;
  }
  
  if (lowerQuestion.includes('country')) {
    if (lowerQuestion.includes('permanent')) {
      return userInfo.address.permanentAddress.country;
    }
    return userInfo.address.currentAddress.country;
  }
  
  // =========================================================================
  // WORK EXPERIENCE
  // =========================================================================
  
  if (lowerQuestion.includes('company') || lowerQuestion.includes('employer')) {
    return userInfo.workExperience[0].company;
  }
  
  if (lowerQuestion.includes('job title') || lowerQuestion.includes('designation')) {
    return userInfo.workExperience[0].position;
  }
  
  if (lowerQuestion.includes('start date') && lowerQuestion.includes('work')) {
    return userInfo.workExperience[0].startDate;
  }
  
  if (lowerQuestion.includes('end date') && lowerQuestion.includes('work')) {
    return userInfo.workExperience[0].endDate;
  }
  
  if (lowerQuestion.includes('duration') && lowerQuestion.includes('work')) {
    return userInfo.workExperience[0].duration;
  }
  
  if (lowerQuestion.includes('work') && lowerQuestion.includes('location')) {
    return userInfo.workExperience[0].location;
  }
  
  if (lowerQuestion.includes('responsibilities')) {
    return userInfo.workExperience[0].responsibilities;
  }
  
  if (lowerQuestion.includes('technologies') && lowerQuestion.includes('work')) {
    return userInfo.workExperience[0].technologies;
  }
  
  if (lowerQuestion.includes('achievements') && lowerQuestion.includes('work')) {
    return userInfo.workExperience[0].achievements;
  }
  
  if (lowerQuestion.includes('experience') || lowerQuestion.includes('job description')) {
    return userInfo.workExperience[0].description;
  }
  
  // =========================================================================
  // PROJECTS
  // =========================================================================
  
  if (lowerQuestion.includes('project') && lowerQuestion.includes('title')) {
    return userInfo.projects[0].title;
  }
  
  if (lowerQuestion.includes('project') && lowerQuestion.includes('description')) {
    return userInfo.projects[0].description;
  }
  
  if (lowerQuestion.includes('project') && lowerQuestion.includes('technologies')) {
    return userInfo.projects[0].technologies;
  }
  
  if (lowerQuestion.includes('project') && lowerQuestion.includes('role')) {
    return userInfo.projects[0].role;
  }
  
  if (lowerQuestion.includes('project') && lowerQuestion.includes('duration')) {
    return userInfo.projects[0].duration;
  }
  
  if (lowerQuestion.includes('project') && lowerQuestion.includes('link')) {
    return userInfo.projects[0].link;
  }
  
  // =========================================================================
  // SKILLS
  // =========================================================================
  
  if (lowerQuestion.includes('programming') && lowerQuestion.includes('languages')) {
    return userInfo.skills.programmingLanguages.join(', ');
  }
  
  if (lowerQuestion.includes('frameworks')) {
    return userInfo.skills.frameworks.join(', ');
  }
  
  if (lowerQuestion.includes('databases')) {
    return userInfo.skills.databases.join(', ');
  }
  
  if (lowerQuestion.includes('tools')) {
    return userInfo.skills.tools.join(', ');
  }
  
  if (lowerQuestion.includes('soft skills')) {
    return userInfo.skills.softSkills.join(', ');
  }
  
  if (lowerQuestion.includes('skills') && !lowerQuestion.includes('soft')) {
    return [...userInfo.skills.programmingLanguages, ...userInfo.skills.frameworks].join(', ');
  }
  
  // =========================================================================
  // CERTIFICATIONS & LANGUAGES
  // =========================================================================
  
  if (lowerQuestion.includes('certification')) {
    return userInfo.certifications[0].name;
  }
  
  if (lowerQuestion.includes('language') && !lowerQuestion.includes('programming')) {
    return userInfo.languages.map(l => `${l.language} (${l.proficiency})`).join(', ');
  }
  
  // =========================================================================
  // COMMON FORM RESPONSES
  // =========================================================================
  
  if (lowerQuestion.includes('ethnicity') || lowerQuestion.includes('race')) {
    return userInfo.commonResponses.ethnicity;
  }
  
  if (lowerQuestion.includes('visa') || lowerQuestion.includes('work authorization')) {
    return userInfo.commonResponses.visaStatus;
  }
  
  if (lowerQuestion.includes('disability')) {
    return userInfo.commonResponses.disabilityStatus;
  }
  
  if (lowerQuestion.includes('veteran')) {
    return userInfo.commonResponses.veteranStatus;
  }
  
  if (lowerQuestion.includes('criminal')) {
    return userInfo.commonResponses.criminalRecord;
  }
  
  if (lowerQuestion.includes('terms') && lowerQuestion.includes('agree')) {
    return userInfo.commonResponses.agreeToTerms;
  }
  
  if (lowerQuestion.includes('background') && lowerQuestion.includes('check')) {
    return userInfo.commonResponses.agreeToBackground;
  }
  
  // =========================================================================
  // SOCIAL MEDIA LINKS
  // =========================================================================
  
  if (lowerQuestion.includes('linkedin')) {
    return userInfo.links.linkedin;
  }
  
  if (lowerQuestion.includes('github')) {
    return userInfo.links.github;
  }
  
  if (lowerQuestion.includes('portfolio')) {
    return userInfo.links.portfolio;
  }
  
  if (lowerQuestion.includes('twitter')) {
    return userInfo.links.twitter;
  }
  
  if (lowerQuestion.includes('stackoverflow')) {
    return userInfo.links.stackoverflow;
  }
  
  if (lowerQuestion.includes('medium')) {
    return userInfo.links.medium;
  }
  
  // =========================================================================
  // ADDITIONAL INFORMATION
  // =========================================================================
  
  if (lowerQuestion.includes('hobbies')) {
    return userInfo.additionalInfo.hobbies.join(', ');
  }
  
  if (lowerQuestion.includes('achievements') && !lowerQuestion.includes('work')) {
    return userInfo.additionalInfo.achievements.join(', ');
  }
  
  if (lowerQuestion.includes('interests')) {
    return userInfo.additionalInfo.interests.join(', ');
  }
  
  if (lowerQuestion.includes('reference')) {
    const ref = userInfo.additionalInfo.references[0];
    return `${ref.name}, ${ref.position} at ${ref.company}, ${ref.email}, ${ref.phone}`;
  }
  
  // Default response for unrecognized questions
  console.log(`No match found for question: ${questionText}`);
  
  // If the question contains "email", return email as a fallback
  if (lowerQuestion.includes('email')) {
    return userInfo.email;
  }
  
  return "Not applicable";
} 