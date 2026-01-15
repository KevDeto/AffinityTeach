import React from "react";
import { CircleUserRound } from 'lucide-react'
import SearchInput from "@/components/ui/searchbar/Searchbar";
import FilterCombobox from "@/components/ui/filtercombobox/Filtercombobox";
import Card from "../card/Card";
import Buttonreview from "@/components/ui/buttonreview/Buttonreview";

const Container = () => {

    return (
        <main className="w-200 min-h-full bg-fondo border-2 
            border-dashed border-y-transparent border-bordes
            m-auto text-white p-4">
            <div className="relative flex justify-center p-3 mt-4">
                <h1 className="text-3xl font-semibold">AffinityTeach</h1>
                <CircleUserRound
                    strokeWidth={1}
                    size={48}
                    className="absolute right-4 top-1/2 -translate-y-1/2 mr-3 cursor-pointer"
                />
            </div>
            <div className="w-175 flex-col justify-center m-auto mt-6">
                <SearchInput />
                <FilterCombobox />
                <div className="w-180">
                    <div className="max-h-[calc(100vh-298px)] overflow-y-auto 
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:bg-transparent
                         [&::-webkit-scrollbar-thumb]:bg-bordes
                        [&::-webkit-scrollbar-thumb]:rounded-full
                         [&::-webkit-scrollbar-thumb]:hover:bg-gray-500
                         [&::-webkit-scrollbar-thumb]:cursor-pointer
                        mt-6">
                        <div className="pr-3">
                            <Card />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Container;