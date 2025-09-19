/**
 * Issues Found tab component
 */

import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { clearCurrentIssues, emailDismissed } from '../../store/slice';
import { saveDismissedEmail } from '../../utils/storage';
import { formatEmailForDisplay } from '../../utils/emailDetection';
import { Mail, X, Clock } from 'lucide-react';
import './IssuesFoundTab.css';

const IssuesFoundTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentIssues } = useAppSelector(state => state.app);

  const handleDismiss = async (issueId: string) => {
    try {
      const dismissedUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      await saveDismissedEmail(issueId, dismissedUntil);
      dispatch(emailDismissed(issueId));
    } catch (error) {
      console.error('Failed to dismiss email:', error);
    }
  };

  const handleClearAll = () => {
    dispatch(clearCurrentIssues());
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (currentIssues.length === 0) {
    return (
      <div className="issues-tab">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Mail size={48} />
          </div>
          <h3 className="empty-state-title">No Issues Found</h3>
          <p className="empty-state-description">
            No email addresses have been detected in your recent prompts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="issues-tab">
      <div className="tab-header">
        <div className="tab-header-content">
          <h2 className="tab-title">Detected Email Addresses</h2>
          <p className="tab-description">
            {currentIssues.length} email address{currentIssues.length !== 1 ? 'es' : ''} found in your prompt
          </p>
        </div>
        <button 
          className="btn btn-outline btn-sm"
          onClick={handleClearAll}
        >
          <X size={14} />
          Clear All
        </button>
      </div>

      <div className="issues-list">
        {currentIssues.map((issue) => (
          <div key={issue.id} className="issue-card">
            <div className="issue-content">
              <div className="issue-header">
                <div className="issue-icon">
                  <Mail size={16} />
                </div>
                <div className="issue-details">
                  <div className="issue-email">
                    {formatEmailForDisplay(issue.email)}
                  </div>
                  <div className="issue-timestamp">
                    <Clock size={12} />
                    {formatTimestamp(issue.timestamp)}
                  </div>
                </div>
              </div>
              
              {issue.dismissed && (
                <div className="issue-status">
                  <span className="badge badge-warning">
                    Dismissed for 24h
                  </span>
                </div>
              )}
            </div>
            
            <div className="issue-actions">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDismiss(issue.id)}
                disabled={issue.dismissed}
              >
                <X size={14} />
                {issue.dismissed ? 'Dismissed' : 'Dismiss'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="tab-footer">
        <p className="footer-note">
          <strong>Note:</strong> Dismissed emails won't trigger alerts for 24 hours.
        </p>
      </div>
    </div>
  );
};

export default IssuesFoundTab;
