/**
 * Sample Private Configuration File
 * 
 * Copy this file to config.js and update with your actual values.
 * The real config.js file should never be committed to version control.
 * 
 * @author iwrsu
 */

// SHA-256 hash of your edit password
// To generate: node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD_HERE').digest('hex'))"
export const EDIT_PASSWORD_HASH = 'REPLACE_WITH_YOUR_PASSWORD_HASH';

// Cache key for storing edit access in localStorage
export const EDIT_TRUST_KEY = 'edit_access_trusted_until';