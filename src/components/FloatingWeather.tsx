import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudDrizzle, 
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  main: string;
}

const FloatingWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Buenos Aires coordinates as default
  const LOCATION = { name: "Buenos Aires" };

  useEffect(() => {
    // Mock data for demonstration - replace with real API
    const mockWeather: WeatherData = {
      temperature: 24,
      feels_like: 26,
      humidity: 65,
      wind_speed: 12,
      description: "Parcialmente nublado",
      main: "Clouds"
    };

    setTimeout(() => {
      setWeather(mockWeather);
      setLoading(false);
    }, 1000);
  }, []);

  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case 'clear':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-5 w-5 text-gray-500" />;
      case 'rain':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'drizzle':
        return <CloudDrizzle className="h-5 w-5 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="h-5 w-5 text-blue-200" />;
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getActivityRecommendation = (weatherData: WeatherData) => {
    if (weatherData.main.toLowerCase() === 'rain') {
      return { text: 'Deportes bajo techo', color: 'text-blue-600' };
    } else if (weatherData.temperature > 30) {
      return { text: 'Hidratarse bien', color: 'text-orange-600' };
    } else if (weatherData.temperature < 10) {
      return { text: 'Abrigarse', color: 'text-purple-600' };
    } else {
      return { text: 'Condiciones ideales', color: 'text-green-600' };
    }
  };

  if (!isVisible || loading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-xs">
      <Card className="shadow-lg bg-white/95 backdrop-blur-sm border border-white/20">
        <CardContent className="p-3">
          {weather && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getWeatherIcon(weather.main)}
                  <div>
                    <p className="font-semibold text-sm">{Math.round(weather.temperature)}°C</p>
                    <p className="text-xs text-muted-foreground">{LOCATION.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-6 w-6 p-0"
                  >
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="text-center">
                    <p className="text-sm font-medium">{weather.description}</p>
                    <p className={`text-xs ${getActivityRecommendation(weather).color}`}>
                      {getActivityRecommendation(weather).text}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground text-center">
                    <div>
                      <p className="font-medium">Sensación</p>
                      <p>{Math.round(weather.feels_like)}°C</p>
                    </div>
                    <div>
                      <p className="font-medium">Humedad</p>
                      <p>{weather.humidity}%</p>
                    </div>
                    <div>
                      <p className="font-medium">Viento</p>
                      <p>{weather.wind_speed} km/h</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingWeather;