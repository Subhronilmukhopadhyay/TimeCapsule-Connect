// components/create-capsule/sidebar/Colors.jsx
import React from 'react';
import styles from './Colors.module.css';

const ColorButton = ({ color }) => (
  <button 
    className={styles.colorBtn} 
    style={{ backgroundColor: color }} 
  />
);

const Colors = () => {
  const textColors = ['#000000', '#ff0000', '#0000ff', '#00cc00', '#ff9900'];
  const bgColors = ['#ffffff', '#ffeeee', '#eeeeff', '#eeffee', '#fff9ee'];

  return (
    <div className={styles.toolSection}>
      <h3>Colors</h3>
      
      <div className={styles.colorRow}>
        <span>Text</span>
        <div className={styles.colorOptions}>
          {textColors.map((color, index) => (
            <ColorButton key={`text-${index}`} color={color} />
          ))}
        </div>
      </div>
      
      <div className={styles.colorRow}>
        <span>Background</span>
        <div className={styles.colorOptions}>
          {bgColors.map((color, index) => (
            <ColorButton key={`bg-${index}`} color={color} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Colors;