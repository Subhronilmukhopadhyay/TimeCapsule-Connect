import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import InputField from "../components/Form/form";
import { loginHandleSubmit } from "../services/loginHandleSubmit";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email + " " + password);
    loginHandleSubmit(email, password, navigate);
  };
  
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Login to continue your journey through time.</p>
        <form onSubmit={handleSubmit}>
          <InputField 
            label="Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <InputField 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" className={styles.btn}>Login</button>
          <p className={styles.signupText}>
            Don't have an account? <Link to="/register" className={styles.link}>Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;