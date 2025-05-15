export type ScheduleType = 'one-time' | 'daily' | 'weekdays' | 'weekends' | 'custom';
export type ScheduleAction = 'extend' | 'retract';
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Schedule {
  id: string;
  name: string;
  type: ScheduleType;
  action: ScheduleAction;
  time: string; // HH:MM format
  isEnabled: boolean;
  days?: WeekDay[]; // For custom schedules
  date?: string; // For one-time schedules, YYYY-MM-DD format
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleState {
  schedules: Schedule[];
  isLoading: boolean;
  error: string | null;
}