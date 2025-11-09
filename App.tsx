import React, { useState } from 'react';
import { Location, Route } from './types';
import { MapView } from './components/MapView';
import { Sidebar } from './components/Sidebar';
import { RouteList } from './components/RouteList';
import { IconMapPin } from './icons';
import { geocodeLocation } from './utils/geocoding';
import { getWalkingDirections } from './utils/directions';
import { mockRoutesData } from './constants/mockData';

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
      const leg = mainRoute.legs[0];

      // 3. Extract necessary data
      const walkingDistance = leg.distance.text;
      const walkingDuration = leg.duration.text;

      // 4. Update state with newly geocoded coordinates
      setStartLocation({ name: startLocationName, coords: startCoords });
      setEndLocation({ name: endLocationName, coords: endCoords });

      // 5. Update mock routes, assigning the REAL walking data to the 'B' route
      const updatedRoutes = mockRoutesData.map(route => {
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
          return {
            ...baseRoute,
            segment: {
              ...baseRoute.segment,
              distance: walkingDistance,
              duration: walkingDuration
            },
            directionsResult: directionsResponse,
            isSelected: true,
            label: `Fastest (Walking Route: ${walkingDuration})`
          };
        } else if (route.id === 'A') {
          return {
            ...baseRoute,
            label: 'Most Accessible (Lowest steps/ramps)',
          };
        } else if (route.id === 'C') {
          return {
            ...baseRoute,
            label: 'Safest at Night (High lighting)',
          };
        }
        return baseRoute;
      });
      
      setRoutes(updatedRoutes);
      setSelectedRouteId('B');

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
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      height: '100vh', 
      width: '100%', 
      backgroundColor: '#f3f4f6', 
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif' 
    }}>
      
      {/* Sidebar (Desktop Only) */}
      {!isMobile && (
        <Sidebar
          startLocationName={startLocationName}
          endLocationName={endLocationName}
          onStartLocationChange={setStartLocationName}
          onEndLocationChange={setEndLocationName}
          onSearch={handleSearch}
          isLoading={isLoading}
          geocodeError={geocodeError}
          routes={routes}
          onRouteSelect={handleRouteSelect}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <div style={{ 
          width: '100%', 
          padding: '1.5rem', 
          backgroundColor: 'white', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
          zIndex: 20 
        }}>
          <Sidebar
            startLocationName={startLocationName}
            endLocationName={endLocationName}
            onStartLocationChange={setStartLocationName}
            onEndLocationChange={setEndLocationName}
            onSearch={handleSearch}
            isLoading={isLoading}
            geocodeError={geocodeError}
            routes={null}
            onRouteSelect={handleRouteSelect}
          />
        </div>
      )}

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
          <div style={{ 
            position: 'absolute', 
            top: '1rem', 
            left: '1rem', 
            padding: '0.75rem', 
            zIndex: 10, 
            color: 'white' 
          }}>
            <p style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              padding: '0.5rem', 
              borderRadius: '0.75rem', 
              backgroundColor: 'rgba(31, 41, 55, 0.8)', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
              margin: 0 
            }}>
              <IconMapPin style={{ 
                display: 'inline', 
                width: '1rem', 
                height: '1rem', 
                marginRight: '0.25rem', 
                color: '#60a5fa', 
                verticalAlign: 'middle' 
              }} /> Start: {startLocation.name}
              <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>/</span>
              <IconMapPin style={{ 
                display: 'inline', 
                width: '1rem', 
                height: '1rem', 
                marginRight: '0.25rem', 
                color: '#f87171', 
                verticalAlign: 'middle' 
              }} /> End: {endLocation.name}
            </p>
          </div>
        )}
        
        {/* Floating Route Selector (Mobile) */}
        {routes && isMobile && (
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            width: '100%', 
            zIndex: 20, 
            backgroundColor: 'white', 
            padding: '1rem', 
            borderTopLeftRadius: '0.75rem', 
            borderTopRightRadius: '0.75rem', 
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)', 
            maxHeight: '16rem', 
            overflowY: 'auto' 
          }}>
            <p style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '0.75rem', 
              borderBottom: '1px solid #e5e7eb', 
              paddingBottom: '0.5rem' 
            }}>
              Select Optimal Route:
            </p>
            <RouteList routes={routes} onRouteSelect={handleRouteSelect} isMobile={true} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;