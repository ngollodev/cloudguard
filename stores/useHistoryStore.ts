import { create } from 'zustand';
import { LogEntry, HistoryState } from '../types/history';

interface HistoryStore extends HistoryState {
  fetchLogs: () => Promise<void>;
  clearLogs: () => Promise<void>;
}

// Mock logs
const mockLogs: LogEntry[] = [
  {
    id: '1',
    type: 'action',
    title: 'Clothes Extended',
    description: 'Clothes extended manually by user',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
  },
  {
    id: '2',
    type: 'weather',
    title: 'Rain Detected',
    description: 'Rain sensor detected rainfall',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    type: 'action',
    title: 'Clothes Retracted',
    description: 'Clothes retracted automatically due to rain',
    timestamp: new Date(Date.now() - 2 * 3600000 + 2 * 60000).toISOString(), // 2 hours ago + 2 minutes
  },
  {
    id: '4',
    type: 'system',
    title: 'System Online',
    description: 'System came online after being offline',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
  },
  {
    id: '5',
    type: 'action',
    title: 'Schedule Executed',
    description: 'Evening retract schedule executed',
    timestamp: new Date(Date.now() - 1 * 86400000 - 5 * 3600000).toISOString(), // 1 day + 5 hours ago
  },
  {
    id: '6',
    type: 'error',
    title: 'Connection Lost',
    description: 'Connection to device was temporarily lost',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
  },
];

const useHistoryStore = create<HistoryStore>((set) => ({
  logs: mockLogs,
  isLoading: false,
  error: null,

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ logs: mockLogs, isLoading: false });
      }, 1000);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch logs' });
    }
  },

  clearLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ logs: [], isLoading: false });
      }, 1000);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to clear logs' });
    }
  },
}));

export default useHistoryStore;