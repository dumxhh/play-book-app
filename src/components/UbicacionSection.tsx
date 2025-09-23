import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Car, Bus, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UbicacionSection = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  const loadGoogleMaps = async (key: string) => {
    try {
      const { Loader } = await import('@googlemaps/js-api-loader');
      const loader = new Loader({
        apiKey: key,
        version: "weekly",
        libraries: ["places"]
      });

      const google = await loader.load();
      
      if (mapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires coordinates
          zoom: 15,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Add marker for the sports club
        new google.maps.Marker({
          position: { lat: -34.6037, lng: -58.3816 },
          map: map,
          title: "Club Deportivo",
          icon: {
            url: "data:image/svg+xml;charset=UTF-8,%3csvg width='40' height='40' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' fill='%23ef4444'/%3e%3ccircle cx='12' cy='9' r='2.5' fill='white'/%3e%3c/svg%3e",
            scaledSize: new google.maps.Size(40, 40),
          }
        });

        setMapLoaded(true);
        setShowApiKeyInput(false);
      }
    } catch (error) {
      console.error("Error loading Google Maps:", error);
    }
  };

  const handleLoadMap = () => {
    if (apiKey.trim()) {
      loadGoogleMaps(apiKey.trim());
    }
  };
  return (
    <section id="ubicacion" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Nuestra Ubicación
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra nuestro club deportivo fácilmente y conoce toda la información práctica
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Map */}
          <Card className="bg-gradient-card border-border shadow-soft overflow-hidden">
            <CardContent className="p-0">
              {showApiKeyInput && !mapLoaded ? (
                <div className="aspect-video bg-muted/50 flex flex-col items-center justify-center p-6 space-y-4">
                  <MapPin className="w-16 h-16 text-primary animate-bounce-soft" />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-foreground">Mapa Interactivo de Google Maps</p>
                    <p className="text-sm text-muted-foreground">Ingresa tu API key de Google Maps para ver el mapa</p>
                  </div>
                  <Alert className="max-w-md">
                    <AlertDescription className="text-xs">
                      Obtén tu API key gratuita en: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" className="text-primary underline">Google Cloud Console</a>
                    </AlertDescription>
                  </Alert>
                  <div className="flex space-x-2 w-full max-w-md">
                    <Input
                      type="password"
                      placeholder="Google Maps API Key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleLoadMap} disabled={!apiKey.trim()}>
                      Cargar Mapa
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  ref={mapRef}
                  className="aspect-video w-full min-h-[300px]"
                />
              )}
            </CardContent>
          </Card>

          {/* Location Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Dirección</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-medium mb-2">
                  Av. Deportiva 123, Centro Deportivo
                </p>
                <p className="text-muted-foreground mb-4">
                  Ciudad Deportiva, CP 12345
                </p>
                <Button 
                  variant="outline" 
                  className="w-full neon-button" 
                  onClick={() => window.open('https://maps.google.com/?q=Club+Deportivo+Buenos+Aires', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  🗺️ Abrir en Google Maps
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Horarios de Atención</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lunes - Viernes:</span>
                  <span className="font-medium">8:00 - 22:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sábados:</span>
                  <span className="font-medium">8:00 - 23:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domingos:</span>
                  <span className="font-medium">9:00 - 21:00</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>Contacto</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">reservas@sportclub.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle>Cómo llegar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Car className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">En automóvil</p>
                    <p className="text-sm text-muted-foreground">
                      Estacionamiento gratuito disponible para 200 vehículos
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bus className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Transporte público</p>
                    <p className="text-sm text-muted-foreground">
                      Líneas 15, 23 y 45. Parada "Centro Deportivo"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UbicacionSection;