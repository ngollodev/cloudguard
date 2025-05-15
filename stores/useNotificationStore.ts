import { create } from 'zustand';
import { Notification, NotificationState } from '../types/notification';

interface NotificationStore extends NotificationState {
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'rain_detected',
    title: 'Rain Detected',
    message: 'Rain has been detected. Clothes are being retracted automatically.',
    isRead: false,
    severity: 'warning',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutes ago
  },
  {
    id: '2',
    type: 'clothes_retracted',
    title: 'Clothes Retracted',
    message: 'Clothes have been retracted successfully.',
    isRead: false,
    severity: 'info',
    timestamp: new Date(Date.now() - 9 * 60000).toISOString(), // 9 minutes ago
  },
  {
    id: '3',
    type: 'weather_alert',
    title: 'Heavy Rain Expected',
    message: 'Weather forecast predicts heavy rain in 2 hours.',
    isRead: true,
    severity: 'warning',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
  },
  {
    id: '4',
    type: 'schedule_executed',
    title: 'Schedule Executed',
    message: 'Evening retract schedule has been executed.',
    isRead: true,
    severity: 'info',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
  },
];

const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.isRead).length,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ 
          notifications: mockNotifications,
          unreadCount: mockNotifications.filter(n => !n.isRead).length,
          isLoading: false 
        });
      }, 500);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch notifications' });
    }
  },

  markAsRead: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        const notifications = get().notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        
        set({ 
          notifications,
          unreadCount: notifications.filter(n => !n.isRead).length,
          isLoading: false 
        });
      }, 300);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to mark notification as read' });
    }
  },

  markAllAsRead: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        const notifications = get().notifications.map(n => ({ ...n, isRead: true }));
        
        set({ 
          notifications,
          unreadCount: 0,
          isLoading: false 
        });
      }, 500);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to mark all notifications as read' });
    }
  },

  deleteNotification: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        const notifications = get().notifications.filter(n => n.id !== id);
        
        set({ 
          notifications,
          unreadCount: notifications.filter(n => !n.isRead).length,
          isLoading: false 
        });
      }, 500);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to delete notification' });
    }
  },

  clearAllNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ 
          notifications: [],
          unreadCount: 0,
          isLoading: false 
        });
      }, 500);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to clear all notifications' });
    }
  },
}));

export default useNotificationStore;