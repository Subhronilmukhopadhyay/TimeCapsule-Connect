// components/create-capsule/sidebar/Activity.jsx
import React from 'react';
import styles from './Activity.module.css';

const ActivityItem = ({ time, user, action }) => (
  <div className={styles.activityItem}>
    <div className={styles.activityTime}>{time}</div>
    <div className={styles.activityText}>
      <strong>{user}</strong> {action}
    </div>
  </div>
);

const Activity = () => {
  const activities = [
    { time: '10:32 AM', user: 'John Doe', action: 'added an image' },
    { time: '10:15 AM', user: 'You', action: 'started this capsule' },
  ];

  return (
    <div className={styles.activitySection}>
      <h3>Activity</h3>
      <div className={styles.activityTimeline}>
        {activities.map((activity, index) => (
          <ActivityItem 
            key={index}
            time={activity.time}
            user={activity.user}
            action={activity.action}
          />
        ))}
      </div>
    </div>
  );
};

export default Activity;