import React, { useState } from "react";
import { datosDocentes } from "@/lib/docentes";
import { UserRound, ThumbsUp } from "lucide-react";

const Cardreview = () => {
    const [likes, setLikes] = useState(datosDocentes.map(() => ({
        count: 0,
        liked: false
    })));

    const handleLikeClick = (index) => {
        setLikes(prev => {
            const newLikes = [...prev];
            if (newLikes[index].liked) {
                newLikes[index] = {
                    count: newLikes[index].count - 1,
                    liked: false
                };
            } else {
                newLikes[index] = {
                    count: newLikes[index].count + 1,
                    liked: true
                };
            }
            return newLikes;
        });
    };

    const getFormattedDate = () => {
        const today = new Date();
        return today.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <>
            {datosDocentes.map((docente, index) => {
                const reviewText = docente.reseñas[0];

                const hasReviewText = reviewText && reviewText.trim().length > 0;

                return (
                    <div
                        key={index}
                        className="w-full flex-col border border-bordes rounded-md bg-tarjetas p-4 mb-6"
                    >
                        <div className="flex justify-between mb-4">
                            <div className="flex gap-3 flex-col">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-600 flex justify-center items-center">
                                        <UserRound className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-blanco">{docente.docente}</h2>
                                        <p className="text-sm text-blanco">Estudiante de Ingeniería</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 mt-2">
                                    <div className="relative inline-block">
                                        <div className="stars-empty relative text-[12px] md:text-[18px] text-gray-300 before:content-['★★★★★']"></div>
                                        <div
                                            className="stars-filled absolute top-0 left-0 overflow-hidden"
                                            style={{ width: '70%' }}
                                        >
                                            <div className="text-[12px] md:text-[18px] text-amber-400 before:content-['★★★★★']"></div>
                                        </div>
                                    </div>
                                    <p className="text-[12px] text-blanco">
                                        {getFormattedDate()}
                                    </p>
                                </div>
                            </div>
                            {/*            
                            <div className="text-3xl font-bold text-blanco">
                                <span>{docente.puntaje}</span>
                            </div>
                            */}
                        </div>

                        {hasReviewText && (
                            <div className="">
                                <div className="relative">
                                    <textarea
                                        readOnly
                                        className="resize-none w-full bg-tarjetas border-none focus:outline-none text-blanco leading-relaxed overflow-y-auto min-h-15 max-h-50"
                                        value={reviewText}
                                        rows={Math.min(Math.ceil(reviewText.length / 60), 8)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-start">
                            <button
                                onClick={() => handleLikeClick(index)}
                                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200  cursor-pointer ${likes[index].liked
                                    ? ' text-blanco '
                                    : ' '
                                    }`}
                            >
                                <ThumbsUp
                                    className={`w-5 h-5  transition-transform duration-200 ${likes[index].liked ? 'fill-blanco text-tarjetas w-5.5 h-5.5' : ''
                                        }`}
                                />
                                <span className="font-medium">
                                    {likes[index].count > 0 ? likes[index].count : 'Me gusta'}
                                </span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default Cardreview;



