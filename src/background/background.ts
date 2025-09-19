/**
 * Background script for the Prompt Monitor Extension
 */

import { STORAGE_KEYS, MESSAGE_ACTIONS } from '../utils/constants';

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Prompt Monitor Extension installed:', details.reason);
  
  // Initialize storage
  chrome.storage.local.set({
    [STORAGE_KEYS.EMAIL_HISTORY]: [],
    [STORAGE_KEYS.DISMISSED_EMAILS]: {}
  });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.action) {
    case MESSAGE_ACTIONS.OPEN_POPUP:
      // Open the extension popup
      chrome.action.openPopup();
      break;
      
    case MESSAGE_ACTIONS.GET_HISTORY:
      // Get email history
      chrome.storage.local.get(STORAGE_KEYS.EMAIL_HISTORY, (result) => {
        sendResponse(result[STORAGE_KEYS.EMAIL_HISTORY] || []);
      });
      return true; // Keep message channel open for async response
      
    case MESSAGE_ACTIONS.CLEAR_HISTORY:
      // Clear email history
      chrome.storage.local.remove(STORAGE_KEYS.EMAIL_HISTORY, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case MESSAGE_ACTIONS.DISMISS_EMAIL:
      // Dismiss email for 24 hours
      const { emailId } = message;
      const dismissedUntil = Date.now() + (24 * 60 * 60 * 1000);
      
      chrome.storage.local.get(STORAGE_KEYS.DISMISSED_EMAILS, (result) => {
        const dismissedEmails = result[STORAGE_KEYS.DISMISSED_EMAILS] || {};
        dismissedEmails[emailId] = dismissedUntil;
        
        chrome.storage.local.set({
          [STORAGE_KEYS.DISMISSED_EMAILS]: dismissedEmails
        }, () => {
          sendResponse({ success: true });
        });
      });
      return true;
      
    case MESSAGE_ACTIONS.CHECK_DISMISSED:
      // Check if email is dismissed
      const { emailId: checkEmailId } = message;
      
      chrome.storage.local.get(STORAGE_KEYS.DISMISSED_EMAILS, (result) => {
        const dismissedEmails = result[STORAGE_KEYS.DISMISSED_EMAILS] || {};
        const dismissedUntil = dismissedEmails[checkEmailId];
        
        if (dismissedUntil && Date.now() < dismissedUntil) {
          sendResponse({ dismissed: true, dismissedUntil });
        } else {
          sendResponse({ dismissed: false });
        }
      });
      return true;
      
    case MESSAGE_ACTIONS.EMAILS_DETECTED:
      // Handle emails detected by content script
      const { emails, prompt } = message;
      console.log('Emails detected:', emails, 'Prompt:', prompt);
      
      if (emails && emails.length > 0) {
        // Get current history
        chrome.storage.local.get(STORAGE_KEYS.EMAIL_HISTORY, (result) => {
          const history = result[STORAGE_KEYS.EMAIL_HISTORY] || [];
          
          // Create new entries for each email
          const newEntries = emails.map((email: string) => ({
            id: `${email}_${Date.now()}`,
            email: email,
            timestamp: Date.now(),
            prompt: prompt || '',
            url: sender.tab?.url || ''
          }));
          
          // Add new entries to history (avoid duplicates)
          const updatedHistory = [...history];
          newEntries.forEach((newEntry: any) => {
            const exists = updatedHistory.some((entry: any) => 
              entry.email === newEntry.email && 
              entry.prompt === newEntry.prompt &&
              (Date.now() - entry.timestamp) < 60000 // Within last minute
            );
            if (!exists) {
              updatedHistory.unshift(newEntry);
            }
          });
          
          // Keep only last 100 entries
          const trimmedHistory = updatedHistory.slice(0, 100);
          
          // Save updated history
          chrome.storage.local.set({
            [STORAGE_KEYS.EMAIL_HISTORY]: trimmedHistory
          }, () => {
            console.log('Email history updated:', trimmedHistory.length, 'entries');
          });
        });
      }
      break;
      
    case MESSAGE_ACTIONS.DISMISS_ALL_EMAILS:
      // Handle dismissing all emails from modal
      const { timestamp } = message;
      const dismissUntil = timestamp + (24 * 60 * 60 * 1000); // 24 hours
      
      chrome.storage.local.get(STORAGE_KEYS.DISMISSED_EMAILS, (result) => {
        const dismissedEmails = result[STORAGE_KEYS.DISMISSED_EMAILS] || {};
        
        // Get recent emails from history to dismiss
        chrome.storage.local.get(STORAGE_KEYS.EMAIL_HISTORY, (historyResult) => {
          const history = historyResult[STORAGE_KEYS.EMAIL_HISTORY] || [];
          const recentEmails = history.filter((entry: any) => 
            (timestamp - entry.timestamp) < 60000 // Within last minute
          );
          
          // Dismiss all recent emails
          recentEmails.forEach((entry: any) => {
            dismissedEmails[entry.email] = dismissUntil;
          });
          
          chrome.storage.local.set({
            [STORAGE_KEYS.DISMISSED_EMAILS]: dismissedEmails
          }, () => {
            console.log('All recent emails dismissed for 24 hours');
            sendResponse({ success: true });
          });
        });
      });
      return true;
      
    case MESSAGE_ACTIONS.DISMISS_EMAIL:
      // Handle dismissing individual email from modal
      const { emailId: dismissedEmailId } = message;
      const dismissUntilTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      chrome.storage.local.get(STORAGE_KEYS.DISMISSED_EMAILS, (result) => {
        const dismissedEmails = result[STORAGE_KEYS.DISMISSED_EMAILS] || {};
        dismissedEmails[dismissedEmailId] = dismissUntilTime;
        
        chrome.storage.local.set({
          [STORAGE_KEYS.DISMISSED_EMAILS]: dismissedEmails
        }, () => {
          console.log(`Email ${dismissedEmailId} dismissed for 24 hours`);
          sendResponse({ success: true });
        });
      });
      return true;
      
    default:
      console.log('Unknown action:', message.action);
  }
});

// Handle tab updates to re-inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if it's a ChatGPT page
    if (tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com')) {
      // Re-inject content script if needed
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      }).catch((error) => {
        console.log('Content script already injected or error:', error);
      });
    }
  }
});

// Clean up expired dismissals periodically
setInterval(() => {
  chrome.storage.local.get(STORAGE_KEYS.DISMISSED_EMAILS, (result) => {
    const dismissedEmails = result[STORAGE_KEYS.DISMISSED_EMAILS] || {};
    const now = Date.now();
    const updatedDismissed = { ...dismissedEmails };
    
    let hasChanges = false;
    for (const [emailId, dismissedUntil] of Object.entries(dismissedEmails)) {
      if (now > (dismissedUntil as number)) {
        delete updatedDismissed[emailId];
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      chrome.storage.local.set({
        [STORAGE_KEYS.DISMISSED_EMAILS]: updatedDismissed
      });
    }
  });
}, 60 * 60 * 1000); // Check every hour
