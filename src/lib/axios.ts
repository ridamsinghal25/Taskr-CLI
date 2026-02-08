import axios from "axios";
import { config } from "../config/app.config.js";
import { getStoredToken } from "./auth-token.js";

const axiosInstance = axios.create({
  baseURL: config.SERVER_URL,
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();

    if (token?.access_token && config.headers) {
      config.headers.set("Authorization", `Bearer ${token.access_token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;