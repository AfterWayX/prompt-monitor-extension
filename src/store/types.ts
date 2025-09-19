/**
 * Type definitions for the Prompt Monitor Extension
 */

export interface EmailIssue {
  id: string;
  email: string;
  timestamp: number;
  dismissed?: boolean;
  dismissedUntil?: number;
}

export interface AppState {
  currentIssues: EmailIssue[];
  history: EmailIssue[];
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  app: AppState;
}

// Action types
export const EMAIL_DETECTED = 'EMAIL_DETECTED';
export const EMAIL_DISMISSED = 'EMAIL_DISMISSED';
export const LOAD_HISTORY = 'LOAD_HISTORY';
export const CLEAR_CURRENT_ISSUES = 'CLEAR_CURRENT_ISSUES';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';

export interface EmailDetectedAction {
  type: typeof EMAIL_DETECTED;
  payload: EmailIssue[];
}

export interface EmailDismissedAction {
  type: typeof EMAIL_DISMISSED;
  payload: string; // email ID
}

export interface LoadHistoryAction {
  type: typeof LOAD_HISTORY;
  payload: EmailIssue[];
}

export interface ClearCurrentIssuesAction {
  type: typeof CLEAR_CURRENT_ISSUES;
}

export interface SetLoadingAction {
  type: typeof SET_LOADING;
  payload: boolean;
}

export interface SetErrorAction {
  type: typeof SET_ERROR;
  payload: string | null;
}

export type AppAction = 
  | EmailDetectedAction
  | EmailDismissedAction
  | LoadHistoryAction
  | ClearCurrentIssuesAction
  | SetLoadingAction
  | SetErrorAction;
