import React, { useMemo } from "react";
import { datosDocentes } from "@/lib/docentes";
import { UserRound } from 'lucide-react'

const Card = () => {
    /*
    const docentesUnicos = useMemo(() => {
        const todosDocentes = [];

        datosMaterias.forEach(materia => {
            if (materia.docentes) {
                materia.docentes.forEach(docente => {
                    todosDocentes.push(docente);
                });
            }
        });

        // Eliminar duplicados manteniendo el orden
        return [...new Set(todosDocentes)];
    }, []);
*/
    return (
        <>
            {datosDocentes.map((docente, index) =>
                <div className="w-full h-40 flex-col border border-bordes rounded-md bg-tarjetas p-4 mb-6">
                    <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-600 flex justify-center 
                        items-center">
                                <UserRound />
                                {/*<span className="translate-x-0.5">{(index + 1)}</span>*/}
                            </div>
                            <div>
                                <h2>{docente.docente}</h2>
                                <p className="text-[12px]">{docente.cantReseñas + " reseñas"}</p>
                            </div>
                        </div>
                        <div className="text-3xl">
                            <span>{docente.puntaje}</span>
                        </div>
                    </div>
                    <div className="mt-10 bg-blanco text-black rounded-lg hover:bg-blanco/90 hover:text-black">
                        <button className="h-10 w-full text-[16px] font-semibold cursor-pointer">
                            <a href="#">
                                <span>Reseñas</span>
                            </a>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Card;