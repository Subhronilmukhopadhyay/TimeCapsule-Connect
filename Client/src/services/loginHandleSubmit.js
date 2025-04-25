// loginHandleSubmit.js
import api from './api';

export const loginHandleSubmit = async (email, password, navigate) => {
  try {
    await api.get('/csrf-token');

    const response = await api.post('/api/auth/login', {
      email,
      password
    });

    console.log("Login successful:", response.data);
    navigate("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    const message = error.response?.data?.message || "An unexpected error occurred.";
    return { success: false, message };
  }
};
