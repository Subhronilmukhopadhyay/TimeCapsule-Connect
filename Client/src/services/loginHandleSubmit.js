export const loginHandleSubmit = async (email, password, navigate) => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Login successful:", data);
        localStorage.setItem("token", data.token); // Store authentication token
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        console.error("Login failed:", data.message);
        alert(data.message); // Show error message
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred. Please try again later.");
    }
  };
  