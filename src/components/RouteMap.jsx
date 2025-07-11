import React from 'react';
import { useBooking } from '../context/BookingContext';
import { GoogleMap, useLoadScript, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';

const apiKey = import.meta.env.VITE_API_KEY;
// console.log(apiKey);

const MapWrapper = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  if (!isLoaded) return <div>Loading map...</div>;
  return <RouteMap />;
};

const RouteMap = () => {
  const { pickup, delivery, extraStops, journey, setJourney } = useBooking();
  const [directions, setDirections] = React.useState(null);
  const [directionsRequested, setDirectionsRequested] = React.useState(false);

  const directionsCallback = React.useCallback((response) => {
    if (response !== null && response.status === 'OK' && !directionsRequested) {
      setDirections(response);
      setDirectionsRequested(true);
      
      // Calculate total distance and duration from all legs
      let totalDistance = 0;
      let totalDurationValue = 0;
      let totalDistanceText = '';
      let totalDurationText = '';
      
      if (response.routes[0] && response.routes[0].legs) {
        response.routes[0].legs.forEach(leg => {
          totalDistance += leg.distance.value;
          totalDurationValue += leg.duration.value;
        });
        
        // Convert to readable format
        totalDistanceText = `${(totalDistance / 1609.34).toFixed(1)} mi`;
        
        // Convert seconds to hours and minutes
        const hours = Math.floor(totalDurationValue / 3600);
        const minutes = Math.floor((totalDurationValue % 3600) / 60);
        totalDurationText = hours > 0 ? 
          `${hours} hr ${minutes} min` : 
          `${minutes} min`;
      }
      
      // Update journey context with actual distance/duration
      setJourney(prev => ({
        ...prev,
        distance: totalDistanceText,
        duration: totalDurationText,
        route: response.request
      }));
    }
  }, [directionsRequested, setJourney]);

  // Create waypoints from extra stops
  const waypoints = React.useMemo(() => {
    return extraStops.map(stop => ({
      location: stop.address,
      stopover: true
    }));
  }, [extraStops]);

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
      {/* Map Container */}
      <div className="bg-white p-1 rounded-b-2xl">
        <div className="relative h-40 rounded-lg overflow-hidden shadow border border-gray-100">
          <GoogleMap
            zoom={12}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: 51.50600, lng: -0.12844}}
          >
            {pickup.location && delivery.location && (
              <DirectionsService
                options={{
                  destination: delivery.location,
                  origin: pickup.location,
                  waypoints: waypoints,
                  optimizeWaypoints: true,
                  travelMode: 'DRIVING',
                }}
                callback={directionsCallback}
              />
            )}
            {directions && (
              <DirectionsRenderer
                options={{
                  directions: directions,
                  suppressMarkers: false,
                }}
              />
            )}
            {!directions && pickup.location && (
              <Marker
                position={pickup.location}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  labelOrigin: { x: 15, y: -10 }
                }}
                label={{ text: "Pickup", color: "green", fontWeight: "bold" }}
              />
            )}
            {!directions && delivery.location && (
              <Marker
                position={delivery.location}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  labelOrigin: { x: 15, y: -10 }
                }}
                label={{ text: "Delivery", color: "red", fontWeight: "bold" }}
              />
            )}
            {!directions && extraStops.map((stop, index) => (
              stop.address && (
                <Marker
                  key={`stop-${index}`}
                  position={stop.address}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    labelOrigin: { x: 15, y: -10 }
                  }}
                  label={{ text: `Stop ${index + 1}`, color: "blue", fontWeight: "bold" }}
                />
              )
            ))}
          </GoogleMap>
        </div>
      </div>
      {/* Info Bar */}
      <div className="flex justify-between items-center text-xs font-medium p-2 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="bg-gray-200 text-black px-2 py-0.5 rounded-full shadow-inner">{journey.distance}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="bg-gray-200 text-black px-2 py-0.5 rounded-full shadow-inner">{journey.duration}</span>
        </div>
      </div>
    </div>
  );
};

export default MapWrapper;