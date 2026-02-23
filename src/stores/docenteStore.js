import { create } from 'zustand';

const API_BASE_URL = import.meta.env.VITE_API_URL;

import { create } from "zustand";
import api from "../api/apiClient";

export const useDocenteStore = create((set) => ({
  docentes: [],
  docenteSeleccionado: null,
  loading: false,

  fetchDocentes: async () => {
    set({ loading: true });
    const res = await api.get("/api/docentes");
    set({ docentes: res.data, loading: false });
  },

  fetchDocenteById: async (id) => {
    set({ loading: true });
    const res = await api.get(`/api/docentes/${id}`);
    set({ docenteSeleccionado: res.data, loading: false });
  },
}));