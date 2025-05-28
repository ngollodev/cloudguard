<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    private $weatherService;

    public function __construct(WeatherService $weatherService)
    {
        $this->weatherService = $weatherService;
    }

    public function getWeather(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        try {
            $current = $this->weatherService->getCurrentWeather(
                $request->latitude,
                $request->longitude
            );

            $hourly = $this->weatherService->getHourlyForecast(
                $request->latitude,
                $request->longitude
            );

            $daily = $this->weatherService->getDailyForecast(
                $request->latitude,
                $request->longitude
            );

            return response()->json([
                'current' => $current,
                'hourly' => $hourly,
                'daily' => $daily,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch weather data',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
} 