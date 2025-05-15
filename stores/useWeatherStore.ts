import { create } from 'zustand';
import { WeatherState } from '../types/weather';

interface WeatherStore extends WeatherState {
  fetchWeather: (latitude: number, longitude: number) => Promise<void>;
}

// Mock weather data
const mockCurrentWeather = {
  temperature: 18,
  condition: 'Partly Cloudy',
  icon: '04d',
  humidity: 65,
  windSpeed: 12,
  isRaining: false,
  chanceOfRain: 20,
};

const mockHourlyForecast = Array(24).fill(null).map((_, index) => {
  const hour = new Date();
  hour.setHours(hour.getHours() + index);
  const isEvening = hour.getHours() >= 18 || hour.getHours() <= 6;
  const hasRain = Math.random() > 0.7;
  
  return {
    time: hour.toISOString(),
    temperature: Math.round(15 + Math.sin(index / 8) * 10),
    condition: hasRain ? 'Rainy' : (isEvening ? 'Clear' : 'Sunny'),
    icon: hasRain ? '10d' : (isEvening ? '01n' : '01d'),
    chanceOfRain: hasRain ? Math.round(50 + Math.random() * 50) : Math.round(Math.random() * 20),
  };
});

const mockDailyForecast = Array(7).fill(null).map((_, index) => {
  const day = new Date();
  day.setDate(day.getDate() + index);
  const hasRain = Math.random() > 0.6;
  
  return {
    time: day.toISOString(),
    temperature: Math.round(18 + Math.sin(index / 3) * 8),
    condition: hasRain ? 'Rainy' : ['Sunny', 'Partly Cloudy', 'Cloudy'][Math.floor(Math.random() * 3)],
    icon: hasRain ? '10d' : ['01d', '02d', '03d'][Math.floor(Math.random() * 3)],
    chanceOfRain: hasRain ? Math.round(40 + Math.random() * 60) : Math.round(Math.random() * 30),
  };
});

const useWeatherStore = create<WeatherStore>((set) => ({
  current: mockCurrentWeather,
  hourly: mockHourlyForecast,
  daily: mockDailyForecast,
  isLoading: false,
  error: null,
  lastUpdated: new Date().toISOString(),

  fetchWeather: async (latitude, longitude) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      setTimeout(() => {
        // Generate some random rainy data for demonstration
        const isRaining = Math.random() > 0.7;
        const current = {
          ...mockCurrentWeather,
          isRaining,
          chanceOfRain: isRaining ? 80 + Math.round(Math.random() * 20) : Math.round(Math.random() * 30),
          condition: isRaining ? 'Rainy' : mockCurrentWeather.condition,
          icon: isRaining ? '10d' : mockCurrentWeather.icon,
        };
        
        set({ 
          current,
          hourly: mockHourlyForecast,
          daily: mockDailyForecast,
          isLoading: false,
          lastUpdated: new Date().toISOString(),
        });
      }, 1000);
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch weather data' 
      });
    }
  },
}));

export default useWeatherStore;