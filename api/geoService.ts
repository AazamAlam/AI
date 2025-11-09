// src/api/geoService.ts

import { Coordinates } from '../types';

/**
 * Helper function to ensure Google Maps objects are available globally.
 */
const getGoogle = () => {
    const google = (window as any).google;
    if (!google?.maps) {
        // In a real app, this would check if the API is loaded.
        // For the hackathon environment, we assume it loads on startup.
        throw new Error('Google Maps API not yet loaded.');
    }
    return google;
};

/**
 * Geocodes a location name to coordinates.
 */
export const geocodeLocation = (locationName: string): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
        const google = getGoogle();
        const geocoder = new google.maps.Geocoder();
        const maxRetries = 3;
        let attempt = 0;

        const attemptGeocode = () => {
            geocoder.geocode({ address: locationName }, (results: any, status: any) => {
                // ... (Geocoding logic remains the same)
                if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
                    const lat = results[0].geometry.location.lat();
                    const lng = results[0].geometry.location.lng();
                    resolve({ lat, lng });
                } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT && attempt < maxRetries) {
                    attempt++;
                    const delay = Math.pow(2, attempt) * 1000;
                    setTimeout(attemptGeocode, delay);
                } else {
                    reject(`Could not find coordinates for "${locationName}". Status: ${status}`);
                }
            });
        };
        attemptGeocode();
    });
};

/**
 * Requests walking directions between two points.
 */
export const getWalkingDirections = (origin: Coordinates, destination: Coordinates): Promise<any> => {
    const google = getGoogle();
    const service = new google.maps.DirectionsService();

    return new Promise((resolve, reject) => {
        service.route({
            origin: origin,
            destination: destination,
            travelMode: 'WALKING' as any,
            provideRouteAlternatives: true,
        }, (response: any, status: any) => {
            if (status === google.maps.DirectionsStatus.OK) {
                resolve(response);
            } else {
                reject(`Directions request failed. Status: ${status}`);
            }
        });
    });
};

/**
 * Calculates elevation data along a polyline path for accessibility scoring.
 */
export const getElevationData = (path: Coordinates[]): Promise<any> => {
    const google = getGoogle();
    const service = new google.maps.ElevationService();
    
    // Convert generic Coordinates to google.maps.LatLng objects
    const googlePath = path.map(c => new google.maps.LatLng(c.lat, c.lng));

    return new Promise((resolve, reject) => {
        service.getElevationAlongPath({
            path: googlePath,
            samples: 256, // Request 256 samples for detailed terrain data
        }, (results: any, status: any) => {
            if (status === google.maps.ElevationStatus.OK) {
                resolve(results);
            } else {
                reject(`Elevation request failed. Status: ${status}`);
            }
        });
    });
};