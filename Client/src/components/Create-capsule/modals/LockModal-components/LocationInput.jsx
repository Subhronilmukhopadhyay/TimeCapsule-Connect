import React, { useEffect, useRef, useState } from 'react';
import styles from '../Modals.module.css';

/**
 * Location picker built on the modern Places UI Kit.
 *
 * `google.maps.places.Autocomplete` was deprecated on March 1st 2025 and is no
 * longer receiving fixes, so this uses `PlaceAutocompleteElement` instead. That
 * API is a custom element which renders and owns its own <input>, so the text
 * box cannot be a controlled React input any more. The resolved address is
 * therefore surfaced in a read-only readout below the search box, which also
 * keeps it in sync when the user picks a spot by clicking the map or by using
 * their current location.
 */
const LocationInput = ({
  isLoaded,
  lockLocation,
  setLockLocation,
  // Aliased locally: a `use*` name here trips the rules-of-hooks lint, and this
  // is an ordinary callback prop rather than a React hook.
  useCurrentLocation: requestCurrentLocation,
  onPlaceSelected,
}) => {
  const containerRef = useRef(null);
  const elementRef = useRef(null);

  // Keep the latest callbacks in refs so the element is only ever built once.
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const setLockLocationRef = useRef(setLockLocation);
  onPlaceSelectedRef.current = onPlaceSelected;
  setLockLocationRef.current = setLockLocation;

  const [initError, setInitError] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    let cancelled = false;
    let element = null;
    let handleSelect = null;

    const buildAutocomplete = async () => {
      try {
        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary('places');

        if (!PlaceAutocompleteElement) {
          throw new Error('PlaceAutocompleteElement is unavailable');
        }
        // The modal may have closed while the library was loading.
        if (cancelled || !containerRef.current) return;

        element = new PlaceAutocompleteElement();
        element.setAttribute('placeholder', 'Search for a place, or click the map');
        element.className = styles.placeAutocomplete;

        handleSelect = async (event) => {
          try {
            // Current API hands back a prediction; older builds handed back a
            // Place directly. Support both so a library rollout can't break us.
            const prediction = event.placePrediction;
            const place = prediction ? prediction.toPlace() : event.place;
            if (!place) return;

            await place.fetchFields({
              fields: ['displayName', 'formattedAddress', 'location'],
            });

            const location = place.location;
            if (!location) return;

            const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
            const lng = typeof location.lng === 'function' ? location.lng() : location.lng;

            const address =
              place.formattedAddress ||
              place.displayName ||
              `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

            setLockLocationRef.current(address);
            onPlaceSelectedRef.current({ address, lat, lng });
          } catch (err) {
            console.error('Error resolving selected place:', err);
            setInitError('Could not read that place. Try another search.');
          }
        };

        element.addEventListener('gmp-select', handleSelect);
        // Legacy event name, harmless if it never fires.
        element.addEventListener('gmp-placeselect', handleSelect);

        containerRef.current.appendChild(element);
        elementRef.current = element;
        setInitError('');
      } catch (err) {
        console.error('Error initializing place autocomplete:', err);
        setInitError('Place search is unavailable. You can still click the map.');
      }
    };

    buildAutocomplete();

    return () => {
      cancelled = true;
      if (element) {
        if (handleSelect) {
          element.removeEventListener('gmp-select', handleSelect);
          element.removeEventListener('gmp-placeselect', handleSelect);
        }
        element.remove();
      }
      elementRef.current = null;
    };
  }, [isLoaded]);

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      await requestCurrentLocation();
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className={styles.locationSelector}>
      <h4>Set Unlock Location</h4>

      <div className={styles.locationInputWrapper}>
        {isLoaded ? (
          <div ref={containerRef} className={styles.autocompleteHost} />
        ) : (
          <input
            type="text"
            className={styles.locationInput}
            placeholder="Loading place search..."
            disabled
            readOnly
          />
        )}
      </div>

      {initError && <p className={styles.locationHint}>{initError}</p>}

      <div className={styles.selectedLocation}>
        <span className={styles.selectedLocationLabel}>Selected</span>
        <span className={styles.selectedLocationValue}>
          {lockLocation || 'No location set yet'}
        </span>
      </div>

      <button
        type="button"
        className={styles.secondaryBtn}
        style={{ marginTop: '10px' }}
        onClick={handleUseCurrentLocation}
        disabled={locating}
      >
        {locating ? 'Locating...' : 'Use Current Location'}
      </button>
    </div>
  );
};

export default LocationInput;
