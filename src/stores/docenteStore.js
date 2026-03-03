import { create } from "zustand";
import api from "../api/apiClient";

export const useDocenteStore = create((set, get) => ({
  docentes: [],
  docenteSeleccionado: null,
  loading: false,
  loadedDocentes: false,
  loadedDocenteById: {},
  lastFetchTimestamp: null, // Para saber cuándo se cargó

  fetchDocentes: async (force = false) => {
    const state = get();
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos
    
    // Si ya cargamos y no ha pasado el TTL, usamos caché
    if (state.loadedDocentes && !force) {
      const timeSinceLastFetch = Date.now() - (state.lastFetchTimestamp || 0);
      if (timeSinceLastFetch < CACHE_TTL) {
        console.log("📦 Usando caché de docentes (menos de 5 min)");
        return;
      }
      console.log("🔄 Caché expirado, recargando docentes...");
    }

    set({ loading: true });
    try {
      const res = await api.get("/api/docentes");
      set({ 
        docentes: res.data, 
        loading: false,
        loadedDocentes: true,
        lastFetchTimestamp: Date.now()
      });
    } catch (error) {
      console.error("Error fetching docentes:", error);
      set({ loading: false });
    }
  },

  fetchDocenteById: async (uid, force = false) => {
    const state = get();
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
    
    // Limpiar selección anterior
    set({ docenteSeleccionado: null });
    
    // Verificar caché con TTL
    if (state.loadedDocenteById[uid] && !force) {
      const timestamp = state.loadedDocenteById[uid];
      const timeSinceFetch = Date.now() - timestamp;
      
      if (timeSinceFetch < CACHE_TTL) {
        console.log(`📦 Usando caché para docente: ${uid} (${Math.round(timeSinceFetch/1000)}s old)`);
        
        // Buscar en la lista de docentes
        const docenteFromList = state.docentes.find(d => d.uid === uid);
        if (docenteFromList) {
          set({ docenteSeleccionado: docenteFromList });
          return;
        }
      }
    }

    set({ loading: true });
    try {
      const res = await api.get(`/api/docentes/${uid}`);
      set({ 
        docenteSeleccionado: res.data, 
        loading: false,
        loadedDocenteById: { 
          ...state.loadedDocenteById, 
          [uid]: Date.now() 
        }
      });
    } catch (error) {
      console.error(`Error fetching docente ${uid}:`, error);
      set({ loading: false });
    }
  },

  // Para recarga manual (ej. con un botón "Refrescar")
  refreshDocentes: () => {
    get().fetchDocentes(true);
  }
}));