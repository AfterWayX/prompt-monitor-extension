/**
 * History tab component
 */

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { emailDismissed } from '../../store/slice';
import { saveDismissedEmail, clearAllStorage, loadDismissedEmails } from '../../utils/storage';
import { formatEmailForDisplay } from '../../utils/emailDetection';
import { Mail, X, Clock, Trash2, AlertTriangle } from 'lucide-react';
import './HistoryTab.css';

const HistoryTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { history } = useAppSelector(state => state.app);
  const [isClearing, setIsClearing] = useState(false);
  const [dismissedEmails, setDismissedEmails] = useState<Record<string, number>>({});

  // Load dismissed emails on component mount and listen for changes
  useEffect(() => {
    const loadDismissed = async () => {
      try {
        const dismissed = await loadDismissedEmails();
        setDismissedEmails(dismissed);
      } catch (error) {
        console.error('Failed to load dismissed emails:', error);
      }
    };
    loadDismissed();

    // Listen for storage changes to refresh dismissed emails
    const handleStorageChange = () => {
      loadDismissed();
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleDismiss = async (email: string) => {
    try {
      const dismissedUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      await saveDismissedEmail(email, dismissedUntil);
      dispatch(emailDismissed(email));

      // Update local state
      setDismissedEmails(prev => ({
        ...prev,
        [email]: dismissedUntil
      }));
    } catch (error) {
      console.error('Failed to dismiss email:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      return;
    }

    try {
      setIsClearing(true);
      await clearAllStorage();
      // Reload the page to refresh the state
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const isCurrentlyDismissed = (email: string) => {
    const dismissedUntil = dismissedEmails[email];
    if (!dismissedUntil) return false;
    return Date.now() < dismissedUntil;
  };

  const getUniqueEmails = () => {
    const uniqueEmails = new Map();
    history.forEach(issue => {
      if (!uniqueEmails.has(issue.email)) {
        uniqueEmails.set(issue.email, issue);
      }
    });
    return Array.from(uniqueEmails.values()).sort((a, b) => b.timestamp - a.timestamp);
  };

  const uniqueEmails = getUniqueEmails();

  if (history.length === 0) {
    return (
      <div className="history-tab">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Mail size={48} />
          </div>
          <h3 className="empty-state-title">No History</h3>
          <p className="empty-state-description">
            No email addresses have been detected yet. Start using ChatGPT to see detected emails here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-tab">
      <div className="tab-header">
        <div className="tab-header-content">
          <h2 className="tab-title">Detection History</h2>
          <p className="tab-description">
            {uniqueEmails.length} unique email address{uniqueEmails.length !== 1 ? 'es' : ''} detected
          </p>
        </div>
        <button
          className="btn btn-outline btn-xs"
          onClick={handleClearHistory}
          disabled={isClearing}
        >
          <Trash2 size={14} />
          {isClearing ? 'Clearing...' : 'Clear All'}
        </button>
      </div>

      <div className="history-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <AlertTriangle size={16} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{history.length}</div>
            <div className="stat-label">Total Detections</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Mail size={16} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{uniqueEmails.length}</div>
            <div className="stat-label">Unique Emails</div>
          </div>
        </div>
      </div>

      {uniqueEmails.length > 0 && (
        <div className="history-list">
          {uniqueEmails.map((issue) => {
            const isDismissed = isCurrentlyDismissed(issue.email);
            const lastDetected = history
              .filter(h => h.email === issue.email)
              .sort((a, b) => b.timestamp - a.timestamp)[0];

            return (
              <div key={issue.id} className={`history-item ${isDismissed ? 'dismissed' : ''}`}>
                <div className="history-content">
                  <div className="history-header">
                    <div className="history-icon">
                      <Mail size={16} />
                    </div>
                    <div className="history-details">
                      <div className="history-email">
                        {formatEmailForDisplay(issue.email)}
                      </div>
                      <div className="history-meta">
                        <span className="history-timestamp">
                          <Clock size={12} />
                          Last detected: {formatTimestamp(lastDetected.timestamp)}
                        </span>
                        {isDismissed && (
                          <span className="badge badge-warning">
                            Dismissed for 24h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="history-actions">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDismiss(issue.email)}
                    disabled={isDismissed}
                  >
                    <X size={14} />
                    {isDismissed ? 'Dismissed' : 'Dismiss'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="tab-footer">
        <p className="footer-note">
          <strong>Note:</strong> History shows unique email addresses detected across all sessions.
        </p>
      </div>
    </div>
  );
};

export default HistoryTab;
