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

const Buttonreview = ({ docenteId }) => {
    const { agregarResena, docentes, docenteSeleccionado } = useDocenteStore();
    const { handleClickLoginGoogle } = useLoginWithGoogle();

    const [isOpen, setIsOpen] = useState(false);
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const maxlength = 350;

    const shouldOpenAfterLogin = useRef(false);

    const checkIfAlreadyReviewed = () => {
        //const docente = docentes.find(d => d.id === docenteId);
        const docente = docenteSeleccionado;

        if (!docente || !docente.resenas || !user?.email) {
            //console.log("No hay datos suficientes para verificar");
            return false;
        }

        const hasReviewed = docenteSeleccionado.resenas.some(resena =>
            (resena.estudiante === user.displayName) ||
            (resena.photo === user.photoURL)
        );

        return hasReviewed;
    }

    useEffect(() => {
        if (user?.email && docenteSeleccionado?.resenas) {
            //console.log("Verificando reseña para usuario:", user.email);
            const hasReviewed = checkIfAlreadyReviewed();
            //console.log("Resultado verificación:", hasReviewed);
            setAlreadyReviewed(hasReviewed);
        } else {
            setAlreadyReviewed(false);
        }
    }, [user, docenteId, docenteSeleccionado])

    // Efecto para escuchar cambios en la autenticación
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);

            // Si el usuario se autenticó Y teníamos pendiente abrir el diálogo
            if (currentUser && shouldOpenAfterLogin.current) {
                handleOpenReview();
                shouldOpenAfterLogin.current = false;
                setIsLoggingIn(false);
            }
        });

        return () => unsubscribe(); // Limpiar suscripción
    }, []);

    const handleOpenReview = () => {
        /*if (!docenteId) {
            alert("No se ha seleccionado un docente"); //sale alerta al loguearme desde el boton dejar reseña
            return;
        }
*/
        if (alreadyReviewed) {
            alert("Ya has dejado una reseña para este docente.");
            return;
        }

        if (isOpen === false) {
            setReview("");
            setRating(0);
        }
        setIsOpen(true);
    };

    const handleCombinado = async () => {
        // Verificar si ya está autenticado
        if (!user) {
            shouldOpenAfterLogin.current = false; // true si quiero que se muestre el dialogo despues del login

            try {
                await handleClickLoginGoogle();
                // El diálogo se abrirá en el useEffect cuando user cambie
            } catch (error) {
                console.error("Error en login:", error);
                shouldOpenAfterLogin.current = false;

                if (error.code === 'auth/popup-closed-by-user') {
                    return;
                }
                return;
            }
        } else {
            if (alreadyReviewed) {
                alert("Ya has dejado una reseña para este docente.");
                return;
            }
            handleOpenReview();
        }
    };


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

    const handleSubmitReview = async () => {
        if (!docenteId) {
            alert("Error: No se ha identificado al docente");
            return;
        }

        if (rating === 0) {
            alert("Por favor, selecciona una calificación con estrellas");
            return;
        }
        /*
                if (review.trim() === "") {
                    alert("Por favor, escribe tu experiencia en la reseña");
                    return;
                }
        */
        setIsSubmitting(true);
        try {
            //obtengo el token del usuario
            const token = await user.getIdToken();
            if (!token || token.length < 10) {
                throw new Error("Token inválido o vacío");
            }
            // Preparar los datos de la reseña según la estructura de tu API
            const resenaData = {
                estudiante: user.displayName,
                comentario: review.trim(),
                estrellas: rating,
                photo: user.photoURL,
                email: user.email,
            };

            //console.log("Enviando reseña:", { docenteId, ...resenaData });


            //console.log("foto de google " + user.photoURL)
            // Llamar a la función del store
            await agregarResena(docenteId, resenaData, token);
            // Notificación de éxito
            //alert("¡Reseña enviada exitosamente! Gracias por compartir tu experiencia.");
            //setAlreadyReviewed(true);
            // Cerrar el diálogo
            setIsOpen(false);
            setReview("");
            setRating(0);

        } catch (error) {
            console.error("Error al enviar reseña:", error);
            if (error.message === "REVIEW_DUPLICATE") {
                alert("Ya has dejado una reseña para este docente.");
                setAlreadyReviewed(true);
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
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
                 bg-tarjetas hover:bg-gray-700 rounded-lg border border-bordes 
                 transition-colors duration-200 focus:outline-none cursor-pointer"
                disabled={!docenteId}
            >
                Dejar reseña
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