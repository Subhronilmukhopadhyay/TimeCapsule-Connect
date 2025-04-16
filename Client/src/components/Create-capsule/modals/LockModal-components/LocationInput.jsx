import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import styles from '../Modals.module.css';

const LocationInput = ({
  isLoaded,
  autocompleteRef,
  lockLocation,
  setLockLocation,
  useCurrentLocation,
  handlePlaceChanged
}) => (
  <div className={styles.locationSelector}>
    <h4>Set Unlock Location</h4>

    {isLoaded && (
      <Autocomplete
        onLoad={ref => (autocompleteRef.current = ref)}
        onPlaceChanged={handlePlaceChanged}
      >
        <input 
          type="text"
          className={styles.locationInput}
          placeholder="Search or click on the map"
          value={lockLocation}
          onChange={(e) => setLockLocation(e.target.value)}
          required
        />
      </Autocomplete>
    )}

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

export default LocationInput;