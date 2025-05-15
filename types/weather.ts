export interface CurrentWeather {
    temperature: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    isRaining: boolean;
    chanceOfRain: number;
  }
  
  export interface WeatherForecast {
    time: string;
    temperature: number;
    condition: string;
    icon: string;
    chanceOfRain: number;
  }
  
  export interface WeatherState {
    current: CurrentWeather | null;
    hourly: WeatherForecast[];
    daily: WeatherForecast[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
  }