import React, { useState, useEffect } from "react";
import { useDocenteStore } from "@/stores/docenteStore";

const StarRating = () => {
    const {
        docenteSeleccionado,
        loading,
        error,
        fetchDocenteById,
    } = useDocenteStore();

// Estado para guardar los porcentajes calculados
    const [ratings, setRatings] = useState([
        { stars: 5, percentage: 0 },
        { stars: 4, percentage: 0 },
        { stars: 3, percentage: 0 },
        { stars: 2, percentage: 0 },
        { stars: 1, percentage: 0 },
    ]);

    // Función para calcular la distribución de estrellas
    const calcularDistribucion = (resenas) => {
        if (!resenas || !Array.isArray(resenas) || resenas.length === 0) {
            return [0, 0, 0, 0, 0]; // [5★, 4★, 3★, 2★, 1★]
        }

        // Contar cada tipo de estrella
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        resenas.forEach(resena => {
            const estrellas = resena.estrellas || 0;
            if (estrellas >= 1 && estrellas <= 5) {
                counts[estrellas]++;
            }
        });

        const totalReviews = resenas.length;
        
        // Calcular porcentajes para cada estrella
        const percentages = [
            totalReviews > 0 ? (counts[5] / totalReviews) * 100 : 0, // 5★
            totalReviews > 0 ? (counts[4] / totalReviews) * 100 : 0, // 4★
            totalReviews > 0 ? (counts[3] / totalReviews) * 100 : 0, // 3★
            totalReviews > 0 ? (counts[2] / totalReviews) * 100 : 0, // 2★
            totalReviews > 0 ? (counts[1] / totalReviews) * 100 : 0, // 1★
        ];

        return percentages;
    };

    // Función para ajustar el rating a estrellas completas o media estrella
    const adjustRatingForStars = (num) => {
        const integerPart = Math.floor(num); // Parte entera
        const decimalPart = num - integerPart; // Parte decimal
        
        // Si no tiene decimales (es exacto), devolvemos el número entero
        if (decimalPart === 0) {
            return integerPart;
        }
        // Si tiene cualquier decimal (por pequeño que sea), añadimos media estrella
        else {
            return integerPart + 0.5;
        }
    };

    // Actualizar ratings cuando cambien las reseñas del docente
    useEffect(() => {
        if (docenteSeleccionado?.resenas) {
            const percentages = calcularDistribucion(docenteSeleccionado.resenas);
            
            // Actualizar el estado de ratings con los porcentajes calculados
            setRatings([
                { stars: 5, percentage: percentages[0] },
                { stars: 4, percentage: percentages[1] },
                { stars: 3, percentage: percentages[2] },
                { stars: 2, percentage: percentages[3] },
                { stars: 1, percentage: percentages[4] },
            ]);
        }
    }, [docenteSeleccionado]);

    const averageRating = docenteSeleccionado?.puntaje || 0;
    const totalReviews = docenteSeleccionado?.cantResenas || 0;

    // Ajustar el rating para las estrellas visuales
    const adjustedRating = adjustRatingForStars(averageRating);
    
    // Calcular el ancho de las estrellas llenas basado en el rating ajustado
    const starsFilledWidth = `${(adjustedRating / 5) * 100}%`;

    return (
        <div className="app flex items-center justify-center p-4 mt-6 mb-6">
            <div className="rating flex flex-col md:flex-row md:gap-12 items-center md:items-start max-w-4xl">
                <div className="rating__progress flex flex-col gap-3 md:w-auto  min-w-115">
                    {ratings.map((rating) => (
                        <div
                            key={rating.stars}
                            className="rating__progress-value flex items-center gap-3"
                        >
                            <p className="text-sm font-medium w-4 flex justify-center">{rating.stars}</p>
                            <div className="progress flex-1 h-2 rounded-full bg-campo">
                                <div
                                    className={`bar bg-amber-400 h-full rounded-full transition-all duration-300`}
                                    style={{ width: `${rating.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rating__average flex flex-col items-center text-center md:text-left">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
                        {averageRating.toFixed(1)}
                    </h1>

                    <div className="relative inline-block">
                        <div className="stars-empty relative text-2xl md:text-3xl text-gray-300 before:content-['★★★★★']"></div>
                        <div
                            className="stars-filled absolute top-0 left-0 overflow-hidden"
                            style={{ width: starsFilledWidth }}
                        >
                            <div className="text-2xl md:text-3xl text-amber-400 before:content-['★★★★★']"></div>
                        </div>
                    </div>

                    <p className="text-white text-sm md:text-base">
                        {totalReviews.toLocaleString()} opiniones
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StarRating;