import React, { useEffect } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import styles from '../Modals.module.css';
import customMapStyle from './lockMapStyle';

const containerStyle = {
  width: '100%',
  height: '300px',
};

const MapComponent = ({ isLoaded, mapCenter, marker, onMapClick, mapRef }) => {
  useEffect(() => {
    if (marker && window.google?.maps?.marker && mapRef.current) {
      const m = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: marker,
        title: "Selected Location",
      });
    }
  }, [marker, mapRef]);

  return (
    <div className={styles.mapPlaceholder}>
      <div className={styles.map}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={marker ? 15 : 4}
            onClick={onMapClick}
            onLoad={(map) => (mapRef.current = map)}
            options={{ styles: customMapStyle, disableDefaultUI: false }}
          />
        ) : (
          <p>Loading map...</p>
        )}
      </div>
    </div>
  );
};

export default MapComponent;