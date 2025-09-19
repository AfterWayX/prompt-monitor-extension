/**
 * Storage utility for managing browser extension local storage
 */

import { EmailIssue } from '../store/types';

const STORAGE_KEYS = {
  EMAIL_HISTORY: 'prompt_monitor_email_history',
  DISMISSED_EMAILS: 'prompt_monitor_dismissed_emails'
} as const;

/**
 * Save email issues to local storage
 */
export const saveEmailHistory = async (issues: EmailIssue[]): Promise<void> => {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.EMAIL_HISTORY]: issues
    });
  } catch (error) {
    console.error('Failed to save email history:', error);
    throw error;
  }
};

/**
 * Load email history from local storage
 */
export const loadEmailHistory = async (): Promise<EmailIssue[]> => {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.EMAIL_HISTORY);
    return result[STORAGE_KEYS.EMAIL_HISTORY] || [];
  } catch (error) {
    console.error('Failed to load email history:', error);
    return [];
  }
};

/**
 * Load current issues (most recent emails from the last session)
 */
export const loadCurrentIssues = async (): Promise<EmailIssue[]> => {
  try {
    const history = await loadEmailHistory();
    const dismissedEmails = await loadDismissedEmails();
    const now = Date.now();
    
    // Get recent emails (from last 5 minutes) and filter out dismissed ones
    const recentEmails = history.filter(issue => {
      const isRecent = (now - issue.timestamp) < (5 * 60 * 1000); // 5 minutes
      // Check if email is dismissed (using email address as key)
      const isDismissed = dismissedEmails[issue.email] && dismissedEmails[issue.email] > now;
      return isRecent && !isDismissed;
    });
    
    // Sort by timestamp (most recent first) and limit to 10
    return recentEmails
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  } catch (error) {
    console.error('Failed to load current issues:', error);
    return [];
  }
};

/**
 * Save dismissed email with timestamp
 */
export const saveDismissedEmail = async (emailId: string, dismissedUntil: number): Promise<void> => {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.DISMISSED_EMAILS);
    const dismissedEmails = result[STORAGE_KEYS.DISMISSED_EMAILS] || {};
    dismissedEmails[emailId] = dismissedUntil;
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.DISMISSED_EMAILS]: dismissedEmails
    });
  } catch (error) {
    console.error('Failed to save dismissed email:', error);
    throw error;
  }
};

/**
 * Load dismissed emails
 */
export const loadDismissedEmails = async (): Promise<Record<string, number>> => {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.DISMISSED_EMAILS);
    return result[STORAGE_KEYS.DISMISSED_EMAILS] || {};
  } catch (error) {
    console.error('Failed to load dismissed emails:', error);
    return {};
  }
};

/**
 * Check if email is currently dismissed
 */
export const isEmailDismissed = async (emailId: string): Promise<boolean> => {
  try {
    const dismissedEmails = await loadDismissedEmails();
    const dismissedUntil = dismissedEmails[emailId];
    
    if (!dismissedUntil) return false;
    
    // Check if dismissal period has expired
    if (Date.now() > dismissedUntil) {
      // Remove expired dismissal
      const updatedDismissed = { ...dismissedEmails };
      delete updatedDismissed[emailId];
      await chrome.storage.local.set({
        [STORAGE_KEYS.DISMISSED_EMAILS]: updatedDismissed
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to check if email is dismissed:', error);
    return false;
  }
};

/**
 * Clear all storage data
 */
export const clearAllStorage = async (): Promise<void> => {
  try {
    await chrome.storage.local.clear();
  } catch (error) {
    console.error('Failed to clear storage:', error);
    throw error;
  }
};
