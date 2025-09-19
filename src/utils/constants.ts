/**
 * Shared constants for the Prompt Monitor Extension
 * 
 * This module contains all shared constants used across the extension,
 * including regex patterns, storage keys, message actions, and DOM selectors.
 * Centralizing these constants ensures consistency and makes maintenance easier.
 * 
 * @fileoverview Shared constants and configuration for the extension
 * @author Prompt Monitor Extension Team
 * @version 1.0.0
 */

/**
 * Comprehensive email detection regex pattern
 * 
 * This regex pattern is designed to match RFC 5322 compliant email addresses
 * while minimizing false positives. It includes:
 * - Word boundaries to prevent partial matches
 * - Support for various valid email characters
 * - Domain validation with TLD requirements
 * - Improved boundary detection to prevent concatenated emails
 * 
 * @constant {RegExp}
 * @example
 * const emails = text.match(EMAIL_REGEX);
 * // Returns array of email addresses found in text
 */
export const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

/**
 * Storage keys for Chrome extension storage API
 * 
 * These keys are used to store and retrieve data from the browser's
 * local storage. Using constants prevents typos and ensures consistency.
 * 
 * @constant {Object}
 * @property {string} EMAIL_HISTORY - Key for storing email detection history
 * @property {string} DISMISSED_EMAILS - Key for storing dismissed email data
 */
export const STORAGE_KEYS = {
  EMAIL_HISTORY: 'prompt_monitor_email_history',
  DISMISSED_EMAILS: 'prompt_monitor_dismissed_emails'
} as const;

/**
 * Message actions for inter-script communication
 * 
 * These constants define the types of messages that can be sent between
 * content scripts, background script, and popup. Using constants ensures
 * type safety and prevents message handling errors.
 * 
 * @constant {Object}
 * @property {string} OPEN_POPUP - Action to open the extension popup
 * @property {string} GET_HISTORY - Action to retrieve email history
 * @property {string} CLEAR_HISTORY - Action to clear email history
 * @property {string} DISMISS_EMAIL - Action to dismiss a specific email
 * @property {string} CHECK_DISMISSED - Action to check if email is dismissed
 * @property {string} EMAILS_DETECTED - Action when emails are detected
 * @property {string} DISMISS_ALL_EMAILS - Action to dismiss all recent emails
 * @property {string} SCAN_PAGE - Action to manually scan page for emails
 */
export const MESSAGE_ACTIONS = {
  OPEN_POPUP: 'openPopup',
  GET_HISTORY: 'getHistory',
  CLEAR_HISTORY: 'clearHistory',
  DISMISS_EMAIL: 'dismissEmail',
  CHECK_DISMISSED: 'checkDismissed',
  EMAILS_DETECTED: 'emailsDetected',
  DISMISS_ALL_EMAILS: 'dismissAllEmails',
  SCAN_PAGE: 'scanPage'
} as const;

/**
 * DOM selectors for ChatGPT interface elements
 * 
 * These selectors are used to find and interact with ChatGPT's interface
 * elements. Multiple selectors are provided for each element type to handle
 * different ChatGPT versions and UI changes.
 * 
 * @constant {Object}
 * @property {string[]} TEXTAREA - Selectors for ChatGPT's input textarea
 * @property {string[]} USER_MESSAGES - Selectors for user message elements
 * @property {string[]} SEND_BUTTON - Selectors for the send/submit button
 */
export const CHATGPT_SELECTORS = {
  TEXTAREA: [
    'textarea[placeholder*="Message"]',
    'textarea[data-id="root"]',
    '#prompt-textarea',
    '[role="textbox"]',
    'textarea[placeholder*="Send a message"]',
    'textarea[placeholder*="Ask ChatGPT"]',
    'div[contenteditable="true"]',
    'textarea'
  ],
  USER_MESSAGES: [
    '[data-message-author-role="user"]',
    '[data-testid*="user"]',
    '.user-message',
    '[class*="user"][class*="message"]'
  ],
  SEND_BUTTON: [
    '[data-testid*="send"]',
    'button[type="submit"]',
    'button:has(svg)'
  ]
} as const;
