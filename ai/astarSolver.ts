// src/ai/astarSolver.ts

import { SearchGraph, Edge } from './graphConstructor';
import { Coordinates } from '../types';


/**
 * Heuristic function: Euclidean (straight-line) distance between two points.
 * A* uses this to estimate the remaining cost to the goal.
 */
const heuristic = (start: Coordinates, end: Coordinates): number => {
    // Simple degree difference (approximating distance)
    const dLat = end.lat - start.lat;
    const dLng = end.lng - start.lng;
    // We use this difference as the heuristic value.
    return Math.sqrt(dLat * dLat + dLng * dLng) * 10000; 
};

/**
 * Runs the A* search on the graph using the custom cost function.
 */
export const AStarSearch = (
    graph: SearchGraph, 
    startId: string, 
    endId: string
): { path: Coordinates[], totalTime: number, totalAccessibleCost: number } | null => {

    // --- A* Data Structures ---
    // gScore: Cost from start along the cheapest path found so far.
    const gScore: { [key: string]: number } = {};
    gScore[startId] = 0;

    // fScore: Estimated total cost from start to goal through current node. f = g + h.
    const fScore: { [key: string]: number } = {};
    fScore[startId] = heuristic(graph[startId].node.coords, graph[endId].node.coords);

    // cameFrom: Used to reconstruct the final path.
    const cameFrom: { [key: string]: string } = {};

    // openSet: The set of nodes to be evaluated, prioritized by fScore.
    let openSet: string[] = [startId];
    
    // Custom Weights: The "AI" part that prioritizes Accessibility
    // We give a HUGE weight to the accessibility cost vs. time (1 time second = 1 cost unit)
    const TIME_WEIGHT = 1;
    const ACCESSIBILITY_WEIGHT = 50; 

    // --- Search Loop ---
    while (openSet.length > 0) {
        // Find the node in openSet with the lowest fScore (Priority Queue Pop)
        openSet.sort((a, b) => fScore[a] - fScore[b]);
        const currentId = openSet.shift()!;

        if (currentId === endId) {
            // Path found! Reconstruct and return.
            const pathData = reconstructPath(cameFrom, gScore, currentId, graph, ACCESSIBILITY_WEIGHT, TIME_WEIGHT);
            return pathData;
        }

        const current = graph[currentId];
        if (!current) continue;

        for (const edge of current.edges) {
            const neighborId = edge.targetId;
            const neighbor = graph[neighborId];
            if (!neighbor) continue;

            // --- 1. Calculate Tentative G Score (Custom Cost) ---
            const edgeAccessibleCost = edge.accessibilityCost * ACCESSIBILITY_WEIGHT;
            const edgeTimeCost = edge.durationSeconds * TIME_WEIGHT;
            const customEdgeCost = edgeAccessibleCost + edgeTimeCost;
            
            const tentative_gScore = gScore[currentId] + customEdgeCost;

            // 2. Check if this is a better path to the neighbor
            if (tentative_gScore < (gScore[neighborId] || Infinity)) {
                // This path is better. Record it.
                cameFrom[neighborId] = currentId;
                gScore[neighborId] = tentative_gScore;
                
                // 3. Update F Score
                fScore[neighborId] = tentative_gScore + heuristic(neighbor.node.coords, graph[endId].node.coords);
                
                // 4. Add neighbor to openSet if not already there
                if (!openSet.includes(neighborId)) {
                    openSet.push(neighborId);
                }
            }
        }
    }

    // No path found
    return null; 
};

/**
 * Helper to reconstruct the final path coordinates and total metrics.
 */
const reconstructPath = (cameFrom: { [key: string]: string }, gScore: { [key: string]: number }, currentId: string, graph: SearchGraph, ACCESSIBILITY_WEIGHT: number, TIME_WEIGHT: number) => {
    const path: Coordinates[] = [];
    let tempId = currentId;
    let totalTime = 0;
    let totalAccessibleCost = 0;

    // Walk backward from the end node using the cameFrom map
    while (cameFrom[tempId]) {
        const prevId = cameFrom[tempId];
        const prevNode = graph[prevId];
        
        // Find the edge that connects prevId to tempId to get the metrics
        const edge = prevNode.edges.find(e => e.targetId === tempId);
        
        if (edge) {
            totalTime += edge.durationSeconds;
            // The total accessible cost is the sum of raw accessibility costs
            totalAccessibleCost += edge.accessibilityCost; 
        }

        path.push(graph[tempId].node.coords);
        tempId = prevId;
    }

    path.push(graph[tempId].node.coords); // Add the start node
    path.reverse(); // Reverse to go from start to end

    return { path, totalTime: totalTime / 60, totalAccessibleCost }; // Return time in minutes
};