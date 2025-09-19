/**
 * Enhanced email detection utilities
 * 
 * This module provides improved email detection functions that handle
 * edge cases like concatenated emails and false positives.
 */

import { EMAIL_REGEX } from './constants';

/**
 * Enhanced email detection function that handles edge cases
 * 
 * @param text - The text to scan for email addresses
 * @returns Array of unique, valid email addresses
 */
export function detectEmails(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // First, try the standard regex
  const matches = text.match(EMAIL_REGEX);
  if (!matches) {
    return [];
  }

  // Process and validate emails
  const emails = matches
    .map(email => email.toLowerCase().trim())
    .filter(email => isValidEmail(email))
    .filter(email => !isFalsePositive(email));

  // Remove duplicates while preserving order
  return [...new Set(emails)];
}

/**
 * Validates if a string is a properly formatted email address
 * 
 * @param email - Email address to validate
 * @returns True if email is valid
 */
function isValidEmail(email: string): boolean {
  // Basic validation
  if (!email || email.length < 5) return false;
  
  // Must contain exactly one @ symbol
  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) return false;
  
  // Split by @ and validate parts
  const [localPart, domainPart] = email.split('@');
  
  // Local part validation
  if (!localPart || localPart.length === 0) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false;
  
  // Domain part validation
  if (!domainPart || domainPart.length === 0) return false;
  if (!domainPart.includes('.')) return false;
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
  if (domainPart.includes('..')) return false;
  
  // TLD validation (must be at least 2 characters)
  const tld = domainPart.split('.').pop();
  if (!tld || tld.length < 2) return false;
  
  return true;
}

/**
 * Filters out common false positive email addresses
 * 
 * @param email - Email address to check
 * @returns True if email is likely a false positive
 */
function isFalsePositive(email: string): boolean {
  const falsePositives = [
    'example@example.com',
    'test@test.com',
    'user@domain.com',
    'email@email.com',
    'admin@admin.com',
    'info@info.com',
    'contact@contact.com',
    'support@support.com',
    'noreply@noreply.com',
    'no-reply@no-reply.com'
  ];
  
  return falsePositives.includes(email.toLowerCase());
}

/**
 * Detects emails in text with additional context validation
 * 
 * @param text - Text to scan
 * @returns Object with emails and context information
 */
export function detectEmailsWithContext(text: string): {
  emails: string[];
  hasMultipleEmails: boolean;
  hasConcatenatedEmails: boolean;
  context: string;
} {
  const emails = detectEmails(text);
  
  // Check for concatenated emails (emails without spaces between them)
  const concatenatedPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const hasConcatenatedEmails = concatenatedPattern.test(text);
  
  return {
    emails,
    hasMultipleEmails: emails.length > 1,
    hasConcatenatedEmails,
    context: text
  };
}

/**
 * Formats an email address for display in the UI
 * 
 * @param email - Email address to format
 * @param maxLength - Maximum length before truncation
 * @returns Formatted email string
 */
export function formatEmailForDisplay(email: string, maxLength: number = 30): string {
  if (!email) return '';
  
  if (email.length <= maxLength) {
    return email;
  }
  
  // Truncate long emails with ellipsis
  const [localPart, domain] = email.split('@');
  if (localPart.length > maxLength - 10) {
    return `${localPart.substring(0, maxLength - 10)}...@${domain}`;
  }
  
  return email;
}

/**
 * Test function to validate email detection
 * 
 * @param testCases - Array of test cases
 */
export function testEmailDetection(testCases: string[]): void {
  console.log('Testing email detection:');
  testCases.forEach((testCase, index) => {
    const result = detectEmailsWithContext(testCase);
    console.log(`Test ${index + 1}: "${testCase}"`);
    console.log(`  Emails: [${result.emails.join(', ')}]`);
    console.log(`  Multiple: ${result.hasMultipleEmails}`);
    console.log(`  Concatenated: ${result.hasConcatenatedEmails}`);
    console.log('');
  });
}