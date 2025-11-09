// src/ai/graphConstructor.ts

import { Coordinates } from '../types';
import { calculateAccessibilityCost } from '../data/routeGenerator'; // We'll assume this is updated later


export interface Node {
    id: string;
    coords: Coordinates;
}

export interface Edge {
    targetId: string; // The Node ID this edge connects to
    distanceMeters: number;
    durationSeconds: number;
    // --- Custom AI Cost Feature ---
    accessibilityCost: number; 
    // ----------------------------
}

export interface SearchGraph {
    [nodeId: string]: {
        node: Node;
        edges: Edge[];
    };
}

/**
 * Creates a unique ID for a coordinate pair (simple hash for nodes).
 */
const getCoordId = (coords: Coordinates): string => 
    `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

/**
 * Generates a searchable graph from the Google Directions Steps.
 * NOTE: For the hackathon, we only build a graph of the FASTEST path
 * and its immediate alternatives to simplify the search space.
 */
export const buildAccessibleGraph = (directionsResponse: any): SearchGraph => {
    const graph: SearchGraph = {};
    const route = directionsResponse.routes[0];
    const leg = route.legs[0];

    // Iterate through each 'step' (road segment) provided by Google
    for (let i = 0; i < leg.steps.length; i++) {
        const step = leg.steps[i];
        
        // Start Node of the Step
        const startCoords: Coordinates = { 
            lat: step.start_location.lat(), 
            lng: step.start_location.lng() 
        };
        const startId = getCoordId(startCoords);

        // End Node of the Step
        const endCoords: Coordinates = { 
            lat: step.end_location.lat(), 
            lng: step.end_location.lng() 
        };
        const endId = getCoordId(endCoords);

        // --- 1. Calculate Custom Accessibility Cost for the Edge (Simplification) ---
        // In a full implementation, you'd call an API here to get elevation 
        // and OSM data for this specific step/segment. 
        // For the hackathon demo, we mock the cost for alternative segments 
        // to force the A* search to reroute.

        const isSteepOrStairs = Math.random() < 0.2; // 20% chance of being "bad"
        const mockAccessibilityCost = isSteepOrStairs ? 5000 : 100; // Heavy penalty for bad sections

        const newEdge: Edge = {
            targetId: endId,
            distanceMeters: step.distance.value,
            durationSeconds: step.duration.value,
            accessibilityCost: mockAccessibilityCost, // This is the AI cost feature
        };

        // --- 2. Add Nodes and Edges to the Graph ---
        if (!graph[startId]) {
            graph[startId] = {
                node: { id: startId, coords: startCoords },
                edges: []
            };
        }
        graph[startId].edges.push(newEdge);

        // Ensure the end node exists, even if it has no outgoing edges yet
        if (!graph[endId]) {
            graph[endId] = {
                node: { id: endId, coords: endCoords },
                edges: []
            };
        }
    }
    return graph;
};