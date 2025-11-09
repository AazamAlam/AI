import { Route } from '../types';
import { IconNavigation, IconClock, IconShield } from '../icons';

export const mockRoutesData: Route[] = [
  {
    id: 'A',
    score: 92,
    label: 'Most Accessible (Lowest steps/ramps)',
    icon: IconNavigation,
    color: 'bg-green-500',
    borderColor: 'border-green-500',
    isSelected: false,
    directionsResult: null,  // <--- Add this line to every mock route object
    segment: {
      points: [
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
    label: 'Fastest (Walking Route)',
    icon: IconClock,
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
    directionsResult: null, // <--- Add this line to every mock route object
    isSelected: false,
    segment: {
      points: [
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
    directionsResult: null, // <--- Add this line to every mock route object
    isSelected: false,
    segment: {
      points: [
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