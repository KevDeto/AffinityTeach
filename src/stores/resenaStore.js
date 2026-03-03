import { create } from "zustand";
import api from "../api/apiClient";

export const useResenaStore = create((set, get) => ({
  resenas: [],
  loading: false,
  loadedResenas: {}, // { [uid]: timestamp }
  currentDocenteUid: null,

  fetchResenas: async (docenteUid, force = false) => {
    const state = get();
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
    
    // Si cambiamos de docente, limpiar
    if (state.currentDocenteUid !== docenteUid) {
      set({ resenas: [] });
    }
    
    // Verificar caché con TTL
    if (state.loadedResenas[docenteUid] && !force) {
      const timestamp = state.loadedResenas[docenteUid];
      const timeSinceFetch = Date.now() - timestamp;
      
      if (timeSinceFetch < CACHE_TTL && state.currentDocenteUid === docenteUid) {
        console.log(`📦 Usando caché para reseñas de: ${docenteUid} (${Math.round(timeSinceFetch/1000)}s old)`);
        return;
      }
    }

    set({ loading: true, currentDocenteUid: docenteUid });
    try {
      const res = await api.get(`/api/docentes/${docenteUid}/resenas`);
      set({ 
        resenas: res.data, 
        loading: false,
        loadedResenas: { 
          ...state.loadedResenas, 
          [docenteUid]: Date.now() 
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
      
      // Actualizar y resetear timestamp para que la próxima vez recargue
      set((state) => ({
        resenas: [res.data, ...state.resenas],
        loadedResenas: {
          ...state.loadedResenas,
          [docenteUid]: Date.now() // Actualizar timestamp
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
  }
}));