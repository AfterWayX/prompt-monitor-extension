/**
 * Content script for the Prompt Monitor Extension
 * This script runs on ChatGPT pages to detect email addresses and prompts
 */

import { EMAIL_REGEX, CHATGPT_SELECTORS, MESSAGE_ACTIONS, STORAGE_KEYS } from '../utils/constants';
import { detectEmails, detectEmailsWithContext } from '../utils/emailDetection';

// Function to get the current prompt from ChatGPT interface
function getCurrentPrompt(): string {
  // Look for ChatGPT's textarea or input field with various selectors
  for (const selector of CHATGPT_SELECTORS.TEXTAREA) {
    const element = document.querySelector(selector) as HTMLTextAreaElement | HTMLDivElement;
    if (element) {
      const value = (element as HTMLTextAreaElement).value || element.textContent || '';
      if (value.trim()) {
        return value.trim();
      }
    }
  }
  
  // Look for the last user message in the chat
  for (const selector of CHATGPT_SELECTORS.USER_MESSAGES) {
    const messages = document.querySelectorAll(selector);
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const messageText = lastMessage.textContent || '';
      if (messageText.trim()) {
        return messageText.trim();
      }
    }
  }
  
  return '';
}

// Function to scan the page for emails and get current prompt
function scanPageForEmailsAndPrompt(): { emails: string[], prompt: string } {
  const prompt = getCurrentPrompt();
  
  // Use enhanced detection on the prompt text specifically
  const emailResult = detectEmailsWithContext(prompt);
  const emails = emailResult.emails;
  
  console.log('Email detection result:', {
    prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
    emails,
    hasMultipleEmails: emailResult.hasMultipleEmails,
    hasConcatenatedEmails: emailResult.hasConcatenatedEmails
  });
  
  return { emails, prompt };
}

// Store the pending send action
let pendingSendAction: {
  element: Element;
  event: Event;
} | null = null;

// Flag to prevent re-detection when continuing
let isContinuingSend = false;

// Store the flag in window to persist across script instances
(window as any).isContinuingSend = false;

// Function to send detected emails and prompt to background script
function reportEmailsAndPrompt(emails: string[], prompt: string) {
  if (emails.length > 0 || prompt.length > 0) {
    console.log('Reporting emails:', emails, 'prompt:', prompt);
    chrome.runtime.sendMessage({
      action: MESSAGE_ACTIONS.EMAILS_DETECTED,
      emails: emails,
      prompt: prompt
    });
  }
}

// Function to continue the send action
function continueSendAction() {
  console.log('🔄 Continuing send action...');
  
  // Set flag to prevent re-detection - both local and window
  isContinuingSend = true;
  (window as any).isContinuingSend = true;
  console.log('🔄 isContinuingSend set to (local):', isContinuingSend);
  console.log('🔄 isContinuingSend set to (window):', (window as any).isContinuingSend);
  
  // Wait a moment for the modal to close
  setTimeout(() => {
    console.log('🔄 Re-triggering send action...');
    console.log('🔄 isContinuingSend is still (local):', isContinuingSend);
    console.log('🔄 isContinuingSend is still (window):', (window as any).isContinuingSend);
    
    // Find the ChatGPT send button
    const sendButton = document.querySelector('[data-testid="send-button"]') || 
                      document.querySelector('#composer-submit-button') ||
                      document.querySelector('button[aria-label="Send prompt"]');
    
    if (sendButton) {
      console.log('🔄 Found ChatGPT send button, clicking...');
      
      // Simply click the button - our event listener will skip detection due to isContinuingSend flag
      (sendButton as any).click();
      
      // Reset flag after a longer delay to ensure the send completes
      setTimeout(() => {
        isContinuingSend = false;
        (window as any).isContinuingSend = false;
        console.log('✅ Continue action completed, isContinuingSend reset to (local):', isContinuingSend);
        console.log('✅ Continue action completed, isContinuingSend reset to (window):', (window as any).isContinuingSend);
      }, 3000); // Increased delay
    } else {
      console.error('❌ Could not find ChatGPT send button');
      isContinuingSend = false;
      (window as any).isContinuingSend = false;
    }
  }, 500); // Increased delay to ensure modal is fully closed
}

// Function to clear pending send action
function clearPendingSendAction() {
  console.log('Clearing pending send action');
  pendingSendAction = null;
  isContinuingSend = false;
  (window as any).isContinuingSend = false;
}


// Function to check if emails should be blocked (not dismissed)
async function checkIfShouldBlockEmails(emails: string[]): Promise<boolean> {
  try {
    console.log('🔍 Checking if emails should be blocked:', emails);
    
    // Get dismissed emails from storage
    const result = await chrome.storage.local.get(STORAGE_KEYS.DISMISSED_EMAILS);
    const dismissedEmails = result[STORAGE_KEYS.DISMISSED_EMAILS] || {};
    const now = Date.now();
    
    console.log('📋 Dismissed emails from storage:', dismissedEmails);
    console.log('⏰ Current time:', now, new Date(now));
    
    // Check if any email is not dismissed or dismissal has expired
    for (const email of emails) {
      const dismissedUntil = dismissedEmails[email];
      console.log(`🔍 Checking email: ${email}`);
      console.log(`🔍 Dismissed until: ${dismissedUntil}`);
      console.log(`🔍 Is dismissed: ${!!dismissedUntil}`);
      console.log(`🔍 Has expired: ${dismissedUntil ? now > dismissedUntil : 'N/A'}`);
      
      if (!dismissedUntil || now > dismissedUntil) {
        console.log(`❌ Email ${email} is not dismissed or expired, should block`);
        return true; // Should block if any email is not dismissed
      } else {
        console.log(`✅ Email ${email} is dismissed until ${new Date(dismissedUntil)}`);
      }
    }
    
    console.log('✅ All emails are dismissed, should not block');
    return false; // Should not block if all emails are dismissed
  } catch (error) {
    console.error('❌ Error checking dismissed emails:', error);
    return true; // Default to blocking if there's an error
  }
}

// Export functions to window for modal access
(window as any).continueSendAction = continueSendAction;
(window as any).clearPendingSendAction = clearPendingSendAction;

// Initial scan when the page loads (but don't show modal)
function initialScan() {
  // Just report emails to background for history, don't show modal
  const { emails, prompt } = scanPageForEmailsAndPrompt();
  if (emails.length > 0 || prompt.length > 0) {
    reportEmailsAndPrompt(emails, prompt);
  }
}

// Monitor for dynamic content changes (only for history, no modal)
const observer = new MutationObserver((mutations) => {
  let hasNewContent = false;
  
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Check if new nodes contain text content
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.textContent && element.textContent.trim().length > 0) {
            hasNewContent = true;
          }
        }
      });
    }
  });
  
  if (hasNewContent) {
    console.log('New content detected, scanning for emails and prompts...');
    // Only report to background for history, NEVER show modal
    setTimeout(() => {
      const { emails, prompt } = scanPageForEmailsAndPrompt();
      if (emails.length > 0 || prompt.length > 0) {
        console.log('Reporting emails to background for history only');
        reportEmailsAndPrompt(emails, prompt);
      }
    }, 2000);
  }
});


// Add event listeners for button clicks, Enter key, and form submissions
function addEventListeners() {
  console.log('🔧 Setting up event listeners...');
  
  // Listen for Enter key in text inputs
  document.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log('⌨️ Enter key pressed!');
      
      // Check if we're in a ChatGPT input field
      const target = event.target as Element;
      const isInInput = target.closest('textarea') || target.closest('input[type="text"]') || 
                       target.closest('[contenteditable="true"]') || target.closest('.composer-input');
      
        if (isInInput) {
          console.log('⌨️ Enter pressed in input field, checking for emails...');
          
          // Skip if we're continuing
          const windowFlag = (window as any).isContinuingSend;
          console.log('🔍 Checking isContinuingSend flag (local):', isContinuingSend);
          console.log('🔍 Checking isContinuingSend flag (window):', windowFlag);
          
          if (isContinuingSend || windowFlag) {
            console.log('✅ Continuing send action, allowing Enter...');
            return;
          }
          
          console.log('🛑 PREVENTING DEFAULT ACTION...');
          
          // ALWAYS prevent the default action first
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          
          console.log('✅ Default action prevented');
          console.log('🔍 Checking for emails...');
          
          // Check for emails
          const { emails, prompt } = scanPageForEmailsAndPrompt();
          console.log('📧 Detected emails:', emails);
          console.log('📝 Detected prompt:', prompt);
          
          if (emails.length > 0) {
            console.log('📧 Emails found, checking if should block...');
            const shouldBlock = await checkIfShouldBlockEmails(emails);
            console.log('🚫 Should block?', shouldBlock);
            
            if (shouldBlock) {
              console.log('🚫 EMAILS FOUND - SHOWING MODAL');
              
              // Show modal
              if ((window as any).emailAlertModal) {
                console.log('✅ Modal found, showing...');
                (window as any).emailAlertModal.show(emails, prompt);
                console.log('✅ Modal show called');
              } else {
                console.error('❌ Modal not found!');
              }
              
              // Report to background script
              reportEmailsAndPrompt(emails, prompt);
              
              return false;
            } else {
              console.log('✅ Emails are dismissed, proceeding with send...');
            }
          }
          
          // No emails or dismissed - proceed with send
          console.log('✅ No emails or dismissed, proceeding with send...');
          
          // Set flag to prevent re-detection during programmatic click
          isContinuingSend = true;
          (window as any).isContinuingSend = true;
          console.log('🔄 Setting isContinuingSend flag for programmatic click');
          
          // Find the send button and click it programmatically
          const sendButton = document.querySelector('[data-testid="send-button"]') || 
                            document.querySelector('#composer-submit-button') ||
                            document.querySelector('button[aria-label="Send prompt"]');
          
          if (sendButton) {
            console.log('🔄 Triggering send programmatically...');
            console.log('🔄 Send button found:', sendButton);
            (sendButton as any).click();
            console.log('✅ Programmatic click executed');
            
            // Reset flag after a delay
            setTimeout(() => {
              isContinuingSend = false;
              (window as any).isContinuingSend = false;
              console.log('✅ Programmatic click completed, isContinuingSend reset');
            }, 2000);
          } else {
            console.error('❌ Could not find send button for programmatic click');
            // Reset flag if button not found
            isContinuingSend = false;
            (window as any).isContinuingSend = false;
          }
          
          return false;
        }
    }
  }, true);
  
  // Listen for form submissions
  document.addEventListener('submit', async (event) => {
    console.log('📝 Form submit detected');
    
    // Skip if we're continuing
    const windowFlag = (window as any).isContinuingSend;
    if (isContinuingSend || windowFlag) {
      console.log('✅ Continuing send action, allowing form submit...');
      return;
    }
    
    console.log('🛑 PREVENTING FORM SUBMISSION...');
    
    // ALWAYS prevent the form submission first
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    console.log('✅ Form submission prevented');
    console.log('🔍 Checking for emails...');
    
    // Check for emails
    const { emails, prompt } = scanPageForEmailsAndPrompt();
    console.log('📧 Detected emails:', emails);
    console.log('📝 Detected prompt:', prompt);
    
    if (emails.length > 0) {
      console.log('📧 Emails found, checking if should block...');
      const shouldBlock = await checkIfShouldBlockEmails(emails);
      console.log('🚫 Should block?', shouldBlock);
      
      if (shouldBlock) {
        console.log('🚫 EMAILS FOUND - SHOWING MODAL');
        
        // Show modal
        if ((window as any).emailAlertModal) {
          console.log('✅ Modal found, showing...');
          (window as any).emailAlertModal.show(emails, prompt);
          console.log('✅ Modal show called');
        } else {
          console.error('❌ Modal not found!');
        }
        
        // Report to background script
        reportEmailsAndPrompt(emails, prompt);
        
        return false;
      } else {
        console.log('✅ Emails are dismissed, proceeding with send...');
      }
    }
    
    // No emails or dismissed - proceed with send
    console.log('✅ No emails or dismissed, proceeding with send...');
    
    // Find the send button and click it programmatically
    const sendButton = document.querySelector('[data-testid="send-button"]') || 
                      document.querySelector('#composer-submit-button') ||
                      document.querySelector('button[aria-label="Send prompt"]');
    
    if (sendButton) {
      console.log('🔄 Triggering send programmatically...');
      console.log('🔄 Send button found:', sendButton);
      (sendButton as any).click();
      console.log('✅ Programmatic click executed');
    } else {
      console.error('❌ Could not find send button for programmatic click');
    }
    
    return false;
  }, true);
  
  // Listen for any click on the page
  document.addEventListener('click', async (event) => {
    const target = event.target as Element;
    
    console.log('🖱️ Click detected on:', target);
    console.log('🖱️ Target tagName:', target.tagName);
    console.log('🖱️ Target className:', target.className);
    console.log('🖱️ Target id:', target.id);
    console.log('🖱️ Target data-testid:', target.getAttribute('data-testid'));
    
    // Check if this is the send button or inside the send button
    const isSendButton = target.closest('[data-testid="send-button"]') || 
                        target.closest('#composer-submit-button') ||
                        target.closest('button[aria-label="Send prompt"]');
    
    console.log('🔍 Is send button?', !!isSendButton);
    
        if (isSendButton) {
          console.log('🎯 SEND BUTTON CLICKED!', target);
          console.log('🎯 Send button element:', isSendButton);
          
          // Skip if we're continuing - check both local and window flag
          const windowFlag = (window as any).isContinuingSend;
          console.log('🔍 Checking isContinuingSend flag (local):', isContinuingSend);
          console.log('🔍 Checking isContinuingSend flag (window):', windowFlag);
          
          if (isContinuingSend || windowFlag) {
            console.log('✅ Continuing send action, allowing...');
            console.log('✅ Skipping email detection due to continue flag');
            return;
          }
          
          console.log('🛑 PREVENTING DEFAULT ACTION...');
          
          // ALWAYS prevent the default action first
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          
          console.log('✅ Default action prevented');
          console.log('🔍 Checking for emails...');
          
          // Check for emails
          const { emails, prompt } = scanPageForEmailsAndPrompt();
          console.log('📧 Detected emails:', emails);
          console.log('📝 Detected prompt:', prompt);
          
          if (emails.length > 0) {
            console.log('📧 Emails found, checking if should block...');
            const shouldBlock = await checkIfShouldBlockEmails(emails);
            console.log('🚫 Should block?', shouldBlock);
            
            if (shouldBlock) {
              console.log('🚫 EMAILS FOUND - SHOWING MODAL');
              
              // Show modal
              if ((window as any).emailAlertModal) {
                console.log('✅ Modal found, showing...');
                (window as any).emailAlertModal.show(emails, prompt);
                console.log('✅ Modal show called');
              } else {
                console.error('❌ Modal not found!');
                console.log('❌ Available on window:', Object.keys(window).filter(k => k.includes('modal')));
              }
              
              // Report to background script
              reportEmailsAndPrompt(emails, prompt);
              
              return false;
            } else {
              console.log('✅ Emails are dismissed, proceeding with send...');
            }
          }
          
          // No emails or dismissed - proceed with send
          console.log('✅ No emails or dismissed, proceeding with send...');
          
          // Set flag to prevent re-detection during programmatic click
          isContinuingSend = true;
          (window as any).isContinuingSend = true;
          console.log('🔄 Setting isContinuingSend flag for programmatic click');
          
          // Find the send button and click it programmatically
          const sendButton = document.querySelector('[data-testid="send-button"]') || 
                            document.querySelector('#composer-submit-button') ||
                            document.querySelector('button[aria-label="Send prompt"]');
          
          if (sendButton) {
            console.log('🔄 Triggering send programmatically...');
            console.log('🔄 Send button found:', sendButton);
            (sendButton as any).click();
            console.log('✅ Programmatic click executed');
            
            // Reset flag after a delay
            setTimeout(() => {
              isContinuingSend = false;
              (window as any).isContinuingSend = false;
              console.log('✅ Programmatic click completed, isContinuingSend reset');
            }, 2000);
          } else {
            console.error('❌ Could not find send button for programmatic click');
            // Reset flag if button not found
            isContinuingSend = false;
            (window as any).isContinuingSend = false;
          }
          
          return false;
        } else {
      console.log('ℹ️ Not a send button click, ignoring...');
    }
  }, true); // Use capture phase to run first
  
  console.log('✅ Event listeners set up');
}


// Start observing when the page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('ChatGPT page loaded, initializing prompt monitor...');
    initialScan();
    addEventListeners();
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
} else {
  console.log('ChatGPT page already loaded, initializing prompt monitor...');
  initialScan();
  addEventListeners();
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Export functions to window for modal access
(window as any).continueSendAction = continueSendAction;
(window as any).clearPendingSendAction = clearPendingSendAction;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === MESSAGE_ACTIONS.SCAN_PAGE) {
    const { emails, prompt } = scanPageForEmailsAndPrompt();
    sendResponse({ emails, prompt });
  }
});
