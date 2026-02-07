import axios from "axios";

const Api = axios.create({
    baseURL: process.env.BACKEND_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

const storageAvailable = typeof window !== "undefined" && !!window.localStorage;

const getStored = () => ({
    accessToken: storageAvailable ? localStorage.getItem("accessToken") : null,
    refreshToken: storageAvailable ? localStorage.getItem("refreshToken") : null,
});

export const setTokens = ({ accessToken, refreshToken }) => {
    if (storageAvailable) {
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    }
    if (accessToken) {
        Api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
};

export const clearTokens = () => {
    if (storageAvailable) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }
    delete Api.defaults.headers.common.Authorization;
};

// Keep backward compatibility
export const setAuthToken = (token) => setTokens({ accessToken: token });

// Auth APIs
export const login = (email, password) => Api.post("/auth/login", { email, password });
export const register = (name, email, password, role) =>
    Api.post("/auth/register", { name, email, password, role });
export const editUserRole = (email, role) => Api.put("/auth/edit-role", { email, role });
export const getUsers = () => Api.get("/users/");

// Project APIs
export const fetchProjects = () => Api.get("/projects");
export const createProject = (payload) => Api.post("/projects", payload);
export const updateProject = (id, payload) => Api.patch(`/projects/${id}/update`, payload);
export const deleteProject = (id) => Api.delete(`/projects/${id}/delete`);
export const completeProject = (id) => Api.patch(`/projects/${id}/complete`);
export const uploadProjectDocument = (id, file) => {
    const formData = new FormData();
    formData.append("document", file);
    return Api.post(`/projects/${id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

const refreshAccessToken = async (refreshToken) => {
    const { data } = await axios.post(
        `${Api.defaults.baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
    );
    return data;
};

export const checkAuth = () => Api.get("/auth/check");

let isRefreshing = false;
let pending = [];

const queueRequest = (cb) => pending.push(cb);
const flushQueue = (token) => {
    pending.forEach((cb) => cb(token));
    pending = [];
};

Api.interceptors.request.use((config) => {
    const { accessToken } = getStored();
    if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

Api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (
            error.response?.status === 401 &&
            !original._retry
        ) {
            original._retry = true;
            const { refreshToken } = getStored();
            if (!refreshToken) {
                clearTokens();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve) => {
                    queueRequest((token) => {
                        if (token) original.headers.Authorization = `Bearer ${token}`;
                        resolve(Api(original));
                    });
                });
            }

            isRefreshing = true;
            try {
                const data = await refreshAccessToken(refreshToken);
                setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
                flushQueue(data.accessToken);
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return Api(original);
            } catch (err) {
                clearTokens();
                flushQueue(null);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// Expose stored tokens for consumers (e.g., Zustand store init)
export const getStoredTokens = getStored;

export default Api;