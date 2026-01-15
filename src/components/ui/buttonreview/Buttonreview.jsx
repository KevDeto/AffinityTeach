import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const Buttonreview = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const maxlength = 350;

    const handleOpenReview = () => {
        if (isOpen === false) {
            setReview("");
            setRating(0);
        }
        setIsOpen(true);
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
    const displayRating = hoverRating || rating;

    return (
        <div>
            <button type="button" onClick={handleOpenReview} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
                 bg-tarjetas hover:bg-gray-700 rounded-lg border border-bordes 
                 transition-colors duration-200 focus:outline-none cursor-pointer" >
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
                                    aria-label={`Calificar con ${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                                >
                                    <span className={`
                                        ${star <= displayRating ? 'text-amber-400' : 'text-gray-400'}
                                        transition-colors duration-200
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
                            placeholder="Escribe aquí..."
                            value={review}
                            maxLength={maxlength}
                            onChange={handleReview}
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
                        onClick={() => {
                            // notificacion para enviar la reseña (agregar o no ?)
                            if (rating === 0) {
                                alert("Por favor, selecciona una calificación con estrellas");
                                return;
                            }
                            console.log("Reseña enviada:", { rating, review });
                            setIsOpen(false);
                        }}
                        className="bg-blanco text-black font-medium p-3 w-full cursor-pointer rounded transition-colors duration-200"
                        disabled={rating === 0}
                    >
                        {rating === 0 ? "Selecciona estrellas para enviar" : `Enviar Reseña`}
                    </button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Buttonreview;