import React, { useMemo } from "react";
import { datosMaterias  } from '@/lib/data'

const Card = () => {
    const docentesUnicos = useMemo(() => {
        const todosDocentes = [];

        datosMaterias .forEach(materia => {
            if (materia.docentes) {
                materia.docentes.forEach(docente => {
                    todosDocentes.push(docente);
                });
            }
        });

        // Eliminar duplicados manteniendo el orden
        return [...new Set(todosDocentes)];
    }, []);

    return (
        <>
            {docentesUnicos.map((docente, index) =>
                <div className="w-full h-40 flex-col border border-bordes rounded-md bg-tarjetas p-4 mb-6">
                    <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-600 flex justify-center 
                        items-center">
                                <span className="translate-x-0.5">{(index + 1) + '°'}</span>
                            </div>
                            <h2>{docente}</h2>
                        </div>
                        <div className="text-3xl">
                            <span>5.0</span>
                        </div>
                    </div>
                    <div className="mt-10 bg-blanco text-black rounded-lg hover:bg-blanco/90 hover:text-black">
                        <button className="h-10 w-full text-[16px] font-semibold cursor-pointer">
                            <span>Reseñas</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Card;