import React, { useEffect, useRef, useState } from "react";
import { UserRound } from 'lucide-react';
import { Link } from "react-router-dom";
import { useDocenteStore } from "@/stores/docenteStore";

const Card = ({docentes}) => {
    const {
        /*docentes,*/
        loading,
        error,
        fetchDocentes
    } = useDocenteStore();

    const loadingRef = useRef(false); // Para prevenir múltiples llamadas simultáneas
    const [initialLoadDone, setInitialLoadDone] = useState(false);


    useEffect(() => {
        // Solo cargar si no hay docentes y no se está cargando ya
        if (!initialLoadDone && docentes.length === 0 && !loadingRef.current) {
            loadingRef.current = true;
            console.log("Cargando docentes...");
            
            fetchDocentes().finally(() => {
                loadingRef.current = false;
                setInitialLoadDone(true);
            });
        }
    }, [docentes.length, initialLoadDone, fetchDocentes]);

    if (loading) {
        return (
            <div className="w-full h-40 flex justify-center items-center border border-bordes rounded-md bg-tarjetas p-4 mb-6">
                <p className="text-blanco">Cargando docentes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-40 flex justify-center items-center border border-bordes rounded-md bg-tarjetas p-4 mb-6">
                <p className="text-red-400">Error: {error}</p>
            </div>
        );
    }

    if (docentes.length === 0) {
        return (
            <div className="w-full h-40 flex justify-center items-center border border-bordes rounded-md bg-tarjetas p-4 mb-6">
                <p className="text-blanco">No hay docentes disponibles</p>
            </div>
        );
    }

    return (
        <>
            {docentes.map((docente) => {
                return (
                    <div key={docente.id} className="w-full h-40 flex-col border border-bordes rounded-md bg-tarjetas p-4 mb-6">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-600 flex justify-center items-center">
                                    <UserRound className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-blanco font-semibold">{docente.nombre}</h2>
                                    <p className="text-[12px] text-gray-300">{docente.cantResenas} reseñas</p>

                                </div>
                            </div>
                            <div className="text-3xl text-amber-400 font-bold">
                                <span>{docente.puntaje.toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="mt-10 bg-blanco text-black rounded-lg hover:bg-blanco/90 hover:text-black">
                            <Link to={`/docente/${docente.id}/reviews`}>
                                <button className="h-10 w-full text-[16px] font-semibold cursor-pointer">
                                    <span>Ver Reseñas</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                );
            })}
        </>
    );
}

export default Card;