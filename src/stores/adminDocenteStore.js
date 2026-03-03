import { create } from "zustand";
import api from "../api/apiClient";

export const useAdminDocenteStore = create((set) => ({
  loading: false,

  crearDocente: async (data) => {
    const res = await api.post("/api/docentes/admin", data);
    return res.data;
  },

  crearMultiples: async (data) => {
    const res = await api.post("/api/docentes/admin/bulk", data);
    return res.data;
  },

  actualizarDocente: async (id, data) => {
    const res = await api.put(`/api/docentes/admin/${id}`, data);
    return res.data;
  },

  eliminarDocente: async (id) => {
    await api.delete(`/api/docentes/admin/${id}`);
  },
}));