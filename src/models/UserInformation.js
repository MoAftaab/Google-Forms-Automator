/**
 * UserInformation.js
 * Model for user information used to fill forms
 */

// Import the original information file
import originalUserInfo from '../../information.js';

// Enhance or transform user info as needed
const userInfo = {
  ...originalUserInfo,
  
  // Add computed or derived properties
  get fullName() {
    return this.name;
  },
  
  get birthYear() {
    if (this.dateOfBirth) {
      return this.dateOfBirth.split('-')[0];
    }
    if (this.dob) {
      const parts = this.dob.split('-');
      return parts.length === 3 ? parts[2] : null;
    }
    return null;
  },
  
  get formattedPhone() {
    if (!this.phone) return '';
    
    // Remove non-digit characters
    const digits = this.phone.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length === 10) {
      return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    
    return this.phone;
  }
};

export default userInfo; 