// components/create-capsule/sidebar/Activity.jsx
import React from 'react';
import { useEditor } from '../../../../services/EditorContext';
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
  const { activities } = useEditor();

  return (
    <div className={styles.activitySection}>
      <h3>Activity</h3>
      <div className={styles.activityTimeline}>
        {activities.length === 0 ? (
          <div className={styles.noActivity}>No recent activity</div>
        ) : (
          activities.map((activity) => (
            <ActivityItem 
              key={activity.id}
              time={activity.time}
              user={activity.user}
              action={activity.action}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Activity;