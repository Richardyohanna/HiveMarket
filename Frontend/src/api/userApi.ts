
import { getToken } from "../services/authStorage";
import { UserStoreData } from "../types/User";

const BASE_URL = "http://172.20.10.8:8080/api";


export interface RegisterRequestComplete {
    email: string;
    role: string | undefined;
    fullName: string;       
    location: string;
    university: string;
    campus  : string;
}





export async function serverRole(role: string, email: string, callback: (data: any) => void): Promise<void> {

    

    const token = await getToken();

    console.log(token, "Token")

    try{
        if (!token) {
            throw new Error("No token found");
            
        }

    const requestBody = {
        role: role,
        email: email
    }

    const response = await fetch(BASE_URL + "/register/role", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)  
     });

     const serverText = await response.text()

     const text = serverText.replace(/"/g, "");

     console.log("Role update response:", text);

    // const setRole = userStore((state) => state.setRole);

     //setRole(text);

     callback(text);

     if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update role");
     }

    } catch (error) {
        console.error("Error updating role:", error);
        throw error;
    }
    
}

export async function serverGender(gender: string, email: string, callback: (data: any) => void): Promise<void> {

    const token = await getToken();

    if(token == null){
        alert("Please login to access this page");
    }

    const requestBody = {
        gender: gender,
        email: email
    }

    try{
        const response = await fetch(BASE_URL + "/gender" , {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
        });

        const serverText = await response.text();

        const text = serverText.replace(/"/g,"" )

        callback(text);
        console.log("This is the server Response of Gender", text);

    } catch(error){
        console.error("Cannot connect to gender server", error);
    }
   
}


export async function registerUserApa(data: RegisterRequestComplete): Promise<void> {

    const requestBody = {
        email: data.email,
        role: data.role,
        fullName: data.fullName,
        location: data.location,
        university: data.university,
        campus: data.campus,
    }

    const response = await fetch(BASE_URL + "/register", {
        
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),

    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register user");
    }
}




export async function uploadProfilePicture(
    email: string, 
    image: string,
    location: string,
    university: string,
    campus: string

): Promise<void> {

    const token = await getToken();

    if(token == null){
        alert("Please login to access this page");
    }

    const fileName = image.split("/").pop() || `${email}.jpg`
    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";

    console.log(fileName + ext, "Yeah");

    const formData = new FormData();

    
    formData.append("profilePictures", {
        uri: image,
        name: fileName,
        type: "image/jpeg"
    } as any);

    formData.append("email", email);
    formData.append("location", location);
    formData.append("university", university);    
    formData.append("campus", campus)

    try {
        const response = await fetch(BASE_URL + "/register/profile-picture", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })

    const responseText = await response.text();
    console.log("This is the response", responseText);

    } catch(error) {
        console.log("Error Uploading profilePicture", error)
    }
    
}


export async function getUserData(email: string, callback: (data: UserStoreData) => void) {
    if (!email) throw new Error("Email is required");

    const token = await getToken();
    if (!token) throw new Error("No token found");

    try {
        const response = await fetch(`${BASE_URL}/user-data?email=${email}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        callback(data);

        console.log("User Data:", data);

        return data; // ✅ IMPORTANT
    } catch (error) {
        console.error("Cannot connect to the server:", error);
        throw error;
    }
}