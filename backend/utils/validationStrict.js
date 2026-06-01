/**
 * Strict validation utility functions
 * This version uses a whitelist of common TLDs
 */

// Common TLDs whitelist (you can add more as needed)
const COMMON_TLDS = [
  'com', 'net', 'org', 'edu', 'gov', 'mil', 'int',
  'io', 'ai', 'app', 'dev', 'tech', 'info', 'biz',
  'co.uk', 'co.in', 'co.za', 'com.au', 'com.br',
  'uk', 'us', 'ca', 'de', 'fr', 'jp', 'cn', 'in', 'au',
  'xyz', 'online', 'site', 'store', 'shop', 'cloud'
];

/**
 * Validates email format with strict TLD checking
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmailStrict = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  const trimmedEmail = email.trim();
  
  // Check basic format
  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }

  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  // Local part validation
  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }

  // Domain validation
  if (domain.length === 0 || domain.length > 255) {
    return false;
  }

  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return false;
  }

  // Check for multi-part TLD (e.g., co.uk)
  const lastTwo = domainParts.slice(-2).join('.').toLowerCase();
  const lastOne = domainParts[domainParts.length - 1].toLowerCase();

  // Check if TLD is in whitelist
  if (!COMMON_TLDS.includes(lastTwo) && !COMMON_TLDS.includes(lastOne)) {
    return false;
  }

  return true;
};

/**
 * Add a custom TLD to the whitelist
 * @param {string} tld - TLD to add (e.g., 'co', 'xyz')
 */
export const addAllowedTLD = (tld) => {
  if (tld && typeof tld === 'string' && !COMMON_TLDS.includes(tld.toLowerCase())) {
    COMMON_TLDS.push(tld.toLowerCase());
  }
};

/**
 * Get list of allowed TLDs
 * @returns {string[]} - Array of allowed TLDs
 */
export const getAllowedTLDs = () => {
  return [...COMMON_TLDS];
};
