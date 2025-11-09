import { Coordinates } from '../types';

export const getDirectionsService = () => {
  const google = (window as any).google;
  if (google?.maps && google.maps.DirectionsService) {
    return new google.maps.DirectionsService();
  }
  return null;
};

export const getWalkingDirections = (origin: Coordinates, destination: Coordinates): Promise<any> => {
  const service = getDirectionsService();
  if (!service) {
    return Promise.reject('Directions Service not loaded.');
  }
  
  return new Promise((resolve, reject) => {
    service.route({
      origin: origin,
      destination: destination,
      travelMode: 'WALKING' as any,
      provideRouteAlternatives: true,
    }, (response: any, status: any) => {
      const google = (window as any).google;
      if (status === google.maps.DirectionsStatus.OK) {
        resolve(response);
      } else {
        reject(`Directions request failed. Status: ${status}`);
      }
    });
  });
};