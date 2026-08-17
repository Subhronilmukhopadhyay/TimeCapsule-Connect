import React, { useEffect, useMemo, useRef } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import styles from '../Modals.module.css';
import customMapStyle from './lockMapStyle';

const containerStyle = {
  width: '100%',
  height: '300px',
};

/**
 * `AdvancedMarkerElement` only renders on a map created with a Map ID. Google
 * publishes DEMO_MAP_ID for development so the marker still shows up when the
 * project has not configured a real one yet.
 */
const MAP_ID = import.meta.env.VITE_MAP_ID || 'DEMO_MAP_ID';

const MapComponent = ({ isLoaded, mapCenter, marker, onMapClick, mapRef }) => {
  const markerRef = useRef(null);

  // A map created with a mapId is styled in the cloud console, and passing
  // `styles` alongside it is ignored with a console warning. Only send the
  // local style array when we are not using a cloud-styled map.
  const mapOptions = useMemo(
    () => ({
      ...(MAP_ID === 'DEMO_MAP_ID' ? { styles: customMapStyle } : {}),
      mapId: MAP_ID,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      clickableIcons: false,
    }),
    []
  );

  // Create the advanced marker once, then just move it as the selection changes.
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    let cancelled = false;

    const syncMarker = async () => {
      // No selection yet: drop any marker that is still on the map.
      if (!marker) {
        if (markerRef.current) {
          markerRef.current.map = null;
          markerRef.current = null;
        }
        return;
      }

      try {
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
        if (cancelled || !mapRef.current) return;

        if (markerRef.current) {
          markerRef.current.position = marker;
          markerRef.current.map = mapRef.current;
        } else {
          markerRef.current = new AdvancedMarkerElement({
            map: mapRef.current,
            position: marker,
            title: 'Unlock location',
          });
        }
      } catch (error) {
        console.error('Error loading AdvancedMarkerElement:', error);
      }
    };

    syncMarker();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, marker, mapRef]);

  // Detach the marker only when the map itself goes away.
  useEffect(
    () => () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    },
    []
  );

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
          onUnmount={() => (mapRef.current = null)}
          options={mapOptions}
        >
          {/* Marker is an AdvancedMarkerElement managed in the effect above. */}
        </GoogleMap>
      </div>
    </div>
  );
};

export default React.memo(MapComponent);
