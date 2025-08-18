// src/services/registerHandleSubmit.js
import api from "./api";

export const registerHandleSubmit = async (
  name,
  username,
  email,
  phoneNo,
  password,
  confirmPassword,
  dateOfBirth,
  navigate
) => {
  try {
    // Step 1: Get fresh CSRF token (cookie + value)
    const { data } = await api.get("/csrf-token");
    localStorage.setItem("csrf", data.csrfToken);
    await new Promise((resolve) => setTimeout(resolve, 50)); // small delay ensures cookie is set
    // console.log("CSRF Token received:", data.csrfToken);

    // Step 2: Submit registration
    const result = await api.post(
      "/api/auth/register",
      {
        name,
        username,
        email,
        phoneNo,
        password,
        confirmPassword,
        dateOfBirth,
      }
    );

    // Step 3: Handle success
    // console.log("Registration successful:", result.data);
    if (result.status === 201) {
      alert("Registration successful! Please log in.");
      navigate("/dashboard");
    } else {
      alert("Registration failed. Please try again.");
    }
  } catch (error) {
    console.error("Error registering:", error);
    if (error.response?.data?.error) {
      alert(error.response.data.error);
    } else {
      alert("An error occurred. Please try again later.");
    }
  }
};