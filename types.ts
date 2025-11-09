// src/types.ts

// Basic geographical coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// User-defined location with a name
export interface Location {
  name: string;
  coords: Coordinates;
}

// Data structure for a single route segment
export interface RouteSegment {
  points: Coordinates[];
  distance: string;
  duration: string;
}

// Full Route structure for display and map rendering
export interface Route {
  id: string; // 'A' (Accessible), 'B' (Fastest), 'C' (Safest)
  score: number; // Score out of 100
  label: string;
  icon: React.FC<any>;
  color: string; // Tailwind class (e.g., 'bg-green-500')
  borderColor: string;
  isSelected: boolean;
  segment: RouteSegment;
  directionsResult: any | null; // Full Google Directions response for the map renderer
}

export interface AStarResult {
    path: Coordinates[]; // The actual geometry found by A*
    totalTime: number; // The total time of the A* path (in minutes)
    totalAccessibleCost: number; // The sum of raw accessibility costs along the path
}