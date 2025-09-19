/**
 * Main App component for the popup
 */

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadHistory, loadCurrentIssues, setLoading, setError } from '../store/slice';
import { loadEmailHistory, loadCurrentIssues as loadCurrentIssuesFromStorage } from '../utils/storage';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import IssuesFoundTab from './components/IssuesFoundTab';
import HistoryTab from './components/HistoryTab';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import './App.css';

type TabType = 'issues' | 'history';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentIssues, history, isLoading, error } = useAppSelector(state => state.app);
  const [activeTab, setActiveTab] = useState<TabType>('issues');

  useEffect(() => {
    loadData();
    
    // Listen for storage changes to refresh data when emails are dismissed
    const handleStorageChange = () => {
      loadData();
    };
    
    chrome.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadData = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Load both history and current issues
      const [emailHistory, currentIssues] = await Promise.all([
        loadEmailHistory(),
        loadCurrentIssuesFromStorage()
      ]);
      
      dispatch(loadHistory(emailHistory));
      dispatch(loadCurrentIssues(currentIssues));
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to load data'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="app">
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        issuesCount={currentIssues.length}
        historyCount={history.length}
      />
      
      <div className="tab-content">
        {activeTab === 'issues' ? (
          <IssuesFoundTab />
        ) : (
          <HistoryTab />
        )}
      </div>
    </div>
  );
};

export default App;
