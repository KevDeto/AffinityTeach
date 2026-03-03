import { create } from "zustand";
import api from "../api/apiClient";

export const useDocenteStore = create((set) => ({
  docentes: [],
  docenteSeleccionado: null,
  loading: false,

  fetchDocentes: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/api/docentes");
      set({ docentes: res.data, loading: false });
    } catch (error) {
      console.error("Error fetching docentes:", error);
      set({ loading: false });
    }
  },

  fetchDocenteById: async (uid) => {
    set({ loading: true });
    try {
      const res = await api.get(`/api/docentes/${uid}`);
      set({ docenteSeleccionado: res.data, loading: false });
    } catch (error) {
      console.error("Error fetching docente:", error);
      set({ loading: false });
    }
  }
}));