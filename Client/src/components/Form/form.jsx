import React from "react";

function InputField({ label, type, value, onChange }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input type={type} value={value} onChange={onChange} required />
    </div>
  );
}

export default InputField;
