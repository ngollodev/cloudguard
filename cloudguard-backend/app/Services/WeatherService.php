<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class WeatherService
{
    private $apiKey;
    private $baseUrl = 'https://api.openweathermap.org/data/2.5';

    public function __construct()
    {
        $this->apiKey = config('services.openweather.key');
    }

    public function getCurrentWeather($latitude, $longitude)
    {
        return Cache::remember("weather:current:{$latitude}:{$longitude}", 300, function () use ($latitude, $longitude) {
            $response = Http::get("{$this->baseUrl}/weather", [
                'lat' => $latitude,
                'lon' => $longitude,
                'appid' => $this->apiKey,
                'units' => 'metric',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'temperature' => round($data['main']['temp']),
                    'condition' => $data['weather'][0]['main'],
                    'icon' => $data['weather'][0]['icon'],
                    'humidity' => $data['main']['humidity'],
                    'windSpeed' => round($data['wind']['speed']),
                    'isRaining' => $this->isRaining($data['weather'][0]['id']),
                    'chanceOfRain' => $this->calculateRainChance($data),
                ];
            }

            throw new \Exception('Failed to fetch weather data');
        });
    }

    public function getHourlyForecast($latitude, $longitude)
    {
        return Cache::remember("weather:hourly:{$latitude}:{$longitude}", 300, function () use ($latitude, $longitude) {
            $response = Http::get("{$this->baseUrl}/forecast", [
                'lat' => $latitude,
                'lon' => $longitude,
                'appid' => $this->apiKey,
                'units' => 'metric',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return collect($data['list'])->take(24)->map(function ($item) {
                    return [
                        'time' => $item['dt_txt'],
                        'temperature' => round($item['main']['temp']),
                        'condition' => $item['weather'][0]['main'],
                        'icon' => $item['weather'][0]['icon'],
                        'chanceOfRain' => $this->calculateRainChance($item),
                    ];
                })->values();
            }

            throw new \Exception('Failed to fetch hourly forecast');
        });
    }

    public function getDailyForecast($latitude, $longitude)
    {
        return Cache::remember("weather:daily:{$latitude}:{$longitude}", 3600, function () use ($latitude, $longitude) {
            $response = Http::get("{$this->baseUrl}/forecast", [
                'lat' => $latitude,
                'lon' => $longitude,
                'appid' => $this->apiKey,
                'units' => 'metric',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return collect($data['list'])
                    ->groupBy(function ($item) {
                        return date('Y-m-d', strtotime($item['dt_txt']));
                    })
                    ->take(7)
                    ->map(function ($items) {
                        $avgTemp = $items->avg('main.temp');
                        $mainWeather = $items->pluck('weather.0.main')->mode()[0];
                        $icon = $items->pluck('weather.0.icon')->mode()[0];
                        $maxRainChance = $items->max(function ($item) {
                            return $this->calculateRainChance($item);
                        });

                        return [
                            'time' => $items->first()['dt_txt'],
                            'temperature' => round($avgTemp),
                            'condition' => $mainWeather,
                            'icon' => $icon,
                            'chanceOfRain' => $maxRainChance,
                        ];
                    })
                    ->values();
            }

            throw new \Exception('Failed to fetch daily forecast');
        });
    }

    private function isRaining($weatherId)
    {
        return $weatherId >= 500 && $weatherId < 600;
    }

    private function calculateRainChance($data)
    {
        if (isset($data['pop'])) {
            return round($data['pop'] * 100);
        }
        return 0;
    }
} 