import axios from "axios";

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
        return Promise.reject(err);
    }
);

export default axiosInstance;
