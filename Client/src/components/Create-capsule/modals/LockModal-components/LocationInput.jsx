import React, { useEffect, useRef } from 'react';
import styles from '../Modals.module.css';

const LocationInput = ({
  isLoaded,
  lockLocation,
  setLockLocation,
  useCurrentLocation,
  onPlaceSelected,
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (
      isLoaded &&
      inputRef.current &&
      window.google &&
      window.google.maps &&
      window.google.maps.places
    ) {
      try {
        // Initialize Google Autocomplete
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry'],
          types: ['geocode'],
        });

        // Place selected event
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (!place || !place.geometry) return;

          const formattedAddress = place.formatted_address || '';
          setLockLocation(formattedAddress);
          onPlaceSelected(place);
        });
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    }

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onPlaceSelected, setLockLocation]);

  return (
    <div className={styles.locationSelector}>
      <h4>Set Unlock Location</h4>

      <div className={styles.locationInputWrapper}>
        <input
          ref={inputRef}
          type="text"
          className={styles.locationInput}
          placeholder={isLoaded ? 'Search or click on the map' : 'Loading place search...'}
          value={lockLocation}
          onChange={(e) => setLockLocation(e.target.value)}
          disabled={!isLoaded}
          required
        />
      </div>

      <button
        type="button"
        className={styles.secondaryBtn}
        style={{ marginTop: '10px' }}
        onClick={useCurrentLocation}
      >
        Use Current Location
      </button>
    </div>
  );
};

export default LocationInput;
