import React, { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";

const FilterCombobox = ({ onChange, value }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(value || "highest");

    const options = [
        { value: "highest", label: "Puntaje más alto" },
        { value: "lowest", label: "Puntaje más bajo" },
    ];

    const handleOptionClick = (optionValue) => {
        setSelected(optionValue);
        setIsOpen(false);
        // Llamar a la función onChange del padre
        if (onChange) {
            onChange(optionValue);
        }
    };

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
                 bg-tarjetas hover:bg-gray-700 rounded-lg border border-bordes 
                 transition-colors duration-200 focus:outline-none cursor-pointer"
            >
                <Filter className="w-4 h-4" />
                <span>Ordenar</span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isOpen && (
                <div className="absolute mt-2 w-56 bg-tarjetas border border-bordes 
                       rounded-sm shadow-sm z-2 overflow-hidden ">
                    <div className="">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleOptionClick(option.value)}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors 
                                            duration-150 flex items-center justify-between cursor-pointer
                                            ${selected === option.value
                                        ? "bg-tarjetas text-blue-400"
                                        : "text-gray-300 hover:bg-campo hover:text-white"
                                    }`
                                }
                            >
                                <span>{option.label}</span>
                                {selected === option.value && (
                                    <div className="w-2 h-2 bg-blue-400 rounded-sm"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default FilterCombobox;