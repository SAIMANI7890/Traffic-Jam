/**
 * Validation utility functions
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Additional checks
  const trimmedEmail = email.trim();
  
  // Check basic format
  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }

  // Check for valid TLD (top-level domain)
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  // Local part (before @) validation
  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }

  // Domain validation
  if (domain.length === 0 || domain.length > 255) {
    return false;
  }

  // Check for valid TLD (at least 2 characters)
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return false;
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return false;
  }

  // Check that TLD contains only letters
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return false;
  }

  // Optional: Reject 2-letter TLDs that are uncommon (you can customize this list)
  // Common TLDs: com, net, org, edu, gov, mil, int, co, io, ai, etc.
  // If you want to be strict, you can maintain a whitelist or blacklist
  // For now, we'll accept all valid format TLDs with 2+ letters

  return true;
};

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 30) {
    return { valid: false, message: 'Username must be less than 30 characters' };
  }

  // Allow letters, numbers, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true, message: '' };
};

/**
 * Validates PIN format
 * @param {string|number} pin - PIN to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePin = (pin) => {
  if (pin === null || pin === undefined) {
    return { valid: false, message: 'PIN is required' };
  }

  const pinStr = String(pin);

  if (!/^\d{4}$/.test(pinStr)) {
    return { valid: false, message: 'PIN must be exactly 4 digits' };
  }

  return { valid: true, message: '' };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }

  if (password.length > 100) {
    return { valid: false, message: 'Password must be less than 100 characters' };
  }

  return { valid: true, message: '' };
};

/**
 * Sanitizes email (lowercase and trim)
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.toLowerCase().trim();
};

/**
 * Sanitizes username (trim)
 * @param {string} username - Username to sanitize
 * @returns {string} - Sanitized username
 */
export const sanitizeUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return '';
  }
  return username.trim();
};
