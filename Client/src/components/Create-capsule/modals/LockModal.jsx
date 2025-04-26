import React, { useState, useCallback, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { saveCapsule, lockCapsule } from '../../../services/capsule-storage';
import { useEditor } from '../../../services/EditorContext';
import DateSelector from './LockModal-components/DateSelector';
import LocationInput from './LockModal-components/LocationInput';
import MapComponent from './LockModal-components/MapComponent';
import styles from './Modals.module.css';

const libraries = ['places'];
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const LockModal = ({ onClose }) => {
  const { capsuleId, capsuleTitle, value, createCapsule } = useEditor();
  
  const [lockDate, setLockDate] = useState('');
  const [lockLocation, setLockLocation] = useState('');
  const [marker, setMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapRef = useRef(null);
  const placeAutocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapClick = useCallback((event) => {
    try {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarker({ lat, lng });
      setMapCenter({ lat, lng });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setLockLocation(results[0].formatted_address);
        } else {
          setLockLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      });
    } catch (err) {
      setError('Failed to set location from map click');
      console.error('Error setting location from map:', err);
    }
  }, []);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMarker({ lat, lng });
        setMapCenter({ lat, lng });

        if (isLoaded && window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              setLockLocation(results[0].formatted_address);
            } else {
              setLockLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          });
        }
      },
      (err) => {
        setError(`Error getting current location: ${err.message}`);
        console.error('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [isLoaded]);

  const handlePlaceSelected = useCallback((place) => {
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setLockLocation(place.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setMarker({ lat, lng });
      setMapCenter({ lat, lng });
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!lockDate) {
      setError('Please select an unlock date');
      return;
    }
    
    if (!lockLocation && !marker) {
      setError('Please set an unlock location');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      let id = capsuleId;
      if (!id) {
        id = await createCapsule();
        if (!id) {
          throw new Error('Failed to save capsule');
        }
      } else {
        await saveCapsule(capsuleTitle, value, capsuleId);
      }
      
      const lockSettings = {
        lockDate,
        lockLocation: lockLocation || (marker ? `${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}` : ''),
        coordinates: marker,
        createdAt: new Date().toISOString(),
      };
      
      await lockCapsule(id, lockSettings);
      
      alert('Your TimeCapsule has been successfully locked!');
      
      window.location.href = '/my-capsules';
    } catch (err) {
      setError('Failed to lock the capsule. Please try again.');
      console.error('Error locking capsule:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [lockDate, lockLocation, marker, capsuleId, capsuleTitle, value, createCapsule]);

  if (loadError) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>Error Loading Map</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
          <div className={styles.modalBody}>
            <p>Failed to load Google Maps. Please try again later.</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.secondaryBtn} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Lock TimeCapsule</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.lockOptions}>
              <h3>Lock Configuration</h3>
              <DateSelector lockDate={lockDate} setLockDate={setLockDate} />
              <LocationInput
                isLoaded={isLoaded}
                lockLocation={lockLocation}
                setLockLocation={setLockLocation}
                useCurrentLocation={useCurrentLocation}
                onPlaceSelected={handlePlaceSelected}
                placeAutocompleteRef={placeAutocompleteRef}
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
            <button 
              type="button" 
              className={styles.secondaryBtn} 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.primaryBtn} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Locking...' : 'Lock Capsule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockModal;