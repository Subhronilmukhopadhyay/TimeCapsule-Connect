export const loginHandleSubmit = async (email, password, navigate) => {
    try {
      // // Step 1: Fetch CSRF token from the backend
      // const csrfResponse = await fetch('http://localhost:8000/csrf-token', {
      //   credentials: 'include' // Ensure cookies are included in the request
      // });

      // // Check if the response is successful
      // if (!csrfResponse.ok) {
      //   throw new Error("Failed to fetch CSRF token.");
      // }

      // // Extract CSRF token from the response body
      // const csrfData = await csrfResponse.json();
      // const csrfToken = csrfData.csrfToken;

      // console.log("CSRF Token received from server:", csrfToken); // Log token in console for debugging

      // if (!csrfToken) {
      //   throw new Error("CSRF token is missing in the response.");
      // }

      const csrfResponse = await fetch('http://localhost:8000/csrf-token', {
        credentials: 'include' // Ensure cookies are included in the request
      });
      // Fetch CSRF token from the cookie
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
        // localStorage.setItem("token", data.token); // Store authentication token
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        console.error("Login failed:", data.message);
        alert(data.message); // Show error message
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
  