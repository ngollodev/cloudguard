export type LogType = 'action' | 'system' | 'error' | 'weather';

export interface LogEntry {
  id: string;
  type: LogType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface HistoryState {
  logs: LogEntry[];
  isLoading: boolean;
  error: string | null;
}