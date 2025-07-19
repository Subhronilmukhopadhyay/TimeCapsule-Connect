import axios from "axios";
export const registerHandleSubmit = async (name, username, email, phoneNo, password, confirmPassword, dateOfBirth, navigate) => {
    try{
        const csrfResponse = await fetch('https://timecapsule-connect-server.onrender.com/csrf-token', { //production mode
        // const csrfResponse = await fetch('http://localhost:8000/csrf-token', { //development mode
            credentials: 'include'
        });
    
        if (!csrfResponse.ok) {
            throw new Error("Failed to fetch CSRF token.");
        }
    
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        if (!csrfToken) {
            throw new Error("CSRF token is missing from cookies.");
        }
    
        console.log("CSRF Token received from server:", csrfToken);
    
        if (!csrfToken) {
            throw new Error("CSRF token is missing in the response.");
        }

        const result = await axios.post("https://timecapsule-connect-server.onrender.com/api/auth/register", { //production mode
        // const result = await axios.post("http://localhost:8000/api/auth/register", { //development mode
            name, username, email, phoneNo, password, confirmPassword, dateOfBirth
        },
        {
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken
            },
            withCredentials: true
        });
        console.log("Registration successful:", result.data);
        if(result.status === 201){
            alert("Registration successful! Please log in.");
            navigate("/dashboard"); // Redirect to login page after successful registration
        }
        else{
            alert("Registration failed. Please try again.");
        }
    }
    catch(error){
        console.error("Error registering:", error);
        if (error.response && error.response.data && error.response.data.error) {
            alert(error.response.data.error); 
        } else {
            alert("An error occurred. Please try again later.");
        }
    }
}