import React, { useState, useEffect, useRef } from "react";
import useLoginWithGoogle from "@/config/useLoginWithGoogle ";
import { auth } from "@/config/firebaseconfig";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useDocenteStore } from "@/stores/docenteStore";
import { useResenaStore } from "@/stores/resenaStore";
import { useAuthStore } from "@/stores/authStore";

const Buttonreview = ({ docenteUid }) => {
    const { docenteSeleccionado } = useDocenteStore();
    const { crearResena, resenas } = useResenaStore();
    const { handleClickLoginGoogle } = useLoginWithGoogle();
    const { user } = useAuthStore();

    const [isOpen, setIsOpen] = useState(false);
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);

    const maxlength = 350;
    const shouldOpenAfterLogin = useRef(false);

    const checkIfAlreadyReviewed = () => {
        if (!resenas || !Array.isArray(resenas) || !user?.email) {
            return false;
        }

        // Usar fotoUrl como identificador temporal
        return resenas.some(resena => resena.fotoUrl === user.photoURL);
    }

    // Efecto para sincronizar con las reseñas
    useEffect(() => {
        setAlreadyReviewed(checkIfAlreadyReviewed());
    }, [resenas, user]);

    // FUNCIONES QUE FALTABAN 🔽
    const handleReview = (e) => {
        const value = e.target.value;
        if (value.length <= maxlength) {
            setReview(value);
        }
    }

    const handleStarClick = (starValue) => {
        setRating(starValue);
    };

    const handleStarHover = (starValue) => {
        setHoverRating(starValue);
    };

    const handleStarLeave = () => {
        setHoverRating(0);
    };

    const handleCombinado = async () => {
        // Si ya sabemos que reseñó (por el estado), bloqueamos
        if (alreadyReviewed) {
            alert("Ya has dejado una reseña para este docente.");
            return;
        }

        if (!user) {
            shouldOpenAfterLogin.current = true;
            try {
                await handleClickLoginGoogle();
            } catch (error) {
                console.error("Error en login:", error);
                shouldOpenAfterLogin.current = false;
            }
            return;
        }

        // Si no hay impedimentos, abrimos
        setIsOpen(true);
        setReview("");
        setRating(0);
    };

    // Efecto para después del login
    useEffect(() => {
        if (user && shouldOpenAfterLogin.current) {
            // Verificamos nuevamente
            if (checkIfAlreadyReviewed()) {
                alert("Ya has dejado una reseña para este docente.");
                setAlreadyReviewed(true);
                shouldOpenAfterLogin.current = false;
                return;
            }

            setIsOpen(true);
            setReview("");
            setRating(0);
            shouldOpenAfterLogin.current = false;
        }
    }, [user]);

    const handleSubmitReview = async () => {
        if (!docenteUid) {
            alert("Error: No se ha identificado al docente");
            return;
        }

        if (rating === 0) {
            alert("Por favor, selecciona una calificación con estrellas");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await user.getIdToken();
            if (!token || token.length < 10) {
                throw new Error("Token inválido o vacío");
            }
            const resenaData = {
                estudiante: user.displayName,
                comentario: review.trim() || "",
                estrellas: rating,
                fotoUrl: user.photoURL,
                email: user.email,
            };

            await crearResena(docenteUid, resenaData);

            setIsOpen(false);
            setReview("");
            setRating(0);
            setAlreadyReviewed(true);

        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === 409) {
                const errorMsg = error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Ya has dejado una reseña para este docente.";

                alert(errorMsg);
                setAlreadyReviewed(true);
                setIsOpen(false);
            } else {
                alert(`Error al enviar la reseña: ${error.message || "Por favor, intenta nuevamente."}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div>
            <button
                type="button"
                onClick={handleCombinado}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
                    bg-tarjetas hover:bg-gray-700 rounded-lg border border-bordes 
                    transition-colors duration-200 focus:outline-none cursor-pointer
                    ${checkIfAlreadyReviewed() ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={checkIfAlreadyReviewed() || !docenteUid}
                title={checkIfAlreadyReviewed() ? "Ya has dejado una reseña" : "Dejar reseña"}
            >
                {checkIfAlreadyReviewed() ? "Ya reseñaste" : "Dejar reseña"}
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className={`bg-tarjetas border-bordes text-blanco`}>
                    <DialogHeader>
                        <DialogTitle className="text-center mb-2">
                            Califica tu experiencia
                        </DialogTitle>
                        <div className="flex gap-1 justify-center mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="text-4xl cursor-pointer transition-transform duration-150 focus:outline-none focus:ring-none rounded"
                                    onClick={() => handleStarClick(star)}
                                    onMouseEnter={() => handleStarHover(star)}
                                    onMouseLeave={handleStarLeave}
                                    disabled={isSubmitting}
                                    aria-label={`Calificar con ${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                                >
                                    <span className={`
                                        ${star <= displayRating ? 'text-amber-400' : 'text-gray-400'}
                                        transition-colors duration-200
                                        ${isSubmitting ? 'opacity-50' : ''}
                                    `}>
                                        ★
                                    </span>
                                </button>
                            ))}
                        </div>
                        <DialogDescription className="text-center text-blanco">
                            Cuenta tu experiencia y ayuda a otros a conocer más sobre este docente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <textarea
                            className="w-full border p-2 bg-campo min-h-55 resize-none border-bordes focus:outline-none"
                            placeholder="Escribe aquí tu experiencia con este docente..."
                            value={review}
                            maxLength={maxlength}
                            onChange={handleReview}
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-between mt-2">
                            <span className="text-sm text-gray-400">
                                {rating === 0 ? "Selecciona una calificación primero" : `Calificación: ${rating}/5`}
                            </span>
                            <span className={`text-sm ${review.length >= maxlength ? 'text-red-400' : 'text-gray-400'}`}>
                                {review.length}/{maxlength}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmitReview}
                        className={`bg-blanco text-black font-medium p-3 w-full cursor-pointer rounded transition-colors duration-200 ${(rating === 0 || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blanco/90'
                            }`}
                        disabled={rating === 0 || isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                Enviando...
                            </span>
                        ) : rating === 0 ? (
                            "Selecciona estrellas para enviar"
                        ) : (
                            "Enviar Reseña"
                        )}
                    </button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Buttonreview;