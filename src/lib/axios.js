import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://project-management-system-backend-uzme.onrender.com/api/v1",
  withCredentials: true,
});
