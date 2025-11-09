import React, { useState, useEffect, useRef } from 'react';

// Define types for coordinate data
interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  name: string;
  coords: Coordinates;
}

interface RouteSegment {
  points: Coordinates[];
  distance: string;
  duration: string;
}

interface Route {
  id: string;
  score: number;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  borderColor: string;
  isSelected: boolean;
  segment: RouteSegment;
  // NEW: Store the DirectionsResult for the map renderer
  directionsResult?: any; // google.maps.DirectionsResult type
}

// --- Icon Definitions (Keep existing icons) ---
const IconSearch: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const IconMapPin: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const IconNavigation: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
  </svg>
);

const IconClock: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const IconShield: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

// Function to convert color class to actual colors
const getColors = (colorClass: string) => {
  const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
    'bg-green-500': { bg: '#10B981', border: '#10B981', icon: '#10B981' },
    'bg-blue-500': { bg: '#3B82F6', border: '#3B82F6', icon: '#3B82F6' },
    'bg-purple-500': { bg: '#8B5CF6', border: '#8B5CF6', icon: '#8B5CF6' },
  };
  return colorMap[colorClass] || { bg: '#4F46E5', border: '#4F46E5', icon: '#4F46E5' };
};

// --- Map View Component (UPDATED) ---
interface MapViewProps {
  start: Location;
  end: Location;
  // Use directionsResult instead of a simple polyline segment
  directionsResult: any | null; 
  selectedRouteColor: string;
}

const MapView: React.FC<MapViewProps> = ({ start, end, directionsResult, selectedRouteColor }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  // Replaced polylineRef with directionsRendererRef
  const directionsRendererRef = useRef<any>(null); 
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);

  useEffect(() => {
    if ((window as any).google?.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    // API Key provided by the user in the context. Google Maps JavaScript API Key is required for Geocoding.
    const apiKey = 'AIzaSyBqrMy6b5q4er0bY5bbK_8qPWnYaRdE-L4'
    // Include the 'geometry' library as before. 'Directions' is available in the core API.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setLoadError(true);
    };

    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
        document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Only run if the Google Maps API is loaded
    if (!isLoaded || !mapRef.current) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    if (!mapInstanceRef.current) {
      // Initialize Map instance only once
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 40.75, lng: -73.98 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      // Initialize DirectionsRenderer once
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        // Set to false so we can manage the custom start/end markers
        suppressMarkers: true, 
      });
    }

    const map = mapInstanceRef.current;
    const renderer = directionsRendererRef.current;

    const updateMarker = (ref: React.MutableRefObject<any>, position: Coordinates, label: string) => {
      // ... (Keep existing marker update logic)
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
    
    // Always update custom markers for start and end, regardless of route existence
    updateMarker(startMarkerRef, start.coords, 'S');
    updateMarker(endMarkerRef, end.coords, 'E');

    // Remove directions/polyline visualization initially
    renderer.setDirections({ routes: [] }); // Clear directions
    
    // Draw new route if directionsResult is available
    if (directionsResult) {
      // Set the path color for the renderer (this is a bit complex as renderer uses predefined styles, 
      // but we can pass the result and let the renderer handle the path drawing and bounds)
      const colors = getColors(selectedRouteColor);
      
      renderer.setOptions({
        polylineOptions: {
          strokeColor: colors.bg,
          strokeOpacity: 0.8,
          strokeWeight: 6,
        },
      });

      // Pass the DirectionsResult object directly to the renderer
      renderer.setDirections(directionsResult);
      
      // The renderer automatically handles fitting bounds, so we don't need the custom logic
    } else {
      // If no route, ensure renderer is clear and focus on the start point
      renderer.setMap(map); // Re-attach renderer if needed, although it should already be on map
      map.setCenter(start.coords);
      map.setZoom(14);
    }
    
    // Hide markers if directions are being displayed by the renderer (since suppressMarkers: true)
    // No need to explicitly hide the custom markers as they are outside the renderer's control.

  }, [isLoaded, start, end, directionsResult, selectedRouteColor]); // Changed routeSegment to directionsResult

  if (loadError) {
    // ... (Keep existing loadError UI)
  }

  if (!isLoaded) {
    // ... (Keep existing loading UI)
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%', backgroundColor: '#e5e7eb' }} />;
};

// --- Main App Component (UPDATED handleSearch) ---
const App: React.FC = () => {
  const [startLocationName, setStartLocationName] = useState<string>('NYU');
  const [endLocationName, setEndLocationName] = useState<string>('Central Park');
  
  const [startLocation, setStartLocation] = useState<Location>({
    name: 'NYU',
    coords: { lat: 40.7291, lng: -73.9965 }
  });
  const [endLocation, setEndLocation] = useState<Location>({
    name: 'Central Park',
    coords: { lat: 40.7851, lng: -73.9683 }
  });

  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const isMobile = window.innerWidth < 768;

  // Helper to get Directions Service instance (assuming Google Maps API is loaded)
  const getDirectionsService = () => {
    const google = (window as any).google;
    if (google?.maps && google.maps.DirectionsService) {
      return new google.maps.DirectionsService();
    }
    return null;
  };
  
  // Geocoding function (kept the same)
  const geocodeLocation = (locationName: string): Promise<Coordinates> => {
    // ... (same as before)
    return new Promise((resolve, reject) => {
      const google = (window as any).google;
      if (!google?.maps || !google.maps.Geocoder) {
        return reject('Google Maps Geocoder not yet loaded. Please wait for the map to fully initialize.');
      }

      const geocoder = new google.maps.Geocoder();
      const maxRetries = 3;
      let attempt = 0;

      const attemptGeocode = () => {
        geocoder.geocode({ address: locationName }, (results: any, status: any) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            resolve({ lat, lng });
          } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT && attempt < maxRetries) {
            attempt++;
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.warn(`Query limit reached for ${locationName}. Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxRetries})...`);
            setTimeout(attemptGeocode, delay);
          } else {
            reject(`Could not find coordinates for "${locationName}". Status: ${status}`);
          }
        });
      };

      attemptGeocode();
    });
  };

  // Function to request walking directions (kept the same)
  const getWalkingDirections = (origin: Coordinates, destination: Coordinates): Promise<any> => {
    const service = getDirectionsService();
    if (!service) {
        return Promise.reject('Directions Service not loaded.');
    }
    
    return new Promise((resolve, reject) => {
        service.route({
            origin: origin,
            destination: destination,
            travelMode: 'WALKING' as any,
            provideRouteAlternatives: true,
        }, (response: any, status: any) => {
            const google = (window as any).google;
            if (status === google.maps.DirectionsStatus.OK) {
                resolve(response);
            } else {
                reject(`Directions request failed. Status: ${status}`);
            }
        });
    });
  };

  const mockRoutesData: Route[] = [
    {
      id: 'A',
      score: 92,
      label: 'Most Accessible (Lowest steps/ramps)', // Restored 'Most Accessible' label
      icon: IconNavigation,
      color: 'bg-green-500',
      borderColor: 'border-green-500',
      isSelected: false,
      segment: {
        points: [ // Example mock points
          { lat: 40.7291, lng: -73.9965 }, 
          { lat: 40.7450, lng: -73.9880 },
          { lat: 40.7620, lng: -73.9780 },
          { lat: 40.7851, lng: -73.9683 } 
        ],
        distance: '4.2 mi',
        duration: '25 min'
      }
    },
    {
      id: 'B',
      score: 78,
      label: 'Fastest (Walking Route)', // Updated to be the 'Fastest' walking route
      icon: IconClock,
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      isSelected: false,
      segment: {
        points: [ // Example mock points
          { lat: 40.7291, lng: -73.9965 }, 
          { lat: 40.7580, lng: -73.9910 },
          { lat: 40.7851, lng: -73.9683 }
        ],
        distance: '3.8 mi',
        duration: '15 min'
      }
    },
    {
      id: 'C',
      score: 85,
      label: 'Safest at Night (High lighting)',
      icon: IconShield,
      color: 'bg-purple-500',
      borderColor: 'border-purple-500',
      isSelected: false,
      segment: {
        points: [ // Example mock points
          { lat: 40.7291, lng: -73.9965 }, 
          { lat: 40.7400, lng: -73.9750 },
          { lat: 40.7700, lng: -73.9700 },
          { lat: 40.7851, lng: -73.9683 } 
        ],
        distance: '4.0 mi',
        duration: '20 min'
      }
    },
  ];

  // UPDATED: Walking directions assigned to Route B (Fastest/Blue)
  const handleSearch = async () => {
    if (!startLocationName || !endLocationName) return;

    setIsLoading(true);
    setGeocodeError(null);
    setRoutes(null);

    try {
      // 1. Geocode both locations simultaneously
      const [startCoords, endCoords] = await Promise.all([
        geocodeLocation(startLocationName),
        geocodeLocation(endLocationName)
      ]);

      // 2. Request Walking Directions
      const directionsResponse = await getWalkingDirections(startCoords, endCoords);
      const mainRoute = directionsResponse.routes[0];
      const leg = mainRoute.legs[0]; // Assuming single leg route

      // 3. Extract necessary data
      const walkingDistance = leg.distance.text;
      const walkingDuration = leg.duration.text;

      // 4. Update state with newly geocoded coordinates
      setStartLocation({ name: startLocationName, coords: startCoords });
      setEndLocation({ name: endLocationName, coords: endCoords });

      // 5. Update mock routes, assigning the REAL walking data to the 'B' route
      const updatedRoutes = mockRoutesData.map(route => {
        // All routes must update their endpoints with the new geocoded coordinates
        const intermediatePoints = route.segment.points.slice(1, -1);
        const baseRoute = {
          ...route,
          segment: {
            ...route.segment,
            points: [startCoords, ...intermediatePoints, endCoords]
          },
          directionsResult: null,
          isSelected: false,
        };

        if (route.id === 'B') {
          // Assign actual walking data and select the Fastest/Blue route
          return {
            ...baseRoute,
            segment: {
              ...baseRoute.segment,
              distance: walkingDistance,
              duration: walkingDuration
            },
            directionsResult: directionsResponse, // Store the full response
            isSelected: true,
            label: `Fastest (Walking Route: ${walkingDuration})`
          };
        } else if (route.id === 'A') {
          // Keep the A route as Most Accessible (Green) mock, but with correct endpoints
          return {
            ...baseRoute,
            label: 'Most Accessible (Lowest steps/ramps)',
            // Retain mock distance/duration for mock routes
          };
        } else if (route.id === 'C') {
          // Keep the C route as Safest (Purple) mock, but with correct endpoints
          return {
            ...baseRoute,
            label: 'Safest at Night (High lighting)',
            // Retain mock distance/duration for mock routes
          };
        }
        return baseRoute;
      });
      
      setRoutes(updatedRoutes);
      setSelectedRouteId('B'); // Select the new walking route (B) by default

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setGeocodeError(errorMessage);
      console.error(errorMessage);
      setStartLocation({ name: startLocationName, coords: { lat: 40.75, lng: -73.98 } });
      setEndLocation({ name: endLocationName, coords: { lat: 40.75, lng: -73.98 } });
      setSelectedRouteId(null);
      setRoutes(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Rest of the App component remains the same)
  const handleRouteSelect = (id: string) => {
    setSelectedRouteId(id);
    if (routes) {
      setRoutes(routes.map(route => ({
        ...route,
        isSelected: route.id === id
      })));
    }
  };

  const selectedRoute = routes?.find(r => r.id === selectedRouteId);
  const selectedDirectionsResult = selectedRoute ? selectedRoute.directionsResult : null;
  const selectedRouteColor = selectedRoute ? selectedRoute.color : 'bg-indigo-600';

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', width: '100%', backgroundColor: '#f3f4f6', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* Sidebar */}
      <div style={{ width: isMobile ? '100%' : '320px', padding: '1.5rem', backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', zIndex: 20, flexShrink: 0, overflowY: 'auto' }}>
        {/* ... (Header and Inputs remain the same) ... */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <IconMapPin style={{ color: '#4f46e5', width: '1.5rem', height: '1.5rem' }}/>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>Smart Route Planner</h1>
        </div>
        
        {/* Location Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              placeholder="Start Location (e.g., NYU)"
              value={startLocationName}
              onChange={(e) => setStartLocationName(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              disabled={isLoading}
            />
            <IconMapPin style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#9ca3af' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              placeholder="Destination (e.g., Central Park)"
              value={endLocationName}
              onChange={(e) => setEndLocationName(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              disabled={isLoading}
            />
            <IconMapPin style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#9ca3af' }} />
          </div>
        </div>

        {/* Search Button */}
        <button
          style={{
            width: '100%',
            padding: '0.625rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.5rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: isLoading ? '#818cf8' : '#4f46e5',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s'
          }}
          onClick={handleSearch}
          disabled={isLoading || !startLocationName || !endLocationName}
          onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#4338ca')}
          onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#4f46e5')}
        >
          {isLoading ? (
            <>
              <svg style={{ animation: 'spin 1s linear infinite', marginRight: '0.75rem', height: '1.25rem', width: '1.25rem', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          ) : (
            <>
              <IconSearch style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Search Optimal Routes
            </>
          )}
        </button>

        {/* Geocoding Error Display */}
        {geocodeError && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
              <p style={{ margin: 0, fontWeight: '600' }}>Location Error:</p>
              <p style={{ margin: 0 }}>{geocodeError}</p>
            </div>
        )}
        
        {/* Route Selector (Desktop) */}
        {routes && !isMobile && (
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem' }}>Found {routes.length} Optimal Routes:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {routes.map((route) => {
                const colors = getColors(route.color);
                return (
                  <button
                    key={route.id}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      border: `2px solid ${route.isSelected ? colors.border : '#e5e7eb'}`,
                      backgroundColor: route.isSelected ? '#eef2ff' : 'white',
                      boxShadow: route.isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => handleRouteSelect(route.id)}
                    onMouseEnter={(e) => !route.isSelected && (e.currentTarget.style.borderColor = '#d1d5db')}
                    onMouseLeave={(e) => !route.isSelected && (e.currentTarget.style.borderColor = '#e5e7eb')}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
                          <div style={{ padding: '0.375rem', borderRadius: '9999px', backgroundColor: colors.bg, marginRight: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                            <route.icon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                          </div>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              color: '#374151',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                            }}
                          >
                            {route.label.split('(')[0].trim()}
                          </span>
                        </div>
                        <span style={{ fontSize: '1.125rem', fontWeight: '800', color: '#111827', lineHeight: 1, flexShrink: 0 }}>
                          {route.score}<span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#6b7280' }}>/100</span>
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', marginLeft: '2rem', margin: 0 }}>
                        {route.segment.distance} / {route.segment.duration} ({route.label.match(/\(([^)]+)\)/)?.[1] || 'Details'})
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', height: '100%' }}>
        <MapView
          start={startLocation}
          end={endLocation}
          directionsResult={selectedDirectionsResult}
          selectedRouteColor={selectedRouteColor}
        />
        
        {/* Location Info Overlay */}
        {selectedRoute && !isMobile && (
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.75rem', zIndex: 10, color: 'white' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', padding: '0.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(31, 41, 55, 0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', margin: 0 }}>
              <IconMapPin style={{ display: 'inline', width: '1rem', height: '1rem', marginRight: '0.25rem', color: '#60a5fa', verticalAlign: 'middle' }} /> Start: {startLocation.name}
              <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>/</span>
              <IconMapPin style={{ display: 'inline', width: '1rem', height: '1rem', marginRight: '0.25rem', color: '#f87171', verticalAlign: 'middle' }} /> End: {endLocation.name}
            </p>
          </div>
        )}
        
        {/* Floating Route Selector (Mobile) */}
        {routes && isMobile && (
          <div style={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 20, backgroundColor: 'white', padding: '1rem', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem', boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)', maxHeight: '16rem', overflowY: 'auto' }}>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Select Optimal Route:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {routes.map((route) => {
                const colors = getColors(route.color);
                return (
                  <button
                    key={route.id}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: `2px solid ${route.isSelected ? colors.border : '#e5e7eb'}`,
                      backgroundColor: route.isSelected ? '#eef2ff' : 'white',
                      boxShadow: route.isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => handleRouteSelect(route.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div style={{ padding: '0.375rem', borderRadius: '9999px', backgroundColor: colors.bg, marginRight: '0.75rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                          <route.icon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: '#374151',
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {route.label.split('(')[0].trim()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{route.segment.distance} / {route.segment.duration}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', flexShrink: 0, marginLeft: '0.5rem' }}>
                        {route.score}<span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#6b7280' }}>/100</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;