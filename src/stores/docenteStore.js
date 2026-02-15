import { create } from 'zustand';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper mejorado para fetch
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    //console.log(`Fetching: ${url}`);
    console.log("📤 Request URL:", url);
    console.log("📤 Request Method:", options.method || 'GET');
    console.log("📤 Request Headers:", options.headers);
    if (options.headers?.Authorization) {
      console.log("🔑 Auth header presente:", options.headers.Authorization.substring(0, 30) + "...");
    } else {
      console.log("❌ NO HAY AUTH HEADER");
    }

    console.log("📥 Response status:", response.status);
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    //console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      // Intentar obtener mensaje de error del cuerpo de la respuesta
      try {
        const errorData = await response.text();
        console.error('Error response:', errorData);

        // Intentar parsear como JSON
        const parsedError = JSON.parse(errorData);
        errorMessage = parsedError.message || parsedError.error || errorMessage;
      } catch (parseError) {
        // Si no es JSON, usar el texto plano
        console.error('Could not parse error response as JSON');
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    //console.log('Fetch successful:', data);
    return data;
  } catch (error) {
    console.error('Fetch error details:', {
      url,
      error: error.message,
      stack: error.stack
    });

    // Mejor mensaje de error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet o si el servidor está disponible.');
    }

    throw error;
  }
};

export const useDocenteStore = create((set, get) => ({
  docentes: [],
  docenteSeleccionado: null,
  loading: false,
  error: null,

  // ============ CRUD BÁSICO ============

  // 1. Obtener todos los docentes
  fetchDocentes: async () => {
    //console.log('fetchDocentes called');
    set({ loading: true, error: null });

    try {
      const data = await fetchWithErrorHandling(API_BASE_URL);
      //console.log('Data received from API:', data);

      // Verificar si data es un array
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        throw new Error('La respuesta del servidor no es válida');
      }

      const docentesFormateados = data.map(docente => ({
        id: docente.id || docente._id || `docente-${Math.random()}`,
        nombre: docente.nombre || 'Sin nombre',
        puntaje: docente.puntaje || docente.calificacionPromedio || 0,
        cantResenas: docente.cantResenas || (docente.resenas ? docente.resenas.length : 0),
        materias: docente.materias || [],
        resenas: docente.resenas || [],
        especialidad: docente.materias?.[0] || docente.especialidad || 'Sin especialidad'
      }));

      //console.log('Formatted docentes:', docentesFormateados);

      set({
        docentes: docentesFormateados,
        loading: false,
        error: null
      });

      return docentesFormateados;
    } catch (error) {
      console.error('Error in fetchDocentes:', error);
      set({
        error: error.message || 'Error desconocido al cargar docentes',
        loading: false
      });
      throw error;
    }
  },

  // 2. Obtener docente por ID
  fetchDocenteById: async (id) => {
    if (!id) {
      set({ error: 'ID de docente no proporcionado', loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/${id}`);

      const docenteFormateado = {
        id: data.id || id,
        nombre: data.nombre || 'Sin nombre',
        puntaje: data.puntaje || data.calificacionPromedio || 0,
        cantResenas: data.cantResenas || (data.resenas ? data.resenas.length : 0),
        materias: data.materias || [],
        resenas: data.resenas || [],
        especialidad: data.materias?.[0] || data.especialidad || 'Sin especialidad'
      };

      set((state) => ({
        docenteSeleccionado: docenteFormateado,
        docentes: state.docentes.some(d => d.id === id)
          ? state.docentes.map(docente =>
            docente.id === id ? docenteFormateado : docente
          )
          : [...state.docentes, docenteFormateado], // Si no existe, agregarlo
        loading: false,
        error: null
      }));

      return docenteFormateado;
    } catch (error) {
      console.error('Error fetching docente by ID:', error);
      set({
        error: `Error al cargar docente: ${error.message}`,
        loading: false
      });
      throw error;
    }
  },

  // 3. Crear nuevo docente
  crearDocente: async (docenteRequest) => {
    set({ loading: true, error: null });
    try {
      // Validar datos requeridos
      if (!docenteRequest.nombre) {
        throw new Error('El nombre del docente es requerido');
      }

      const data = await fetchWithErrorHandling(API_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(docenteRequest)
      });

      const nuevoDocente = {
        id: data.id,
        nombre: data.nombre,
        puntaje: data.puntaje || 0,
        cantResenas: data.cantResenas || 0,
        materias: data.materias || [],
        resenas: data.resenas || [],
        especialidad: data.materias?.[0] || 'Sin especialidad'
      };

      set((state) => ({
        docentes: [...state.docentes, nuevoDocente],
        loading: false,
        error: null
      }));

      return nuevoDocente;
    } catch (error) {
      console.error('Error creating docente:', error);
      set({
        error: `Error al crear docente: ${error.message}`,
        loading: false
      });
      throw error;
    }
  },

  // 4. Actualizar docente
  actualizarDocente: async (id, docenteRequest) => {
    if (!id) {
      set({ error: 'ID de docente no proporcionado', loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      // Validar datos requeridos
      if (!docenteRequest.nombre) {
        throw new Error('El nombre del docente es requerido');
      }

      const data = await fetchWithErrorHandling(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(docenteRequest)
      });

      const docenteActualizado = {
        id: data.id || id,
        nombre: data.nombre,
        puntaje: data.puntaje || 0,
        cantResenas: data.cantResenas || 0,
        materias: data.materias || [],
        resenas: data.resenas || [],
        especialidad: data.materias?.[0] || 'Sin especialidad'
      };

      set((state) => ({
        docentes: state.docentes.map(docente =>
          docente.id === id ? docenteActualizado : docente
        ),
        docenteSeleccionado: state.docenteSeleccionado?.id === id
          ? docenteActualizado
          : state.docenteSeleccionado,
        loading: false,
        error: null
      }));

      return docenteActualizado;
    } catch (error) {
      console.error('Error updating docente:', error);
      set({
        error: `Error al actualizar docente: ${error.message}`,
        loading: false
      });
      throw error;
    }
  },

  // 5. Eliminar docente
  eliminarDocente: async (id) => {
    if (!id) {
      set({ error: 'ID de docente no proporcionado', loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await fetchWithErrorHandling(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });

      set((state) => ({
        docentes: state.docentes.filter(docente => docente.id !== id),
        docenteSeleccionado: state.docenteSeleccionado?.id === id
          ? null
          : state.docenteSeleccionado,
        loading: false,
        error: null
      }));

      return response;
    } catch (error) {
      console.error('Error deleting docente:', error);
      set({
        error: `Error al eliminar docente: ${error.message}`,
        loading: false
      });
      throw error;
    }
  },

  // ============ OPERACIONES CON RESEÑAS ============

  // 6. Agregar reseña a un docente
  agregarResena: async (docenteId, resenaRequest, token) => {
    if (!docenteId) {
      set({ error: 'ID de docente no proporcionado', loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      // Validar datos de reseña
      if (!resenaRequest.estudiante) {
        throw new Error('El nombre del estudiante es requerido');
      }

      if (!resenaRequest.estrellas || resenaRequest.estrellas < 1 || resenaRequest.estrellas > 5) {
        throw new Error('La calificación debe estar entre 1 y 5 estrellas');
      }

      const data = await fetchWithErrorHandling(`${API_BASE_URL}/${docenteId}/resenas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resenaRequest)
      });

      // IMPORTANTE: Recargar el docente automáticamente después de agregar
      // Esto asegura que los datos estén actualizados
      const updatedDocente = await get().fetchDocenteById(docenteId);

      return data;
    } catch (error) {
      console.error('Error adding review:', error);
      set({
        error: `Error al agregar reseña: ${error.message}`,
        loading: false
      });
      throw error;
    }
  },

  // 7. Dar like a una reseña
  darLikeResena: async (docenteId, resenaId) => {
    if (!docenteId || !resenaId) {
      set({ error: 'ID de docente o reseña no proporcionado', loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await fetchWithErrorHandling(
        `${API_BASE_URL}/${docenteId}/resenas/${resenaId}/like`,
        { method: 'POST' }
      );

      // Actualizar estado local optimistamente
      set((state) => {
        const docenteIndex = state.docentes.findIndex(d => d.id === docenteId);
        if (docenteIndex !== -1) {
          const docenteActualizado = { ...state.docentes[docenteIndex] };
          const resenaIndex = docenteActualizado.resenas.findIndex(r => r.id === resenaId);

          if (resenaIndex !== -1) {
            docenteActualizado.resenas[resenaIndex] = {
              ...docenteActualizado.resenas[resenaIndex],
              likes: (docenteActualizado.resenas[resenaIndex].likes || 0) + 1
            };

            const nuevosDocentes = [...state.docentes];
            nuevosDocentes[docenteIndex] = docenteActualizado;

            return {
              docentes: nuevosDocentes,
              docenteSeleccionado: state.docenteSeleccionado?.id === docenteId
                ? docenteActualizado
                : state.docenteSeleccionado,
              loading: false,
              error: null
            };
          }
        }
        return { loading: false, error: null };
      });

      return data;
    } catch (error) {
      console.error('Error giving like:', error);
      set({
        error: `Error al dar like: ${error.message}`,
        loading: false
      });
      throw error;
    }
  },

  // ============ BÚSQUEDA Y OTROS ============

  // 8. Buscar docentes por nombre
  buscarDocentes: async (nombre) => {
    if (!nombre || nombre.trim() === '') {
      // Si no hay nombre, obtener todos los docentes
      return get().fetchDocentes();
    }

    set({ loading: true, error: null });
    try {
      const encodedNombre = encodeURIComponent(nombre.trim());
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/buscar?nombre=${encodedNombre}`);

      const docentesFormateados = data.map(docente => ({
        id: docente.id || docente._id || `docente-${Math.random()}`,
        nombre: docente.nombre || 'Sin nombre',
        puntaje: docente.puntaje || docente.calificacionPromedio || 0,
        cantResenas: docente.cantResenas || (docente.resenas ? docente.resenas.length : 0),
        materias: docente.materias || [],
        resenas: docente.resenas || [],
        especialidad: docente.materias?.[0] || docente.especialidad || 'Sin especialidad'
      }));

      set({
        docentes: docentesFormateados,
        loading: false,
        error: null
      });

      return docentesFormateados;
    } catch (error) {
      console.error('Error searching docentes:', error);
      set({
        error: `Error al buscar docentes: ${error.message}`,
        loading: false
      });
      throw error;
    }
  },

  // 9. Cargar datos iniciales (opcional, puedes eliminar si no lo usas)
  cargarDocentesIniciales: async (docentesRequest) => {
    set({ loading: true, error: null });
    try {
      // Validar que sea un array
      if (!Array.isArray(docentesRequest)) {
        throw new Error('Los datos deben ser un array de docentes');
      }

      // Validar cada docente
      docentesRequest.forEach((docente, index) => {
        if (!docente.nombre) {
          throw new Error(`Docente en posición ${index} no tiene nombre`);
        }
      });

      const data = await fetchWithErrorHandling(`${API_BASE_URL}/cargar-iniciales`, {
        method: 'POST',
        body: JSON.stringify(docentesRequest)
      });

      const docentesFormateados = data.map(docente => ({
        id: docente.id || docente._id || `docente-${Math.random()}`,
        nombre: docente.nombre || 'Sin nombre',
        puntaje: docente.puntaje || 0,
        cantResenas: docente.cantResenas || 0,
        materias: docente.materias || [],
        resenas: docente.resenas || [],
        especialidad: docente.materias?.[0] || 'Sin especialidad'
      }));

      set((state) => ({
        docentes: [...state.docentes, ...docentesFormateados],
        loading: false,
        error: null
      }));

      return docentesFormateados;
    } catch (error) {
      console.error('Error loading initial data:', error);
      set({
        error: `Error al cargar datos iniciales: ${error.message}`,
        loading: false
      });
      throw error;
    }
  },

  // 10. Obtener todas las reseñas de un docente por ID
  fetchResenasByDocenteId: async (id) => {
    if (!id) {
      set({ error: 'ID de docente no proporcionado', loading: false });
      return [];
    }

    set({ loading: true, error: null });
    try {
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/${id}/resenas`);

      // Si la respuesta es exitosa, actualizar las reseñas del docente seleccionado
      if (data && Array.isArray(data)) {
        set((state) => {
          if (state.docenteSeleccionado?.id === id) {
            return {
              docenteSeleccionado: {
                ...state.docenteSeleccionado,
                resenas: data,
                cantResenas: data.length
              },
              loading: false,
              error: null
            };
          }
          return { loading: false, error: null };
        });
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      set({
        error: `Error al obtener reseñas: ${error.message}`,
        loading: false
      });
      throw error;
    }
  },

  // ============ UTILIDADES ============

  // Limpiar error
  clearError: () => set({ error: null }),

  // Limpiar docente seleccionado
  clearDocenteSeleccionado: () => set({ docenteSeleccionado: null }),

  // Resetear store (para logout o testing)
  resetStore: () => set({
    docentes: [],
    docenteSeleccionado: null,
    loading: false,
    error: null
  }),
}));