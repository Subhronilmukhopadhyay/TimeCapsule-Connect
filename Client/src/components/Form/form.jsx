// src/components/Form/InputField/InputField.jsx
import React from "react";
import styles from "./InputField.module.css";

function InputField({ label, type, value, onChange, placeholder }) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>{label}</label>
      <input 
        className={styles.input}
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        required 
      />
    </div>
  );
}

export default InputField;