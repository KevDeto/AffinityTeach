import { create } from "zustand";
import api from "../api/apiClient";

export const useResenaStore = create((set) => ({
  resenas: [],
  loading: false,

  fetchResenas: async (docenteId) => {
    set({ loading: true });
    const res = await api.get(`/api/docentes/${docenteId}/resenas`);
    set({ resenas: res.data, loading: false });
  },

  crearResena: async (docenteId, data) => {
    const res = await api.post(
      `/api/docentes/${docenteId}/resenas`,
      data
    );

    set((state) => ({
      resenas: [res.data, ...state.resenas],
    }));
  },

  darLike: async (docenteId, resenaId) => {
    const res = await api.post(
      `/api/docentes/${docenteId}/resenas/${resenaId}/like`
    );

    set((state) => ({
      resenas: state.resenas.map((r) =>
        r.id === resenaId ? res.data : r
      ),
    }));
  },
}));