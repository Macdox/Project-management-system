import { create } from "zustand";
import { login, setTokens, clearTokens, getStoredTokens } from "./Api";

const initialTokens = getStoredTokens();
if (initialTokens.accessToken) {
    setTokens(initialTokens);
}

const useStore = create((set) => ({
    user: null,
    accessToken: initialTokens.accessToken,
    refreshToken: initialTokens.refreshToken,

    setUser: (user) => set({ user }),

    syncTokens: () => {
        const stored = getStoredTokens();
        set({ accessToken: stored.accessToken, refreshToken: stored.refreshToken });
    },

    login: async (email, password) => {
        try {
            const { data } = await login(email, password);
            const resolvedUser = data.user || (data.role ? { role: data.role } : null);
            setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
            set({
                user: resolvedUser,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            return { error: message };
        }
    },

    logout: () => {
        clearTokens();
        set({ user: null, accessToken: null, refreshToken: null });
    },
}));

export default useStore;