export const loginHandleSubmit = async (email, password, navigate) => {
    try {
      const csrfResponse = await fetch('http://localhost:8000/csrf-token', {
        credentials: 'include' 
      });
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

        if (!csrfToken) {
            throw new Error("CSRF token is missing from cookies.");
      }

      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Login successful:", data);
        navigate("/dashboard");
      } else {
        console.error("Login failed:", data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      if (error.response && error.response.data && error.response.data.error) {
          alert(error.response.data.error); 
      } else {
          alert("An error occurred. Please try again later.");
      }
    }
  };
  