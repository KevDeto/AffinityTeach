import { create } from "zustand";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const useAuthStore = create((set) => ({
  user: null,
  roles: [],
  loading: true,

  initAuthListener: () => {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({ user: null, roles: [], loading: false });
        return;
      }

      const tokenResult = await user.getIdTokenResult();
      const roles = tokenResult.claims.roles || [];

      set({
        user,
        roles,
        loading: false,
      });
    });
  },

  isAdmin: () => {
    const state = useAuthStore.getState();
    return state.roles.includes("ADMIN");
  },
}));