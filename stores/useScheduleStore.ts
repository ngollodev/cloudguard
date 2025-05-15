import { create } from 'zustand';
import { Schedule, ScheduleState } from '../types/schedule';
import { format } from 'date-fns';

interface ScheduleStore extends ScheduleState {
  fetchSchedules: () => Promise<void>;
  createSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleSchedule: (id: string) => Promise<void>;
}

// Mock initial schedules
const mockSchedules: Schedule[] = [
  {
    id: '1',
    name: 'Morning Extend',
    type: 'daily',
    action: 'extend',
    time: '07:00',
    isEnabled: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Evening Retract',
    type: 'daily',
    action: 'retract',
    time: '19:00',
    isEnabled: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Weekday Extend',
    type: 'weekdays',
    action: 'extend',
    time: '08:30',
    isEnabled: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

const useScheduleStore = create<ScheduleStore>((set, get) => ({
  schedules: mockSchedules,
  isLoading: false,
  error: null,

  fetchSchedules: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        set({ schedules: mockSchedules, isLoading: false });
      }, 500);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch schedules' });
    }
  },

  createSchedule: async (schedule) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        const newSchedule: Schedule = {
          ...schedule,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set({ 
          schedules: [...get().schedules, newSchedule], 
          isLoading: false 
        });
      }, 1000);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to create schedule' });
    }
  },

  updateSchedule: async (id, schedule) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        const schedules = get().schedules.map(s => 
          s.id === id 
            ? { 
                ...s, 
                ...schedule, 
                updatedAt: new Date().toISOString() 
              } 
            : s
        );
        
        set({ schedules, isLoading: false });
      }, 1000);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to update schedule' });
    }
  },

  deleteSchedule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        const schedules = get().schedules.filter(s => s.id !== id);
        set({ schedules, isLoading: false });
      }, 1000);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to delete schedule' });
    }
  },

  toggleSchedule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        const schedules = get().schedules.map(s => 
          s.id === id 
            ? { 
                ...s, 
                isEnabled: !s.isEnabled, 
                updatedAt: new Date().toISOString() 
              } 
            : s
        );
        
        set({ schedules, isLoading: false });
      }, 500);
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to toggle schedule' });
    }
  },
}));

export default useScheduleStore;