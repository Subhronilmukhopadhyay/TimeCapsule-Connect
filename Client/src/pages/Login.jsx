import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import InputField from "../components/Form/form";
import { loginHandleSubmit } from "../services/loginHandleSubmit";
import { useDispatch } from "react-redux";
import { login as authLogin } from "../store/slices/authSlice";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginHandleSubmit(email, password, navigate, dispatch, authLogin);
    if (!result.success) {
      setErrorMessage(result.message); 
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to your backend Google OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Login to continue your journey through time.</p>
        
        <div className={styles.loginContent}>
          {/* Traditional Login Section */}
          <div className={styles.traditionalLogin}>
            <h3 className={styles.sectionTitle}>Sign in with Email</h3>
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
              
              {errorMessage && (
                <div className={styles.errorMessage}>{errorMessage}</div> 
              )}

              <button type="submit" className={styles.btn}>Login</button>
            </form>
          </div>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine}></div>
          </div>

          {/* Google OAuth Section */}
          <div className={styles.oauthLogin}>
            <h3 className={styles.sectionTitle}>Quick Sign In</h3>
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className={styles.googleBtn}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <div className={styles.oauthBenefits}>
              <p className={styles.benefitText}>✓ Secure & Fast</p>
              <p className={styles.benefitText}>✓ No Password Required</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className={styles.loginFooter}>
          <p className={styles.signupText}>
            Don't have an account? <Link to="/register" className={styles.link}>Sign Up</Link>
          </p>
          
          <div className={styles.policyLinks}>
            <span className={styles.policyText}>By continuing, you agree to our </span>
            <Link to="/privacy-policy" className={styles.policyLink}>Privacy Policy</Link>
            <span className={styles.policyText}> and </span>
            <Link to="/security-policy" className={styles.policyLink}>Security Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;