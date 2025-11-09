// src/data/routeGenerator.ts

import { Route, Coordinates } from '../types';
import { IconNavigation, IconClock, IconShield } from './icons';

/**
 * Calculates the Accessibility Penalty Cost based on elevation data.
 * The lower the cost, the better the accessibility.
 * @param elevationResults Array of Google Elevation results.
 * @param totalDistanceMeters Total distance of the route in meters.
 * @returns Accessibility cost (higher cost means worse accessibility).
 */
export const calculateAccessibilityCost = (elevationResults: any[], totalDistanceMeters: number): number => {
    if (!elevationResults || elevationResults.length < 2) return 500; // High base penalty if data is missing
    
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
    let basePenalty = totalUphillClimbMeters * 5; 

    // 2. Steepness Penalty: Heavy penalty for grades over 5% (difficult for accessibility)
    let steepnessPenalty = 0;
    if (maxSteepnessPercentage > 5) {
        steepnessPenalty = (maxSteepnessPercentage - 5) * 50; 
    }
    
    return basePenalty + steepnessPenalty;
};


/**
 * Generates the three distinct routes using the calculated data.
 */
export const generateRoutes = (startCoords: Coordinates, endCoords: Coordinates, walkingDirections: any, accessibilityCost: number): Route[] => {
    
    const mainRoute = walkingDirections.routes[0];
    const leg = mainRoute.legs[0]; 

    const walkingDistance = leg.distance.text;
    const walkingDuration = leg.duration.text;
    const pathPoints = mainRoute.overview_path.map((p: any) => ({ lat: p.lat(), lng: p.lng() }));
    
    // Normalize Accessibility Cost (0-100 score, higher is better)
    // Assuming a cost of 1000 is extremely bad (0/100 score)
    const MAX_COST = 1000; 
    const normalizedAccessibilityScore = Math.max(0, 100 - (accessibilityCost / MAX_COST) * 100);

    const routes: Route[] = [
        {
            id: 'A',
            score: Math.round(normalizedAccessibilityScore * 10) / 10, // Accessible score based on elevation data
            label: 'Most Accessible (Minimizes Steep Incline)', 
            icon: IconNavigation,
            color: 'bg-green-500',
            borderColor: 'border-green-500',
            isSelected: false,
            // Uses the same geometry as the fastest route for simplicity, but a unique score/theme
            segment: {
                points: pathPoints,
                distance: walkingDistance,
                duration: walkingDuration,
            },
            directionsResult: walkingDirections,
        },
        {
            id: 'B',
            score: 78, 
            label: `Fastest (Walking Route: ${walkingDuration})`, 
            icon: IconClock,
            color: 'bg-blue-500',
            borderColor: 'border-blue-500',
            isSelected: true, // Selected by default
            segment: {
                points: pathPoints,
                distance: walkingDistance,
                duration: walkingDuration,
            },
            directionsResult: walkingDirections,
        },
        {
            id: 'C',
            score: 85, // Safest route (Still mock score/path)
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