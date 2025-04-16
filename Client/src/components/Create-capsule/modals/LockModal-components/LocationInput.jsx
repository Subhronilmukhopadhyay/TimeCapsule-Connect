import React, { useEffect, useRef } from 'react';
import styles from '../Modals.module.css';

const LocationInput = ({
  isLoaded,
  lockLocation,
  setLockLocation,
  useCurrentLocation,
  onPlaceSelected,
  placeAutocompleteRef
}) => {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (isLoaded && inputRef.current && window.google && window.google.maps && window.google.maps.places) {
      try {
        // Clear any existing content
        while (wrapperRef.current.firstChild) {
          wrapperRef.current.removeChild(wrapperRef.current.firstChild);
        }

        // Create the PlaceAutocompleteElement correctly
        const placeAutocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
          inputElement: inputRef.current
        });

        // Store reference
        placeAutocompleteRef.current = placeAutocompleteElement;

        // Add event listener for place selection
        placeAutocompleteElement.addEventListener('gmp-placeselect', (event) => {
          const place = event.detail.place;
          if (place) {
            const formattedAddress = place.formattedAddress || place.formatted_address;
            setLockLocation(formattedAddress || '');
            onPlaceSelected(place);
          }
        });

        // Input change listener to update state
        inputRef.current.addEventListener('input', (e) => setLockLocation(e.target.value));

        // Append the PlaceAutocompleteElement to the wrapper
        wrapperRef.current.appendChild(inputRef.current);
      } catch (error) {
        console.error('Error initializing PlaceAutocompleteElement:', error);
      }
    }

    return () => {
      // Clean up if needed
      if (placeAutocompleteRef.current) {
        placeAutocompleteRef.current.remove();
      }
    };
  }, [isLoaded, lockLocation, onPlaceSelected, setLockLocation]);

  return (
    <div className={styles.locationSelector}>
      <h4>Set Unlock Location</h4>

      <div ref={wrapperRef} className={styles.locationInputWrapper}>
        {/* PlaceAutocompleteElement will be injected here */}
        {!isLoaded && (
          <input
            type="text"
            className={styles.locationInput}
            placeholder="Loading place search..."
            disabled
          />
        )}
        <input
          ref={inputRef}
          type="text"
          className={styles.locationInput}
          placeholder="Search or click on the map"
          value={lockLocation}
          onChange={(e) => setLockLocation(e.target.value)}
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
