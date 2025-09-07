import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        // Set the token in a cookie
        if (typeof document !== 'undefined') {
          document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax; ${
            window.location.protocol === 'https:' ? 'Secure' : ''
          }`;
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        // Clear the token from the cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-token=; path=/; max-age=0; SameSite=Lax; Secure';
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);