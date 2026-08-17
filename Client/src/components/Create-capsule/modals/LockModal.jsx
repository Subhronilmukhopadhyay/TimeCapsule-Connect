import React, { useState, useCallback, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { saveCapsule, lockCapsule } from '../../../services/capsule-storage';
import { useEditor } from '../../../services/EditorContext';
import DateSelector from './LockModal-components/DateSelector';
import LocationInput from './LockModal-components/LocationInput';
import MapComponent from './LockModal-components/MapComponent';
import styles from './Modals.module.css';

// 'marker' is needed for AdvancedMarkerElement, 'places' for PlaceAutocompleteElement.
const libraries = ['places', 'marker'];
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const LockModal = ({ onClose }) => {
  const { capsuleId, capsuleTitle, value, forceSave } = useEditor();
  
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
    // PlaceAutocompleteElement ships in the weekly channel.
    version: 'weekly',
  });

  /** Reverse-geocode a point, falling back to raw coordinates. */
  const resolveAddress = useCallback((lat, lng) => {
    if (!window.google?.maps?.Geocoder) {
      setLockLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setLockLocation(results[0].formatted_address);
      } else {
        setLockLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    });
  }, []);

  const onMapClick = useCallback(
    (event) => {
      try {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setMarker({ lat, lng });
        setMapCenter({ lat, lng });
        setError('');
        resolveAddress(lat, lng);
      } catch (err) {
        setError('Failed to set location from map click');
        console.error('Error setting location from map:', err);
      }
    },
    [resolveAddress]
  );

  const useCurrentLocation = useCallback(
    () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) {
          setError('Geolocation is not supported by your browser');
          resolve();
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setMarker({ lat, lng });
            setMapCenter({ lat, lng });
            setError('');
            resolveAddress(lat, lng);
            resolve();
          },
          (err) => {
            setError(`Error getting current location: ${err.message}`);
            console.error('Geolocation error:', err);
            resolve();
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }),
    [resolveAddress]
  );

  /** Receives the normalised { address, lat, lng } from LocationInput. */
  const handlePlaceSelected = useCallback(({ address, lat, lng }) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    setLockLocation(address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setMarker({ lat, lng });
    setMapCenter({ lat, lng });
    setError('');
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
        // forceSave creates the capsule when there is no id yet.
        id = await forceSave();
        if (!id) {
          throw new Error('Failed to save capsule');
        }
      } else {
        await saveCapsule(capsuleTitle, value, capsuleId);
      }
      
      const lockSettings = {
        lockDate,
        lockLocation: lockLocation || (marker ? `${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}` : ''),
        coordinates: marker
          ? {
              type: 'Point',
              coordinates: [marker.lng, marker.lat] // GeoJSON requires [lng, lat]
            }
          : undefined,
        createdAt: new Date().toISOString(),
      };
      
      await lockCapsule(id, lockSettings);
      
      alert('Your TimeCapsule has been successfully locked!');

      // My Capsules lives under the dashboard shell.
      window.location.href = '/dashboard/my-capsules';
    } catch (err) {
      setError('Failed to lock the capsule. Please try again.');
      console.error('Error locking capsule:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [lockDate, lockLocation, marker, capsuleId, capsuleTitle, value, forceSave]);

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