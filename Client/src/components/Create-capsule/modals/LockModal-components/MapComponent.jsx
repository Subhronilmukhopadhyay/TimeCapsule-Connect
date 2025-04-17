import React, { useEffect, useMemo, useRef } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import styles from '../Modals.module.css';
import customMapStyle from './lockMapStyle';

const containerStyle = {
  width: '100%',
  height: '300px',
};

const MapComponent = ({ isLoaded, mapCenter, marker, onMapClick, mapRef }) => {
  const markerRef = useRef(null);
  
  // Memoize options to prevent re-renders
  const mapOptions = useMemo(() => ({
    styles: customMapStyle,
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    mapId: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  }), []);

  // Handle the advanced marker creation and cleanup
  useEffect(() => {
    let advancedMarker;
  
    const loadAdvancedMarker = async () => {
      if (isLoaded && mapRef.current && marker) {
        // Clean up any existing marker
        if (markerRef.current) {
          markerRef.current.map = null;
        }
  
        try {
          // Dynamically import the 'marker' library
          const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
  
          if (AdvancedMarkerElement) {
            advancedMarker = new AdvancedMarkerElement({
              map: mapRef.current,
              position: marker,
              title: "Selected Location"
            });
  
            markerRef.current = advancedMarker;
          }
        } catch (error) {
          console.error('Error loading AdvancedMarkerElement:', error);
        }
      }
    };
  
    loadAdvancedMarker();
  
    return () => {
      // Clean up on unmount
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [isLoaded, marker, mapRef]);  

  if (!isLoaded) {
    return (
      <div className={styles.mapPlaceholder}>
        <div className={styles.map}>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapPlaceholder}>
      <div className={styles.map}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={marker ? 15 : 4}
          onClick={onMapClick}
          onLoad={(map) => (mapRef.current = map)}
          options={mapOptions}
        >
          {/* The marker is now handled in the useEffect hook */}
        </GoogleMap>
      </div>
    </div>
  );
};

export default React.memo(MapComponent);