import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudDrizzle, 
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  main: string;
}

const CompactWeatherSection = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

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
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rain':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'drizzle':
        return <CloudDrizzle className="h-6 w-6 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="h-6 w-6 text-blue-200" />;
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getActivityRecommendation = (weatherData: WeatherData) => {
    if (weatherData.main.toLowerCase() === 'rain') {
      return { text: 'Deportes bajo techo', color: 'bg-blue-100 text-blue-800' };
    } else if (weatherData.temperature > 30) {
      return { text: 'Hidratarse bien', color: 'bg-orange-100 text-orange-800' };
    } else if (weatherData.temperature < 10) {
      return { text: 'Abrigarse', color: 'bg-purple-100 text-purple-800' };
    } else {
      return { text: 'Condiciones ideales', color: 'bg-green-100 text-green-800' };
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-4">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            {weather && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(weather.main)}
                  <div>
                    <h3 className="font-semibold text-lg">{Math.round(weather.temperature)}°C</h3>
                    <p className="text-sm text-muted-foreground">{LOCATION.name}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-sm">{weather.description}</p>
                  <Badge className={getActivityRecommendation(weather).color}>
                    {getActivityRecommendation(weather).text}
                  </Badge>
                </div>
              </div>
            )}
            
            {weather && (
              <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3" />
                  <span>Sensación {Math.round(weather.feels_like)}°</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  <span>{weather.wind_speed} km/h</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CompactWeatherSection;