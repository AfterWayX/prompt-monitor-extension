/**
 * Modal injection for ChatGPT pages
 * Creates and manages the alert modal that appears when emails are detected
 */

import { MESSAGE_ACTIONS } from '../utils/constants';

interface EmailDetection {
  emails: string[];
  prompt: string;
  timestamp: number;
}

class EmailAlertModal {
  private modal: HTMLElement | null = null;
  private isVisible = false;

  constructor() {
    this.createModal();
    this.setupEventListeners();
  }

  private createModal(): void {
    // Create modal HTML
    const modalHTML = `
      <div id="email-alert-modal" class="email-alert-modal-backdrop" style="display: none;">
        <div class="email-alert-modal">
          <div class="email-alert-modal-header">
            <div class="email-alert-modal-title">
              <svg class="alert-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
              <span>Email Addresses Detected</span>
            </div>
            <button class="email-alert-modal-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="email-alert-modal-content">
            <div class="alert-warning">
              <p><strong>Warning:</strong> Your prompt contains email addresses that will be sent to ChatGPT. Consider removing sensitive information before submitting.</p>
            </div>
            
            <div class="alert-section">
              <h3 class="alert-section-title">
                <svg class="section-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Detected Email Addresses (<span id="email-count">0</span>)
              </h3>
              <div id="email-list" class="email-list"></div>
            </div>
            
            <div class="alert-section">
              <h3 class="alert-section-title">
                <svg class="section-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                Your Prompt
              </h3>
              <div class="prompt-preview">
                <p id="prompt-text"></p>
              </div>
            </div>
          </div>
          
          <div class="email-alert-modal-footer">
            <button class="btn btn-outline" id="continue-btn">Continue Anyway</button>
            <button class="btn btn-primary" id="dismiss-all-btn">Dismiss All Emails</button>
          </div>
        </div>
      </div>
    `;

    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      .email-alert-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .email-alert-modal {
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .email-alert-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px 16px;
        border-bottom: 1px solid #e5e7eb;
        background: #fef2f2;
      }
      
      .email-alert-modal-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 18px;
        font-weight: 600;
        color: #dc2626;
      }
      
      .alert-icon {
        color: #dc2626;
      }
      
      .email-alert-modal-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        color: #6b7280;
        transition: all 0.2s ease;
      }
      
      .email-alert-modal-close:hover {
        background: #f3f4f6;
        color: #374151;
      }
      
      .email-alert-modal-content {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      }
      
      .alert-warning {
        background: #fef3c7;
        border: 1px solid #fbbf24;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
      }
      
      .alert-warning p {
        margin: 0;
        color: #92400e;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .alert-section {
        margin-bottom: 24px;
      }
      
      .alert-section:last-child {
        margin-bottom: 0;
      }
      
      .alert-section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 12px 0;
      }
      
      .section-icon {
        color: #6b7280;
      }
      
      .email-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .email-item {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      
      .email-address {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        color: #dc2626;
        word-break: break-all;
        flex: 1;
      }
      
      .dismiss-email-btn {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 4px;
        padding: 4px;
        cursor: pointer;
        color: #dc2626;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 24px;
      }
      
      .dismiss-email-btn:hover {
        background: #fee2e2;
        border-color: #fca5a5;
        color: #b91c1c;
      }
      
      .prompt-preview {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 12px;
        max-height: 120px;
        overflow-y: auto;
      }
      
      .prompt-preview p {
        margin: 0;
        font-size: 14px;
        color: #374151;
        line-height: 1.5;
        white-space: pre-wrap;
      }
      
      .email-alert-modal-footer {
        display: flex;
        gap: 12px;
        padding: 20px 24px;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }
      
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        gap: 6px;
        flex: 1;
      }
      
      .btn-outline {
        background: transparent;
        color: #6b7280;
        border: 1px solid #d1d5db;
      }
      
      .btn-outline:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }
      
      .btn-primary {
        background: #dc2626;
        color: white;
      }
      
      .btn-primary:hover {
        background: #b91c1c;
      }
    `;

    // Inject into page
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    this.modal = document.getElementById('email-alert-modal');
  }

  private setupEventListeners(): void {
    if (!this.modal) return;

    // Close button
    const closeBtn = this.modal.querySelector('.email-alert-modal-close');
    closeBtn?.addEventListener('click', () => {
      console.log('Close button clicked');
      this.hide();
      
      // Clear pending action when closing
      if ((window as any).clearPendingSendAction) {
        (window as any).clearPendingSendAction();
      }
    });

    // Continue button
    const continueBtn = this.modal.querySelector('#continue-btn');
    continueBtn?.addEventListener('click', () => {
      console.log('🟢 CONTINUE ANYWAY button clicked - NOT dismissing emails');
      this.hide();
      
      // Continue the send action
      if ((window as any).continueSendAction) {
        (window as any).continueSendAction();
      }
    });

    // Dismiss all button
    const dismissBtn = this.modal.querySelector('#dismiss-all-btn');
    dismissBtn?.addEventListener('click', () => {
      console.log('🔴 DISMISS ALL button clicked - dismissing all emails');
      this.dismissAll();
    });

    // Backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        console.log('Backdrop clicked');
        this.hide();
        
        // Clear pending action when closing
        if ((window as any).clearPendingSendAction) {
          (window as any).clearPendingSendAction();
        }
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  public show(emails: string[], prompt: string): void {
    console.log('🎭 Modal.show() called with:', { emails, prompt });
    console.log('🎭 Modal element exists?', !!this.modal);
    console.log('🎭 Modal element:', this.modal);
    
    if (!this.modal) {
      console.error('❌ Modal element not found!');
      console.error('❌ Available elements with id email-alert-modal:', document.getElementById('email-alert-modal'));
      return;
    }

    console.log('Modal element found, updating content...');

    // Update content
    const emailCount = this.modal.querySelector('#email-count');
    const emailList = this.modal.querySelector('#email-list');
    const promptText = this.modal.querySelector('#prompt-text');

    if (emailCount) {
      emailCount.textContent = emails.length.toString();
      console.log('Updated email count:', emails.length);
    }
    
    if (emailList) {
      emailList.innerHTML = emails.map(email => 
        `<div class="email-item">
          <code class="email-address">${email}</code>
          <button class="dismiss-email-btn" data-email="${email}" title="Dismiss this email for 24 hours">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>`
      ).join('');
      console.log('Updated email list with', emails.length, 'emails');
      
      // Add event listeners for individual dismiss buttons
      emailList.querySelectorAll('.dismiss-email-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const email = (e.target as Element).closest('.dismiss-email-btn')?.getAttribute('data-email');
          if (email) {
            this.dismissEmail(email);
          }
        });
      });
    }

    if (promptText) {
      const formattedPrompt = prompt.length > 200 ? prompt.substring(0, 200) + '...' : prompt;
      promptText.textContent = formattedPrompt;
      console.log('Updated prompt text');
    }

    // Show modal
    console.log('Showing modal...');
    this.modal.style.display = 'flex';
    this.isVisible = true;
    document.body.style.overflow = 'hidden';
    console.log('Modal should now be visible');
  }

  public hide(): void {
    if (!this.modal) return;
    
    this.modal.style.display = 'none';
    this.isVisible = false;
    document.body.style.overflow = '';
  }

  private dismissEmail(email: string): void {
    console.log('Dismiss email button clicked for:', email);
    
    // Send message to background script to dismiss this email
    chrome.runtime.sendMessage({
      action: MESSAGE_ACTIONS.DISMISS_EMAIL,
      emailId: email
    });
    
    // Remove the email from the list
    const emailList = this.modal?.querySelector('#email-list');
    if (emailList) {
      const emailItem = emailList.querySelector(`[data-email="${email}"]`)?.closest('.email-item');
      if (emailItem) {
        emailItem.remove();
        
        // Update email count
        const emailCount = this.modal?.querySelector('#email-count');
        if (emailCount) {
          const remainingEmails = emailList.querySelectorAll('.email-item').length;
          emailCount.textContent = remainingEmails.toString();
        }
        
        // If no emails left, hide modal and trigger send
        if (emailList.querySelectorAll('.email-item').length === 0) {
          console.log('All emails dismissed, triggering send action...');
          this.hide();
          
          // Trigger the send action since all emails are dismissed
          if ((window as any).continueSendAction) {
            (window as any).continueSendAction();
          }
        }
      }
    }
  }

  private dismissAll(): void {
    console.log('🔴 DISMISS ALL function called - dismissing all emails for 24 hours');
    
    // Send message to background script to dismiss all emails
    chrome.runtime.sendMessage({
      action: MESSAGE_ACTIONS.DISMISS_ALL_EMAILS,
      timestamp: Date.now()
    });
    
    this.hide();
    
    // Trigger the send action since all emails are dismissed
    if ((window as any).continueSendAction) {
      (window as any).continueSendAction();
    }
  }
}

// Initialize modal
console.log('🔧 Initializing email alert modal...');
const emailModal = new EmailAlertModal();

// Export for use in content script
(window as any).emailAlertModal = emailModal;
console.log('✅ Modal initialized and attached to window:', !!emailModal);
console.log('✅ Modal object:', emailModal);
console.log('✅ Window keys:', Object.keys(window).filter(k => k.includes('modal')));
