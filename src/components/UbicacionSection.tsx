import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Car, Bus, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const UbicacionSection = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get Mapbox token from edge function
      const { data, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
      
      if (tokenError) {
        throw new Error('No se pudo obtener el token de Mapbox');
      }

      if (!data?.token) {
        throw new Error('Token de Mapbox no configurado');
      }

      // Import Mapbox GL JS
      const mapboxgl = await import('mapbox-gl');
      
      // Set access token
      mapboxgl.default.accessToken = data.token;

      if (!mapContainer.current) return;

      // Initialize map
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-58.3816, -34.6037], // Buenos Aires coordinates
        zoom: 15,
        pitch: 45,
        bearing: -45
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.default.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add full screen control
      map.current.addControl(new mapboxgl.default.FullscreenControl(), 'top-left');

      // Add marker for the sports club
      new mapboxgl.default.Marker({
        color: '#ef4444',
        scale: 1.5
      })
        .setLngLat([-58.3816, -34.6037])
        .setPopup(
          new mapboxgl.default.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0; font-weight: bold;">Club Deportivo</h3>
                <p style="margin: 0; color: #666;">Av. Deportiva 123, Centro Deportivo</p>
                <p style="margin: 5px 0 0 0; color: #666;">¡Te esperamos!</p>
              </div>
            `)
        )
        .addTo(map.current);

      // Add some nice effects when map loads
      map.current.on('load', () => {
        setMapLoaded(true);
        setLoading(false);
        
        // Add a subtle building layer
        map.current.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });
      });

      map.current.on('error', (e: any) => {
        console.error('Mapbox error:', e);
        setError('Error al cargar el mapa');
        setLoading(false);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar el mapa');
      setLoading(false);
      toast({
        title: "Error del mapa",
        description: "No se pudo cargar el mapa interactivo. La ubicación sigue siendo accesible.",
        variant: "destructive"
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

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
              {loading ? (
                <div className="aspect-video bg-muted/50 flex flex-col items-center justify-center p-6 space-y-4">
                  <MapPin className="w-16 h-16 text-primary animate-bounce" />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-foreground">Cargando Mapa Interactivo</p>
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="aspect-video bg-muted/50 flex flex-col items-center justify-center p-6 space-y-4">
                  <AlertCircle className="w-16 h-16 text-destructive" />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-foreground">Error al cargar el mapa</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                  <Alert className="max-w-md">
                    <AlertDescription className="text-xs text-center">
                      Puedes encontrarnos en <strong>Av. Deportiva 123, Centro Deportivo</strong> o usar el enlace de Google Maps abajo.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div 
                  ref={mapContainer}
                  className="w-full h-[400px] rounded-lg"
                  style={{ 
                    minHeight: '400px'
                  }}
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
                  className="w-full" 
                  onClick={() => window.open('https://maps.google.com/?q=Av+Deportiva+123+Centro+Deportivo', '_blank')}
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
                  <p className="font-medium">2246-536537</p>
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