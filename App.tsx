import React, { useState } from 'react';
import { Route, Location, Coordinates } from './types'; 
import { geocodeLocation, getWalkingDirections, getElevationData } from './api/geoService';
import { generateRoutes, calculateAccessibilityCost } from './data/routeGenerator';
import { IconMapPin, IconSearch } from './data/icons'; // Import only required UI icons
import { buildAccessibleGraph } from './ai/graphConstructor'; 
import { AStarSearch } from './ai/astarSolver';


// --- Mock MapView and Color Helper (For stand-alone environment) ---
// In a real project, MapView would be a separate component file.
const MapView = (props: any) => <div style={{height:'100%', width: '100%', backgroundColor: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#00796b'}}>Map Area (Showing Route {props.selectedRouteColor})</div>;

const getColors = (color: string) => {
  // Simplified color mapper for button styling
  if (color.includes('green')) return { bg: '#10b981', border: '#059669' };
  if (color.includes('blue')) return { bg: '#3b82f6', border: '#2563eb' };
  if (color.includes('purple')) return { bg: '#8b5cf6', border: '#7c3aed' };
  return { bg: '#4f46e5', border: '#4338ca' };
};
// --------------------------------------------------------------------

const App: React.FC = () => {
    const [startLocationName, setStartLocationName] = useState<string>('NYU');
    const [endLocationName, setEndLocationName] = useState<string>('Central Park');
    const [startLocation, setStartLocation] = useState<Location>({ name: 'NYU', coords: { lat: 40.7291, lng: -73.9965 } });
    const [endLocation, setEndLocation] = useState<Location>({ name: 'Central Park', coords: { lat: 40.7851, lng: -73.9683 } });
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
            // 1. Geocode locations
            const [startCoords, endCoords] = await Promise.all([
                geocodeLocation(startLocationName),
                geocodeLocation(endLocationName)
            ]);

            // 2. Get Fastest Walking Directions (Blue Route Base)
            const directionsResponse = await getWalkingDirections(startCoords, endCoords);
            const mainRoute = directionsResponse.routes[0];
            const leg = mainRoute.legs[0]; 

            // 3. Build the Searchable Graph
            const graph = buildAccessibleGraph(directionsResponse);
            const startId = `${startCoords.lat.toFixed(6)},${startCoords.lng.toFixed(6)}`;
            const endId = `${endCoords.lat.toFixed(6)},${endCoords.lng.toFixed(6)}`;

            // 4. Run A* Search for Accessible Route (Green Route)
            const aStarResult = AStarSearch(graph, startId, endId);
            
            // 5. Calculate Accessibility Score for the FASTEST path (for comparison)
            const fastestPathCoords = mainRoute.overview_path.map((p: any) => ({ lat: p.lat(), lng: p.lng() }));
            const elevationResults = await getElevationData(fastestPathCoords); // Used for base scoring
            const totalDistanceMeters = leg.distance.value; 
            const baseAccessibilityCost = calculateAccessibilityCost(elevationResults, totalDistanceMeters);
            
            // 6. Generate the Routes with A* data
            const updatedRoutes = generateRoutes(
                startCoords, 
                endCoords, 
                directionsResponse, 
                baseAccessibilityCost, 
                aStarResult // Pass the A* result to update the Green Route
            );
            
            setRoutes(updatedRoutes);
            setSelectedRouteId('B'); 

        } catch (error) {
            // ... (Error handling)
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
    const selectedDirectionsResult = selectedRoute?.directionsResult;
    const selectedRouteColor = selectedRoute?.color || 'bg-indigo-600';

    return (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', width: '100%', backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Sidebar (Simplified) */}
            <div style={{ width: isMobile ? '100%' : '320px', padding: '1.5rem', backgroundColor: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', zIndex: 20, flexShrink: 0, overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <IconMapPin style={{ color: '#4f46e5', width: '1.5rem', height: '1.5rem' }}/>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>Smart Route Planner</h1>
                </div>
                
                {/* Location Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <input type="text" placeholder="Start Location (NYU)" value={startLocationName} onChange={(e) => setStartLocationName(e.target.value)} disabled={isLoading} style={{padding: '0.5rem', border: '1px solid #d1d5db'}} />
                    <input type="text" placeholder="Destination (Central Park)" value={endLocationName} onChange={(e) => setEndLocationName(e.target.value)} disabled={isLoading} style={{padding: '0.5rem', border: '1px solid #d1d5db'}} />
                </div>

                {/* Search Button */}
                <button onClick={handleSearch} disabled={isLoading} style={{width: '100%', padding: '0.625rem', backgroundColor: isLoading ? '#818cf8' : '#4f46e5', color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer'}}>
                    {isLoading ? 'Searching...' : <><IconSearch style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', display: 'inline' }} /> Search Optimal Routes</>}
                </button>

                {/* Route Selector Display */}
                {routes && (
                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                        <p style={{ fontWeight: '600' }}>Routes Found:</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {routes.map((route) => {
                                const colors = getColors(route.color);
                                return (
                                    <button
                                        key={route.id}
                                        onClick={() => handleRouteSelect(route.id)}
                                        style={{
                                            textAlign: 'left',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: `2px solid ${route.isSelected ? colors.border : '#e5e7eb'}`,
                                            backgroundColor: route.isSelected ? '#eef2ff' : 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ fontWeight: '700', color: '#1f2937' }}>
                                            {route.label.split('(')[0].trim()} ({route.score}/100)
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {route.segment.distance} / {route.segment.duration}
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
            </div>
        </div>
    );
};

export default App;