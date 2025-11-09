import React, { useEffect, useRef, useState } from 'react';
import { Location } from '../types';
import { getColors } from '../utils/colors';

interface MapViewProps {
  start: Location;
  end: Location;
  directionsResult: any | null; 
  selectedRouteColor: string;
}

export const MapView: React.FC<MapViewProps> = ({ 
  start, 
  end, 
  directionsResult, 
  selectedRouteColor 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null); 
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);

  useEffect(() => {
    if ((window as any).google?.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    const apiKey = 'AIzaSyBqrMy6b5q4er0bY5bbK_8qPWnYaRdE-L4'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setLoadError(true);
    };

    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 40.75, lng: -73.98 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true, 
      });
    }

    const map = mapInstanceRef.current;
    const renderer = directionsRendererRef.current;

    const updateMarker = (ref: React.MutableRefObject<any>, position: any, label: string) => {
      if (ref.current) {
        ref.current.setPosition(position);
      } else {
        ref.current = new google.maps.Marker({
          position: position,
          map: map,
          label: {
            text: label,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: label === 'S' ? '#3B82F6' : '#EF4444',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: 'white',
          },
        });
      }
    };
    
    updateMarker(startMarkerRef, start.coords, 'S');
    updateMarker(endMarkerRef, end.coords, 'E');

    renderer.setDirections({ routes: [] });
    
    if (directionsResult) {
      const colors = getColors(selectedRouteColor);
      
      renderer.setOptions({
        polylineOptions: {
          strokeColor: colors.bg,
          strokeOpacity: 0.8,
          strokeWeight: 6,
        },
      });

      renderer.setDirections(directionsResult);
    } else {
      renderer.setMap(map);
      map.setCenter(start.coords);
      map.setZoom(14);
    }
  }, [isLoaded, start, end, directionsResult, selectedRouteColor]);

  if (loadError) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#fee2e2', 
        color: '#b91c1c' 
      }}>
        <p>Failed to load Google Maps. Please check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#e5e7eb' 
      }}>
        <p style={{ color: '#6b7280' }}>Loading map...</p>
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%', backgroundColor: '#e5e7eb' }} />;
};