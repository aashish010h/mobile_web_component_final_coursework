import axiosInstance from "@/services/axiosInstance";
import { create } from "zustand";

interface User {
    email: string;
    token?: string;
}

interface AuthState {
    user: User | null;
    setUser: (user: User) => void;
    logout: () => void;
    restoreLogin: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    setUser: (userData) => set({ user: userData }),
    logout: () => set({ user: null }),
    restoreLogin: async () => {
        try {
            const res = await axiosInstance.get("/user"); // Laravel auth:sanctum protected route
            set({ user: res.data });
        } catch {
            set({ user: null });
        }
    },
}));
