/**
 * Alert Modal Component
 * Displays immediately when email addresses are detected in a prompt
 */

import React from 'react';
import { AlertTriangle, X, Mail, Clock } from 'lucide-react';
import './AlertModal.css';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: string[];
  prompt: string;
  onDismissAll: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  emails,
  prompt,
  onDismissAll
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatPrompt = (text: string) => {
    if (text.length > 200) {
      return text.substring(0, 200) + '...';
    }
    return text;
  };

  return (
    <div className="alert-modal-backdrop" onClick={handleBackdropClick}>
      <div className="alert-modal">
        <div className="alert-modal-header">
          <div className="alert-modal-title">
            <AlertTriangle className="alert-icon" />
            <span>Email Addresses Detected</span>
          </div>
          <button className="alert-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="alert-modal-content">
          <div className="alert-warning">
            <p>
              <strong>Warning:</strong> Your prompt contains email addresses that will be sent to ChatGPT.
              Consider removing sensitive information before submitting.
            </p>
          </div>

          <div className="alert-section">
            <h3 className="alert-section-title">
              <Mail className="section-icon" />
              Detected Email Addresses ({emails.length})
            </h3>
            <div className="email-list">
              {emails.map((email, index) => (
                <div key={index} className="email-item">
                  <code className="email-address">{email}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="alert-section">
            <h3 className="alert-section-title">
              <Clock className="section-icon" />
              Your Prompt
            </h3>
            <div className="prompt-preview">
              <p>{formatPrompt(prompt)}</p>
            </div>
          </div>
        </div>

        <div className="alert-modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Continue Anyway
          </button>
          <button className="btn btn-primary" onClick={onDismissAll}>
            Dismiss All Emails
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
