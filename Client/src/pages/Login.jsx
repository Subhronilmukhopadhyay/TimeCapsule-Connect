import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import InputField from "../components/Form/form";
import { loginHandleSubmit } from "../services/loginHandleSubmit";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
      e.preventDefault();
      console.log(email+" "+password);
      loginHandleSubmit(email, password, navigate);
  };
  
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p>Login to continue your journey through time.</p>
        <form onSubmit={handleSubmit}>
          <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn">Login</button>
          <p className="signup-text">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
