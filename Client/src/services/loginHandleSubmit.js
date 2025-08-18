// loginHandleSubmit.js
import api from './api';

export const loginHandleSubmit = async (email, password, navigate, dispatch, authLogin) => {
  try {
    const csrfResponse = await api.get('/csrf-token');
    const csrfToken = csrfResponse.data.csrfToken;
    console.log("CSRF Token fetched:", csrfToken);
    console.log("HERE-1");
    const response = await api.post('/api/auth/login', {
      email,
      password
    }, {
      headers: {
        'CSRF-Token': csrfToken // Or 'x-csrf-token' if your server is configured for it
      }
    });

    console.log("Login successful:", response.data);
    if(response.statusText === "OK") {
      // localStorage.setItem('myAppState', JSON.stringify(response.data.user));
      dispatch(authLogin({ userData: response.data.user }));
    }
    navigate("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    const message = error.response?.data?.message || "An unexpected error occurred.";
    return { success: false, message };
  }
};