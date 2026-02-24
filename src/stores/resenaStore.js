import { create } from "zustand";
import api from "../api/apiClient";

export const useResenaStore = create((set) => ({
  resenas: [],
  loading: false,

  fetchResenas: async (docenteUid) => {
    set({ loading: true });
    const res = await api.get(`/api/docentes/${docenteUid}/resenas`);
    set({ resenas: res.data, loading: false });
  },

  crearResena: async (docenteUid, data) => {
    const res = await api.post(
      `/api/docentes/${docenteUid}/resenas`,
      data
    );

    set((state) => ({
      resenas: [res.data, ...state.resenas],
    }));
  },

  darLike: async (docenteUid, resenaUid) => {
    const res = await api.post(
      `/api/docentes/${docenteUid}/resenas/${resenaUid}/like`
    );

    set((state) => ({
      resenas: state.resenas.map((r) =>
        r.uid === resenaUid ? res.data : r
      ),
    }));
  },
}));