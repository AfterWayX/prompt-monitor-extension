/**
 * Tab navigation component
 */

import React from 'react';
import { AlertTriangle, History } from 'lucide-react';
import './TabNavigation.css';

interface TabNavigationProps {
  activeTab: 'issues' | 'history';
  onTabChange: (tab: 'issues' | 'history') => void;
  issuesCount: number;
  historyCount: number;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  issuesCount,
  historyCount
}) => {
  return (
    <nav className="tab-navigation">
      <button
        className={`tab-button ${activeTab === 'issues' ? 'active' : ''}`}
        onClick={() => onTabChange('issues')}
      >
        <AlertTriangle size={16} />
        <span>Issues Found</span>
        {issuesCount > 0 && (
          <span className="tab-badge">{issuesCount}</span>
        )}
      </button>
      
      <button
        className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => onTabChange('history')}
      >
        <History size={16} />
        <span>History</span>
        {historyCount > 0 && (
          <span className="tab-badge">{historyCount}</span>
        )}
      </button>
    </nav>
  );
};

export default TabNavigation;
