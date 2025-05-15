export type NotificationType = 
  | 'rain_detected' 
  | 'clothes_retracted' 
  | 'clothes_extended' 
  | 'schedule_executed' 
  | 'device_offline' 
  | 'low_battery' 
  | 'system_error'
  | 'weather_alert';

export type NotificationSeverity = 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  severity: NotificationSeverity;
  timestamp: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}