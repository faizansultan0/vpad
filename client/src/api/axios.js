import axios from "axios";

const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || "/api/v1";

const api = axios.create({
  baseURL: API_BASE_PATH,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("vpad-auth");
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const stored = localStorage.getItem("vpad-auth");
        if (stored) {
          const { state } = JSON.parse(stored);
          if (state?.refreshToken) {
            const response = await axios.post(
              `${API_BASE_PATH}/auth/refresh-token`,
              {
                refreshToken: state.refreshToken,
              }
            );

            const { accessToken, refreshToken } = response.data.data;

            const newState = {
              ...state,
              accessToken,
              refreshToken,
            };
            localStorage.setItem(
              "vpad-auth",
              JSON.stringify({ state: newState })
            );

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem("vpad-auth");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
