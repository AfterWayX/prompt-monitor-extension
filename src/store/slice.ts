import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, EmailIssue } from './types';

const initialState: AppState = {
  currentIssues: [],
  history: [],
  isLoading: false,
  error: null
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    emailDetected: (state, action: PayloadAction<EmailIssue[]>) => {
      state.currentIssues = action.payload;
      // Add to history if not already present
      action.payload.forEach(issue => {
        const exists = state.history.some(h => h.email === issue.email);
        if (!exists) {
          state.history.unshift(issue);
        }
      });
    },
    emailDismissed: (state, action: PayloadAction<string>) => {
      const issueId = action.payload;
      const dismissUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      // Update current issues
      state.currentIssues = state.currentIssues.map(issue => 
        issue.id === issueId 
          ? { ...issue, dismissed: true, dismissedUntil: dismissUntil }
          : issue
      );
      
      // Update history
      state.history = state.history.map(issue => 
        issue.id === issueId 
          ? { ...issue, dismissed: true, dismissedUntil: dismissUntil }
          : issue
      );
    },
    loadHistory: (state, action: PayloadAction<EmailIssue[]>) => {
      state.history = action.payload;
    },
    loadCurrentIssues: (state, action: PayloadAction<EmailIssue[]>) => {
      state.currentIssues = action.payload;
    },
    clearCurrentIssues: (state) => {
      state.currentIssues = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  emailDetected,
  emailDismissed,
  loadHistory,
  loadCurrentIssues,
  clearCurrentIssues,
  setLoading,
  setError
} = appSlice.actions;

export default appSlice.reducer;
