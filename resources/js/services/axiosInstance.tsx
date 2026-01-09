import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
    baseURL: "/api/",
    headers: {
        Accept: "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            // Sanctum requires the 'Bearer' scheme
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            // redirect to login page
            window.location.href = "/";
        }
        if (err.response?.status === 403) {
            // redirect to login page

            toast.error("Unauthorised Access");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1200);
        }
        return Promise.reject(err);
    }
);

export default axiosInstance;
