import React from "react";

const StarRating = () => {
    const ratings = [
        { stars: 5, percentage: 20 },
        { stars: 4, percentage: 40 },
        { stars: 3, percentage: 70 },
        { stars: 2, percentage: 30 },
        { stars: 1, percentage: 10 },
    ];

    const averageRating = 5.0;
    const totalReviews = 290291;

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
                            style={{ width: '10%' }}
                        >
                            <div className="text-2xl md:text-3xl text-amber-400 before:content-['★★★★★']"></div>
                        </div>
                    </div>

                    <p className="text-white text-sm md:text-base">
                        {totalReviews.toLocaleString()} reseñas
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StarRating;