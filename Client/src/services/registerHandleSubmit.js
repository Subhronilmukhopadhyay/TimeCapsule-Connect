import axios from "axios";
export const registerHandleSubmit = async (name, username, email, phoneNo, password, confirmPassword, dateOfBirth, navigate) => {
    try{
        const result = await axios.post("http://localhost:8000/api/auth/register", {
            name, username, email, phoneNo, password, confirmPassword, dateOfBirth
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
        if (error.response && error.response.data && error.response.data.error) {
            alert(error.response.data.error); 
        } else {
            alert("An error occurred. Please try again later.");
        }
    }
}