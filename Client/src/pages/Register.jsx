import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import InputField from "../components/Form/form";
import { registerHandleSubmit } from "../services/registerHandleSubmit";

function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [pass, setPass] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      setPass(false);
      return;
    }
    console.log(email + " " + password);
    registerHandleSubmit(name, username, email, phoneNo, password, confirmPassword, dateOfBirth, navigate);
  };
  
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p>Login to continue your journey through time.</p>
        <form onSubmit={handleSubmit}>
          <InputField label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <InputField label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <InputField label="Phone Number" type="tel" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} />
          <InputField label="Date of Birth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {!pass && <p className="error">Passwords do not match!</p>}
          {/* <p className="forgot-password">Forgot Password?</p> */}
          <button type="submit" className="btn">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;