import { create } from "zustand";
import api from "../api/apiClient";

export const useResenaStore = create((set, get) => ({
  resenas: [],
  loading: false,
  // Control de qué reseñas ya fueron cargadas por docente
  loadedResenas: {}, // { [docenteUid]: true }

  fetchResenas: async (docenteUid, force = false) => {
    const state = get();
    
    // Si ya cargamos reseñas para este docente y no forzamos, usamos caché
    if (state.loadedResenas[docenteUid] && !force) {
      console.log(`📦 Usando caché para reseñas de: ${docenteUid}`);
      return;
    }

    set({ loading: true });
    try {
      const res = await api.get(`/api/docentes/${docenteUid}/resenas`);
      set({ 
        resenas: res.data, 
        loading: false,
        loadedResenas: { 
          ...state.loadedResenas, 
          [docenteUid]: true 
        }
      });
    } catch (error) {
      console.error("Error fetching resenas:", error);
      set({ loading: false });
    }
  },

  crearResena: async (docenteUid, data) => {
    try {
      const res = await api.post(`/api/docentes/${docenteUid}/resenas`, data);

      // Actualizar estado y mantener el flag de caché
      set((state) => ({
        resenas: [res.data, ...state.resenas],
        loadedResenas: {
          ...state.loadedResenas,
          [docenteUid]: true // Mantenemos el caché activo
        }
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
  },

  // Función para limpiar caché de un docente específico
  clearCacheForDocente: (docenteUid) => {
    set((state) => {
      const newLoadedResenas = { ...state.loadedResenas };
      delete newLoadedResenas[docenteUid];
      return { loadedResenas: newLoadedResenas };
    });
  },

  // Función para limpiar todo el caché
  clearCache: () => {
    set({ loadedResenas: {} });
  }
}));