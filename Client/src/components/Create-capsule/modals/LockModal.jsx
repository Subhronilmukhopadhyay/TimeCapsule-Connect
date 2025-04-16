import React, { useState, useCallback, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { lockCapsule, saveCapsule } from '../../../services/capsule-storage';
import DateSelector from './LockModal-components/DateSelector';
import LocationInput from './LockModal-components/LocationInput';
import MapComponent from './LockModal-components/MapComponent';
import styles from './Modals.module.css';
  
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const LockModal = ({ onClose, content, title }) => {
  const [lockDate, setLockDate] = useState('');
  const [lockLocation, setLockLocation] = useState('');
  const [marker, setMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarker({ lat, lng });
    setMapCenter({ lat, lng });

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setLockLocation(results[0].formatted_address);
      } else {
        setLockLocation(`${lat}, ${lng}`);
      }
    });
  }, []);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setLockLocation(place.formatted_address);
      setMarker({ lat, lng });
      setMapCenter({ lat, lng });
    }
  };

  const useCurrentLocation = () => {
    navigator.geolocation?.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setMarker({ lat, lng });
      setMapCenter({ lat, lng });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setLockLocation(results[0].formatted_address);
        } else {
          setLockLocation(`${lat}, ${lng}`);
        }
      });
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const capsuleId = saveCapsule(title, content);
    const lockSettings = {
      lockDate,
      lockLocation: lockLocation || (marker ? `${marker.lat}, ${marker.lng}` : ''),
      coordinates: marker,
      createdAt: new Date().toISOString(),
    };
    lockCapsule(capsuleId, lockSettings);
    alert('Your TimeCapsule has been successfully locked!');
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Lock TimeCapsule</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.lockOptions}>
              <h3>Lock Configuration</h3>
              <DateSelector lockDate={lockDate} setLockDate={setLockDate} />
              <LocationInput
                isLoaded={isLoaded}
                autocompleteRef={autocompleteRef}
                lockLocation={lockLocation}
                setLockLocation={setLockLocation}
                useCurrentLocation={useCurrentLocation}
                handlePlaceChanged={handlePlaceChanged}
              />
              <MapComponent
                isLoaded={isLoaded}
                mapCenter={mapCenter}
                marker={marker}
                onMapClick={onMapClick}
                mapRef={mapRef}
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.primaryBtn}>Lock Capsule</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockModal;