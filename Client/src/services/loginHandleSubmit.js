// loginHandleSubmit.js
import api from './api';

export const loginHandleSubmit = async (email, password, navigate, dispatch, authLogin) => {
  try {
    // IMPORTANT: Always get fresh CSRF token before login
    console.log('Fetching CSRF token...');
    const csrfResponse = await api.get('/csrf-token');
    console.log('CSRF response:', csrfResponse.data);
    
    // Small delay to ensure cookie is set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await api.post('/api/auth/login', {
      email,
      password
    });

    console.log("Login successful:", response.data);
    if(response.statusText === "OK") {
      dispatch(authLogin({ userData: response.data.user }));
      navigate("/dashboard");
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    
    // If CSRF error, try to refresh token and retry once
    if (error.response?.status === 403 && error.response?.data?.message?.includes('csrf')) {
      console.log('CSRF error detected, attempting retry...');
      try {
        // Get fresh token
        await api.get('/csrf-token');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Retry the login
        const retryResponse = await api.post('/api/auth/login', {
          email,
          password
        });
        
        if(retryResponse.statusText === "OK") {
          dispatch(authLogin({ userData: retryResponse.data.user }));
          navigate("/dashboard");
        }
        
        return { success: true };
      } catch (retryError) {
        console.error("Retry failed:", retryError);
        const message = retryError.response?.data?.message || "Authentication failed. Please try again.";
        return { success: false, message };
      }
    }
    
    const message = error.response?.data?.message || "An unexpected error occurred.";
    return { success: false, message };
  }
};