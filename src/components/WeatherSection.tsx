import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudDrizzle, 
  Thermometer,
  Droplets,
  Wind,
  Eye,
  RefreshCw,
  MapPin
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  visibility: number;
  description: string;
  main: string;
  icon: string;
  timestamp: number;
}

interface ForecastData {
  date: string;
  temperature_max: number;
  temperature_min: number;
  description: string;
  main: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

const WeatherSection = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Buenos Aires coordinates as default
  const LOCATION = { lat: -34.6118, lon: -58.3960, name: "Buenos Aires" };

  useEffect(() => {
    fetchWeatherData();
    // Auto refresh every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using OpenWeatherMap API (you'll need to get a free API key)
      const API_KEY = "demo_key"; // Replace with actual API key
      
      // For demo purposes, using mock data
      // In production, replace with actual API calls:
      // const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${LOCATION.lat}&lon=${LOCATION.lon}&appid=${API_KEY}&units=metric&lang=es`;
      // const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${LOCATION.lat}&lon=${LOCATION.lon}&appid=${API_KEY}&units=metric&lang=es`;

      // Mock data for demonstration
      const mockWeather: WeatherData = {
        temperature: 24,
        feels_like: 26,
        humidity: 65,
        wind_speed: 12,
        wind_direction: 220,
        visibility: 10000,
        description: "Parcialmente nublado",
        main: "Clouds",
        icon: "02d",
        timestamp: Date.now()
      };

      const mockForecast: ForecastData[] = [
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          temperature_max: 26,
          temperature_min: 18,
          description: "Soleado",
          main: "Clear",
          icon: "01d",
          humidity: 60,
          wind_speed: 8
        },
        {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          temperature_max: 22,
          temperature_min: 16,
          description: "Lluvia ligera",
          main: "Rain",
          icon: "10d",
          humidity: 80,
          wind_speed: 15
        },
        {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          temperature_max: 28,
          temperature_min: 20,
          description: "Despejado",
          main: "Clear",
          icon: "01d",
          humidity: 55,
          wind_speed: 6
        }
      ];

      setWeather(mockWeather);
      setForecast(mockForecast);
      setLastUpdated(new Date());
    } catch (err) {
      setError("No se pudo cargar la información del clima");
      console.error("Weather fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'drizzle':
        return <CloudDrizzle className="h-8 w-8 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="h-8 w-8 text-blue-200" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getConditionsForSport = (weatherData: WeatherData) => {
    const conditions = [];
    
    if (weatherData.main.toLowerCase() === 'rain') {
      conditions.push({ 
        sport: 'Deportes bajo techo', 
        status: 'Recomendado', 
        color: 'bg-green-100 text-green-800' 
      });
      conditions.push({ 
        sport: 'Deportes al aire libre', 
        status: 'No recomendado', 
        color: 'bg-red-100 text-red-800' 
      });
    } else if (weatherData.temperature > 30) {
      conditions.push({ 
        sport: 'Deportes intensos', 
        status: 'Precaución', 
        color: 'bg-yellow-100 text-yellow-800' 
      });
    } else if (weatherData.temperature < 10) {
      conditions.push({ 
        sport: 'Deportes al aire libre', 
        status: 'Abrigarse', 
        color: 'bg-blue-100 text-blue-800' 
      });
    } else {
      conditions.push({ 
        sport: 'Todos los deportes', 
        status: 'Condiciones ideales', 
        color: 'bg-green-100 text-green-800' 
      });
    }

    return conditions;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando información del clima...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchWeatherData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Condiciones Climáticas</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Información del clima actualizada para planificar tu actividad deportiva
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Current Weather */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {LOCATION.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Actualizado: {lastUpdated?.toLocaleTimeString()}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchWeatherData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {weather && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getWeatherIcon(weather.main)}
                      <div>
                        <p className="text-4xl font-bold">{Math.round(weather.temperature)}°C</p>
                        <p className="text-muted-foreground">
                          Sensación térmica: {Math.round(weather.feels_like)}°C
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{weather.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Humedad</p>
                        <p className="font-semibold">{weather.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Viento</p>
                        <p className="font-semibold">{weather.wind_speed} km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Visibilidad</p>
                        <p className="font-semibold">{weather.visibility / 1000} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Presión</p>
                        <p className="font-semibold">Normal</p>
                      </div>
                    </div>
                  </div>

                  {/* Sport Conditions */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recomendaciones deportivas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {getConditionsForSport(weather).map((condition, index) => (
                        <Badge key={index} className={condition.color}>
                          {condition.sport}: {condition.status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Pronóstico 3 días</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(day.main)}
                      <div>
                        <p className="font-medium">
                          {index === 0 ? 'Mañana' : new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                        </p>
                        <p className="text-sm text-muted-foreground">{day.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {Math.round(day.temperature_max)}°/{Math.round(day.temperature_min)}°
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {day.humidity}% • {day.wind_speed} km/h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WeatherSection;