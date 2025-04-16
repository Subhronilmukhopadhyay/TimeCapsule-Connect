import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { lockCapsule, saveCapsule } from '../../../services/capsule-storage';
import DateSelector from './LockModal-components/DateSelector';
import LocationInput from './LockModal-components/LocationInput';
import MapComponent from './LockModal-components/MapComponent';
import styles from './Modals.module.css';
import DOMPurify from 'dompurify'; // Add this library for sanitization

// Define libraries outside component to prevent recreation on each render
const libraries = ['places'];
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const LockModal = ({ onClose, content, title }) => {
  const [lockDate, setLockDate] = useState('');
  const [lockLocation, setLockLocation] = useState('');
  const [marker, setMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [error, setError] = useState('');

  const mapRef = useRef(null);
  const placeAutocompleteRef = useRef(null);

  // Use Google Maps API securely
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Handle map clicks to set location
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

  // Get current location
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

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!lockDate) {
      setError('Please select an unlock date');
      return;
    }
    
    if (!lockLocation && !marker) {
      setError('Please set an unlock location');
      return;
    }
    
    try {
      // Sanitize inputs before saving
      // console.log(content);
      const sanitizedTitle = DOMPurify.sanitize(title);
      const sanitizedContent = content
      .map(item => {
        if (item.value) {
          return { ...item, value: DOMPurify.sanitize(item.value) };
        }
        return item;
      });
      // console.log(sanitizedContent);
      const capsuleId = saveCapsule(sanitizedTitle, sanitizedContent);
      const lockSettings = {
        lockDate,
        lockLocation: lockLocation || (marker ? `${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}` : ''),
        coordinates: marker,
        createdAt: new Date().toISOString(),
      };
      
      lockCapsule(capsuleId, lockSettings);
      alert('Your TimeCapsule has been successfully locked!');
      onClose();
    } catch (err) {
      setError('Failed to save the capsule. Please try again.');
      console.error('Error saving capsule:', err);
    }
  }, [lockDate, lockLocation, marker, title, content, onClose]);

  // Handle place selection
  const handlePlaceSelected = useCallback((place) => {
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setLockLocation(place.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setMarker({ lat, lng });
      setMapCenter({ lat, lng });
    }
  }, []);

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
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.primaryBtn}>Lock Capsule</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockModal;