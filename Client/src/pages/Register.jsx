import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import InputField from "../components/Form/form";
import { registerHandleSubmit } from "../services/registerHandleSubmit";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(email+" "+password);
        registerHandleSubmit(name,email, password, confirmPassword, navigate);
    };
  
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p>Login to continue your journey through time.</p>
        <form onSubmit={handleSubmit}>
          <InputField label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button type="submit" className="btn">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
