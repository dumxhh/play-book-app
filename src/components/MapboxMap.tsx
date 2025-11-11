import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { MapPin } from 'lucide-react';

const MapboxMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Get Mapbox token from edge function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !data?.token) {
          throw new Error('No se pudo obtener el token de Mapbox');
        }

        if (!mapContainer.current) return;

        mapboxgl.accessToken = data.token;
        
        // Coordinates for "Av. Deportiva 123, Centro Deportivo"
        // Using Buenos Aires area coordinates as example
        const lng = -58.3816;
        const lat = -34.6037;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: 15,
          pitch: 45,
        });

        // Add navigation controls
        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        // Add custom marker
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';
        
        // Create marker element with icon
        const markerDiv = document.createElement('div');
        markerDiv.style.backgroundColor = 'hsl(var(--primary))';
        markerDiv.style.width = '40px';
        markerDiv.style.height = '40px';
        markerDiv.style.borderRadius = '50% 50% 50% 0';
        markerDiv.style.transform = 'rotate(-45deg)';
        markerDiv.style.display = 'flex';
        markerDiv.style.alignItems = 'center';
        markerDiv.style.justifyContent = 'center';
        markerDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
        
        const icon = document.createElement('div');
        icon.innerHTML = '🏆';
        icon.style.transform = 'rotate(45deg)';
        icon.style.fontSize = '20px';
        markerDiv.appendChild(icon);
        el.appendChild(markerDiv);

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(
                '<div style="padding: 8px;"><h3 style="font-weight: bold; margin-bottom: 4px;">MatchPoint</h3><p style="font-size: 14px;">Av. Deportiva 123<br/>Centro Deportivo</p></div>'
              )
          )
          .addTo(map.current);

        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Error al cargar el mapa');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  if (error) {
    return (
      <div className="aspect-video bg-muted/50 flex flex-col items-center justify-center p-6 space-y-4">
        <MapPin className="w-16 h-16 text-destructive" />
        <p className="text-destructive text-center">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="aspect-video bg-muted/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default MapboxMap;
