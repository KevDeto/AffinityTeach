import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ value = "", onChange }) => {

    const handleChange = (e) => {
        if (onChange) {
            onChange(e);
        }
    };

    const handleClear = () => {
        onChange({ target: { value: '' } });
    };

    return (
        <div className="text-white flex justify-center mb-6 w-175 search-container">
            <form
                role="search"
                className="w-full h-13 px-4
                     bg-campo grid grid-cols-[auto_1fr_auto] items-center gap-3
                     rounded-sm border border-bordes"
                onSubmit={(e) => e.preventDefault()}
            >
                <Search
                    className="col-start-1 cursor-pointer mr-1"
                />
                <input
                    type="search"
                    className="w-full h-10 bg-campo 
                            focus:outline-none text-md
                            [&::-webkit-search-cancel-button]:hidden
                            [&::-webkit-search-decoration]:hidden
                            [&::-ms-clear]:hidden
                            [&]:-moz-appearance-none peer"
                    placeholder="Buscar docente"
                    value={value}
                    onChange={handleChange}
                />
                {value.length > 0 && (
                    <button
                        type="button"
                        className="col-start-3">
                        <X
                            size={28}
                            strokeWidth={1.3}
                            color="white"
                            onClick={handleClear}
                            className="cursor-pointer"
                        />
                    </button>
                )}
            </form>
        </div>
    );
}

export default SearchBar;