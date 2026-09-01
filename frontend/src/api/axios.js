import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    return config;
});

// Log responses and errors to help trace API failures during development
API.interceptors.response.use(
    (response) => {
        // keep success responses lightweight but useful for debugging
        // console.debug("API response:", response);
        return response;
    },
    (error) => {
        console.error("API response error:", error);
        // Attach a safe serializable summary to the error for UI consumption
        try {
            error.__debug = {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                method: error.config?.method,
            };
        } catch {
            // ignore serialization issues
        }

        return Promise.reject(error);
    },
);

export default API;
