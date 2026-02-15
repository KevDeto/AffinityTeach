import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDocenteStore } from "@/stores/docenteStore";

const Cardreview = ({ resenas }) => {
    const { id } = useParams();
    const {
        docenteSeleccionado,
        loading,
        error,
        fetchDocenteById,
        darLikeResena
    } = useDocenteStore();
    const [likes, setLikes] = useState({});
    const fetchControllerRef = useRef(null);
    const lastFetchedIdRef = useRef(null);

    useEffect(() => {
        // Solo hacer fetch si:
        // 1. Hay un ID
        // 2. No es el mismo ID que ya cargamos
        // 3. No estamos cargando ya
        if (id && id !== lastFetchedIdRef.current && !loading) {
            //console.log(`Iniciando fetch para docente ${id}`);

            // Cancelar cualquier fetch anterior
            if (fetchControllerRef.current) {
                fetchControllerRef.current.abort();
                //console.log(`Cancelando fetch anterior`);
            }

            // Guardar referencia del ID actual
            lastFetchedIdRef.current = id;

            // Hacer el fetch
            fetchDocenteById(id);
        }

        // Cleanup cuando el componente se desmonta
        return () => {
            //console.log(`Cardreview cleanup para ID: ${id}`);
            // No resetear lastFetchedIdRef aquí porque queremos
            // recordar que ya cargamos este docente
        };
    }, [id, loading, fetchDocenteById]);

    const handleLikeClick = async (resenaId) => {
        try {
            // Llamar a la API para dar like
            await darLikeResena(id, resenaId);

            // Actualizar estado local optimistamente
            setLikes(prev => ({
                ...prev,
                [resenaId]: {
                    count: (prev[resenaId]?.count || 0) + 1,
                    liked: true
                }
            }));
        } catch (error) {
            console.error('Error dando like:', error);
        }
    };

    const getFormattedDate = (firebaseTimestamp) => {
        if (!firebaseTimestamp) {
            const today = new Date();
            return today.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        try {
            if (firebaseTimestamp.seconds) {
                const date = new Date(firebaseTimestamp.seconds * 1000);
                return date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
            const date = new Date(firebaseTimestamp);
            if (isNaN(date.getTime())) {
                return 'Fecha reciente';
            }
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return 'Fecha reciente';
        }
    };

    // Función para calcular el porcentaje de estrellas
    const getStarPercentage = (estrellas) => {
        return (estrellas / 5) * 100;
    };

    // Estados de carga y error
    if (loading) {
        return (
            <div className="w-full flex justify-center items-center border border-bordes rounded-md bg-tarjetas p-4 mb-6">
                <p className="text-blanco">Cargando reseñas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex justify-center items-center border border-bordes rounded-md bg-tarjetas p-4 mb-6">
                <p className="text-red-400">Error: {error}</p>
            </div>
        );
    }

    if (!docenteSeleccionado) {
        return (
            <div className="w-full flex justify-center items-center border border-bordes rounded-md bg-tarjetas p-4 mb-6">
                <p className="text-blanco">Docente no encontrado</p>
            </div>
        );
    }

    if (!docenteSeleccionado.resenas || docenteSeleccionado.resenas.length === 0) {
        return (
            <div className="w-full flex justify-center items-center border border-bordes rounded-md bg-tarjetas p-4 mb-6">
                <p className="text-blanco">No hay reseñas para este docente</p>
            </div>
        );
    }

    return (
        <>
            {/* Lista de reseñas */}
            {resenas.map((resena) => {
                const starPercentage = getStarPercentage(resena.estrellas);
                const hasReviewText = resena.comentario && resena.comentario.trim().length > 0;

                return (
                    <div
                        key={resena.id}
                        className="w-full flex-col border border-bordes rounded-md bg-tarjetas p-4 mb-6"
                    >
                        <div className="flex justify-between mb-4">
                            <div className="flex gap-3 flex-col">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-600 flex justify-center items-center">
                                        {resena.photo ? (
                                            <img
                                                src={resena.photo}
                                                alt={`Avatar de ${resena.estudiante}`}
                                                className="w-full h-full object-cover rounded-full"
                                                referrerPolicy="no-referrer"
                                                crossOrigin="anonymous"
                                                onError={(e) => {
                                                    //console.log(`Error cargando avatar de ${resena.estudiante}:`, resena.photo);
                                                    e.target.style.display = 'none';
                                                    // Mostrar el ícono por defecto si falla
                                                    e.target.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-linear-to-br from-blue-700 to-violet-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-lg">
                                                    {resena.estudiante?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-blanco">{resena.estudiante}</h2>
                                        <p className="text-sm text-gray-300">Estudiante</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 mt-2">
                                    <div className="relative inline-block">
                                        <div className="stars-empty relative text-[12px] md:text-[16px] text-gray-300 before:content-['★★★★★']"></div>
                                        <div
                                            className="stars-filled absolute top-0 left-0 overflow-hidden"
                                            style={{ width: `${starPercentage}%` }}
                                        >
                                            <div className="text-[12px] md:text-[16px] text-amber-400 before:content-['★★★★★']"></div>
                                        </div>
                                    </div>
                                    <p className="text-[12px] text-gray-400">
                                        {getFormattedDate(resena.fecha)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {hasReviewText && (
                            <div className="mb-4">
                                <div className="relative">
                                    <textarea
                                        readOnly
                                        className="resize-none w-full bg-tarjetas border-none focus:outline-none text-blanco leading-relaxed overflow-y-auto min-h-16 max-h-50 
                                                [&::-webkit-scrollbar]:w-2
                                                [&::-webkit-scrollbar-track]:bg-transparent
                                                 [&::-webkit-scrollbar-thumb]:bg-bordes
                                                [&::-webkit-scrollbar-thumb]:rounded-full
                                                [&::-webkit-scrollbar-thumb]:hover:bg-gray-500
                                                [&::-webkit-scrollbar-thumb]:cursor-pointer"
                                        value={resena.comentario}
                                        rows={Math.min(Math.ceil(resena.comentario.length / 60), 5)}
                                    />
                                </div>
                            </div>
                        )}
                        {/*
                        <div className="flex justify-start">
                            <button
                                onClick={() => handleLikeClick(resena.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                    likes[resena.id]?.liked 
                                        ? 'bg-blue-500/20 text-blue-300' 
                                        : 'bg-gray-700/50 text-gray-400 hover:text-blanco'
                                }`}
                            >
                                <ThumbsUp
                                    className={`w-4 h-4 transition-transform duration-200 ${
                                        likes[resena.id]?.liked 
                                            ? 'fill-blue-300 text-blue-300' 
                                            : ''
                                    }`}
                                />
                                <span className="font-medium">
                                    {likes[resena.id]?.count > 0 ? likes[resena.id].count : 'Me gusta'}
                                </span>
                            </button>
                        </div>                    */}

                    </div>
                );
            })}
        </>
    );
};

export default Cardreview;