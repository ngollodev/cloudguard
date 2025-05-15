export type DeviceStatus = 'idle' | 'retracting' | 'extending' | 'error' | 'offline';
export type MotorHealth = 'good' | 'warning' | 'critical';
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface DeviceState {
  id: string;
  name: string;
  status: DeviceStatus;
  motorHealth: MotorHealth;
  batteryLevel: number;
  isRaining: boolean;
  isExtended: boolean;
  isOnline: boolean;
  connection: ConnectionStatus;
  lastAction: {
    type: string;
    timestamp: string;
    message: string;
  };
}

export interface DeviceAction {
  type: 'extend' | 'retract';
  timestamp: string;
  triggeredBy: 'manual' | 'schedule' | 'rain_sensor' | 'app';
  status: 'success' | 'failed' | 'in_progress';
}

export interface DeviceSettings {
  id: string;
  name: string;
  rainSensitivity: number; // 1-10
  motorSpeed: number; // 1-10
  autoRetract: boolean;
  notificationsEnabled: boolean;
}