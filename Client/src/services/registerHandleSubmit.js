import axios from "axios";
export const registerHandleSubmit = async (username, email, phoneNo, password, confirmPassword, dateOfBirth, navigate) => {
    try{
        const result = await axios.post("http://localhost:8000/api/auth/register", {
            username, email, phoneNo, password, confirmPassword, dateOfBirth
        },
        {
            headers: {
                "Content-Type": "application/json"
            }
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
        alert("An error occurred. Please try again later.");
    }
}