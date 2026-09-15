import axios from "axios";

const apiClient = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ??
        "http://localhost:3000",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error)) {
            const message =
                error.response?.data?.message;

            if (typeof message === "string") {
                return Promise.reject(
                    new Error(message),
                );
            }

            if (Array.isArray(message)) {
                return Promise.reject(
                    new Error(message.join(", ")),
                );
            }
        }

        return Promise.reject(error);
    },
);

export default apiClient;