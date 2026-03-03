import { create } from "zustand";
import api from "../api/apiClient";

export const useDocenteStore = create((set, get) => ({
  docentes: [],
  docenteSeleccionado: null,
  loading: false,
  // Control de qué datos ya fueron cargados
  loadedDocentes: false, // Para la lista completa
  loadedDocenteById: {}, // { [uid]: true } para docentes individuales

  fetchDocentes: async (force = false) => {
    const state = get();
    
    // Si ya cargamos los docentes y no forzamos, usamos caché
    if (state.loadedDocentes && !force) {
      console.log("Usando caché para lista de docentes");
      return;
    }

    set({ loading: true });
    try {
      const res = await api.get("/api/docentes");
      set({ 
        docentes: res.data, 
        loading: false,
        loadedDocentes: true
      });
    } catch (error) {
      console.error("Error fetching docentes:", error);
      set({ loading: false });
    }
  },

  fetchDocenteById: async (uid, force = false) => {
    const state = get();
    
    // Si ya cargamos este docente específico y no forzamos, usamos caché
    if (state.loadedDocenteById[uid] && !force) {
      console.log(`📦 Usando caché para docente: ${uid}`);
      return;
    }

    set({ loading: true });
    try {
      const res = await api.get(`/api/docentes/${uid}`);
      set({ 
        docenteSeleccionado: res.data, 
        loading: false,
        loadedDocenteById: { 
          ...state.loadedDocenteById, 
          [uid]: true 
        }
      });
    } catch (error) {
      console.error(`Error fetching docente ${uid}:`, error);
      set({ loading: false });
    }
  },

  // Función para limpiar caché (útil para testing)
  clearCache: () => {
    set({
      loadedDocentes: false,
      loadedDocenteById: {}
    });
  }
}));