// loginHandleSubmit.js
import api from './api';

export const loginHandleSubmit = async (email, password, navigate, dispatch, authLogin) => {
  try {
    // Step 1: fetch CSRF token
    const { data } = await api.get('/csrf-token');
    localStorage.setItem('csrf', data.csrfToken);
    await new Promise(resolve => setTimeout(resolve, 50)); 
    console.log("Cookie should now be set:", data.csrfToken);

    // Step 2: send login request
    const response = await api.post('/api/auth/login', { email, password });

    console.log("Login successful:", response.data);

    if (response.status === 200) {
      dispatch(authLogin({ userData: response.data.user }));
      navigate("/dashboard");
      return { success: true };
    }

  } catch (error) {
    console.error("Login error:", error);

    let message = "An unexpected error occurred.";
    let status = error.response?.status;

    if (status === 401) {
      message = "Invalid email or password.";
    } else if (status === 403) {
      message = "CSRF validation failed. Please refresh and try again.";
    } else if (status === 419) { 
      message = "CSRF token expired. Refresh and try again.";
    } else if (status >= 500) {
      message = "Server error. Please try again later.";
    } else if (error.request && !error.response) {
      message = "Network error. Check your connection.";
    } else {
      message = error.response?.data?.message || message;
    }

    return { success: false, message };
  }
};
