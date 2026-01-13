import api from "./axios";

// Register schema: email, username, password
interface RegisterData {
  email: string;
  username: string;
  password: string;
}

// Login schema: username, password
interface LoginData {
  username: string;
  password: string;
}

// API call to register user
export const registerUser = (data: RegisterData) => api.post("/auth/register", data);

// API call to login user
export const loginUser = (data: LoginData) => api.post("/auth/login", data);

// API call to fetch user profile
export const getProfile = () => api.get("/auth/profile");
