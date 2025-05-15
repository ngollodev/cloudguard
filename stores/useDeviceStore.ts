import { create } from 'zustand';
import { DeviceState, DeviceSettings } from '../types/device';

interface DeviceStore {
  device: DeviceState | null;
  settings: DeviceSettings | null;
  isLoading: boolean;
  error: string | null;
  
  fetchDeviceStatus: () => Promise<void>;
  fetchDeviceSettings: () => Promise<void>;
  updateDeviceSettings: (settings: Partial<DeviceSettings>) => Promise<void>;
  controlDevice: (action: 'extend' | 'retract') => Promise<void>;
  renameDevice: (name: string) => Promise<void>;
  factoryReset: () => Promise<void>;
  testMotor: () => Promise<void>;
}

// Mock initial device state
const mockDeviceState: DeviceState = {
  id: 'device-001',
  name: 'Home Clothesline',
  status: 'idle',
  motorHealth: 'good',
  batteryLevel: 85,
  isRaining: false,
  isExtended: true,
  isOnline: true,
  connection: 'connected',
  lastAction: {
    type: 'extend',
    timestamp: new Date().toISOString(),
    message: 'Clothes extended manually',
  },
};

const mockDeviceSettings: DeviceSettings = {
  id: 'device-001',
  name: 'Home Clothesline',
  rainSensitivity: 7,
  motorSpeed: 5,
  autoRetract: true,
  notificationsEnabled: true,
};

// Create store
const useDeviceStore = create<DeviceStore>((set, get) => ({
  device: mockDeviceState,
  settings: mockDeviceSettings,
  isLoading: false,
  error: null,

  fetchDeviceStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ 
          device: {
            ...mockDeviceState,
            lastAction: {
              ...mockDeviceState.lastAction,
              timestamp: new Date().toISOString(),
            },
          }, 
          isLoading: false 
        });
      }, 500);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch device status' });
    }
  },

  fetchDeviceSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ settings: mockDeviceSettings, isLoading: false });
      }, 500);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch device settings' });
    }
  },

  updateDeviceSettings: async (settings) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ 
          settings: { ...get().settings, ...settings } as DeviceSettings, 
          isLoading: false 
        });
      }, 1000);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to update device settings' });
    }
  },

  controlDevice: async (action) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call for controlling the device
      setTimeout(() => {
        const newState = { ...get().device } as DeviceState;
        
        if (action === 'extend') {
          newState.isExtended = true;
          newState.status = 'idle';
          newState.lastAction = {
            type: 'extend',
            timestamp: new Date().toISOString(),
            message: 'Clothes extended manually',
          };
        } else {
          newState.isExtended = false;
          newState.status = 'idle';
          newState.lastAction = {
            type: 'retract',
            timestamp: new Date().toISOString(),
            message: 'Clothes retracted manually',
          };
        }
        
        set({ device: newState, isLoading: false });
      }, 2000); // Longer delay to simulate motor movement
    } catch (error: any) {
      set({ isLoading: false, error: error.message || `Failed to ${action} clothesline` });
    }
  },

  renameDevice: async (name) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ 
          device: { ...get().device, name } as DeviceState,
          settings: { ...get().settings, name } as DeviceSettings,
          isLoading: false 
        });
      }, 1000);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to rename device' });
    }
  },

  factoryReset: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ 
          device: mockDeviceState,
          settings: mockDeviceSettings,
          isLoading: false 
        });
      }, 2000);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to factory reset device' });
    }
  },

  testMotor: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ isLoading: false });
      }, 3000);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to test motor' });
    }
  },
}));

export default useDeviceStore;