import { create } from "zustand";
import api from "../api/apiClient";

export const useResenaStore = create((set) => ({
  resenas: [],
  loading: false,

  fetchResenas: async (docenteUid) => {
    set({ loading: true });
    try {
      const res = await api.get(`/api/docentes/${docenteUid}/resenas`);
      set({ resenas: res.data, loading: false });
    } catch (error) {
      console.error("Error fetching resenas:", error);
      set({ loading: false });
    }
  },

  crearResena: async (docenteUid, data) => {
    try {
      const res = await api.post(`/api/docentes/${docenteUid}/resenas`, data);
      
      // Actualizar el estado local inmediatamente
      set((state) => ({
        resenas: [res.data, ...state.resenas]
      }));
      
      return res.data;
    } catch (error) {
      console.error("Error creando reseña:", error);
      throw error;
    }
  },

  darLike: async (docenteUid, resenaUid) => {
    try {
      const res = await api.post(
        `/api/docentes/${docenteUid}/resenas/${resenaUid}/like`
      );

      set((state) => ({
        resenas: state.resenas.map((r) =>
          r.uid === resenaUid ? res.data : r
        )
      }));
    } catch (error) {
      console.error("Error dando like:", error);
    }
  }
}));