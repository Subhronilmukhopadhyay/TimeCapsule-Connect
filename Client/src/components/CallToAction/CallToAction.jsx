import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CallToAction.module.css';

const CallToAction = () => {
  return (
    <section className={styles.cta}>
      <div className={styles.inner}>
        <h2>Something worth opening in ten years starts today</h2>
        <p>
          Create a capsule, invite the people who were there, and pick the day it opens.
          It takes a couple of minutes.
        </p>

        <div className={styles.actions}>
          <Link to="/register" className={styles.primary}>
            Create a free account
          </Link>
          <Link to="/login" className={styles.secondary}>
            I already have one
          </Link>
        </div>

        <p className={styles.note}>No card required · Your capsules stay private</p>
      </div>
    </section>
  );
};

export default CallToAction;
