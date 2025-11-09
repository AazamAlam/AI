import { Coordinates } from '../types';

export const geocodeLocation = (locationName: string): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google?.maps || !google.maps.Geocoder) {
      return reject('Google Maps Geocoder not yet loaded. Please wait for the map to fully initialize.');
    }

    const geocoder = new google.maps.Geocoder();
    const maxRetries = 3;
    let attempt = 0;

    const attemptGeocode = () => {
      geocoder.geocode({ address: locationName }, (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          resolve({ lat, lng });
        } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT && attempt < maxRetries) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.warn(`Query limit reached for ${locationName}. Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxRetries})...`);
          setTimeout(attemptGeocode, delay);
        } else {
          reject(`Could not find coordinates for "${locationName}". Status: ${status}`);
        }
      });
    };

    attemptGeocode();
  });
};