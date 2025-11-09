
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  name: string;
  coords: Coordinates;
}

export interface RouteSegment {
  points: Coordinates[];
  distance: string;
  duration: string;
}

export interface Route {
  id: string;
  score: number;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  borderColor: string;
  isSelected: boolean;
  segment: RouteSegment;
  directionsResult?: any; // google.maps.DirectionsResult type - OPTIONAL
}