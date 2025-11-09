// src/data/routeGenerator.ts

import { Route, Coordinates, AStarResult } from '../types'; 
import { IconNavigation, IconClock, IconShield } from './icons'; 

/**
 * Calculates the Accessibility Penalty Cost based on elevation data.
 * NOTE: This function needs to be updated to accept and use OSM data for stairs/ramps 
 * for the next implementation phase. For now, it calculates the penalty based on incline.
 * @param elevationResults Array of Google Elevation results.
 * @param totalDistanceMeters Total distance of the route in meters.
 * @returns Accessibility cost (higher cost means worse accessibility).
 */
export const calculateAccessibilityCost = (elevationResults: any[], totalDistanceMeters: number): number => {
    if (!elevationResults || elevationResults.length < 2) return 500; 
    
    let totalUphillClimbMeters = 0;
    let maxSteepnessPercentage = 0;

    // Calculate total uphill climb and max steepness
    const distanceBetweenSamples = totalDistanceMeters / (elevationResults.length - 1);
    
    for (let i = 1; i < elevationResults.length; i++) {
        const prevElevation = elevationResults[i - 1].elevation;
        const currentElevation = elevationResults[i].elevation;
        const deltaElevation = currentElevation - prevElevation;

        // Sum up positive elevation changes
        if (deltaElevation > 0) {
            totalUphillClimbMeters += deltaElevation;
        }

        // Calculate steepness as grade percentage (rise/run * 100)
        const steepness = (Math.abs(deltaElevation) / distanceBetweenSamples) * 100;
        if (steepness > maxSteepnessPercentage) {
            maxSteepnessPercentage = steepness;
        }
    }
    
    // 1. Base Penalty: Penalty for every meter climbed (Uphill effort)
    // Weight the climb heavily
    let basePenalty = totalUphillClimbMeters * 5; 

    // 2. Steepness Penalty: Heavy penalty for grades over 5% (difficult for accessibility)
    let steepnessPenalty = 0;
    if (maxSteepnessPercentage > 5) {
        // Apply significant penalty for exceeding 5% grade
        steepnessPenalty = (maxSteepnessPercentage - 5) * 50; 
    }
    
    return basePenalty + steepnessPenalty;
};


/**
 * Generates the three distinct routes using the calculated data and the A* result.
 */
export const generateRoutes = (
    startCoords: Coordinates, 
    endCoords: Coordinates, 
    walkingDirections: any, 
    baseAccessibilityCost: number, // Cost of the fastest (Blue) route
    aStarResult: AStarResult | null // A* result for the accessible path
): Route[] => {
    
    const mainRoute = walkingDirections.routes[0];
    const leg = mainRoute.legs[0]; 

    const walkingDistance = leg.distance.text;
    const walkingDuration = leg.duration.text;
    const pathPoints = mainRoute.overview_path.map((p: any) => ({ lat: p.lat(), lng: p.lng() }));
    
    // --- 1. Scoring Logic ---

    // A. Score Normalization: Max cost dictates how bad 0/100 is.
    const MAX_COST = 1000; 
    
    // B. Score for the Fastest Route (Based on BASE COST)
    const baseNormalizedScore = Math.max(0, 100 - (baseAccessibilityCost / MAX_COST) * 100);

    // C. Data for the Accessible Route (Using A* result if available)
    let accessiblePathScore = baseNormalizedScore; 
    let accessiblePathDuration = walkingDuration;
    let accessiblePathPoints = pathPoints;
    let accessiblePathDirections = walkingDirections;
    
    if (aStarResult) {
        // Calculate the score for the A* path's raw cost
        const aStarCost = aStarResult.totalAccessibleCost;
        accessiblePathScore = Math.max(0, 100 - (aStarCost / MAX_COST) * 100);
        
        // Use the actual A* geometry and time
        accessiblePathDuration = `${aStarResult.totalTime.toFixed(0)} min`;
        accessiblePathPoints = aStarResult.path;
        accessiblePathDirections = null; // A* is custom, not from Google Directions
    }


    const routes: Route[] = [
        // --- A: GREEN ROUTE (Accessible - uses A* result) ---
        {
            id: 'A',
            score: Math.round(accessiblePathScore * 10) / 10,
            label: `Most Accessible (Time: ${accessiblePathDuration})`, 
            icon: IconNavigation,
            color: 'bg-green-500',
            borderColor: 'border-green-500',
            isSelected: false,
            segment: {
                points: accessiblePathPoints,
                distance: "N/A", // Custom path, distance is unknown without further calc
                duration: accessiblePathDuration,
            },
            directionsResult: accessiblePathDirections, 
        },
        
        // --- B: BLUE ROUTE (Fastest - uses Directions API) ---
        {
            id: 'B',
            score: 78, // Placeholder score for speed/efficiency
            label: `Fastest (Walking Route: ${walkingDuration})`, 
            icon: IconClock,
            color: 'bg-blue-500',
            borderColor: 'border-blue-500',
            isSelected: true,
            segment: {
                points: pathPoints,
                distance: walkingDistance,
                duration: walkingDuration,
            },
            directionsResult: walkingDirections,
        },
        
        // --- C: PURPLE ROUTE (Safest - Mock) ---
        {
            id: 'C',
            score: 85, // Mock safety score
            label: 'Safest at Night (High lighting)',
            icon: IconShield,
            color: 'bg-purple-500',
            borderColor: 'border-purple-500',
            isSelected: false,
            segment: {
                // Mocked path geometry for demonstration
                points: [startCoords, { lat: (startCoords.lat + endCoords.lat) / 2, lng: (startCoords.lng + endCoords.lng) / 2 - 0.01 }, endCoords],
                distance: '4.0 mi', 
                duration: '20 min'
            },
            directionsResult: null,
        },
    ];
    
    return routes;
};