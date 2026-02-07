import React, { useEffect, useRef, useState } from 'react';
import { Loader2, LogIn, LogOut, UserRound } from 'lucide-react'
import Startrating from './Startrating';
import Cardreview from '../cardreview/Cardreview';
import FilterCombobox from '@/components/ui/filtercombobox/Filtercombobox';
import Buttonreview from '@/components/ui/buttonreview/Buttonreview';
import { Link } from "react-router-dom";
import { useDocenteStore } from '@/stores/docenteStore';
import useLoginWithGoogle from '@/config/useLoginWithGoogle ';
import { auth } from '@/config/firebaseconfig';

const Containerreview = () => {
    const { docenteSeleccionado } = useDocenteStore();
    const [order, setOrder] = useState("highest");
    const docenteId = docenteSeleccionado?.id;
    const [user, setUser] = useState(null);
    const { handleClickLoginGoogle } = useLoginWithGoogle();
    const shouldOpenAfterLogin = useRef(false);
    const [authChecked, setAuthChecked] = useState(false);
    const handleOrderChange = (newOrder) => {
        setOrder(newOrder);
    }
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setAuthChecked(true); // Marcamos que ya verificamos

            if (currentUser && shouldOpenAfterLogin.current) {
                console.log("Usuario autenticado:", currentUser.email);
                shouldOpenAfterLogin.current = false;
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        // Verificar si ya está autenticado
        if (!user) {
            shouldOpenAfterLogin.current = true; // Solo esto

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
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            console.log("Sesión cerrada exitosamente");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const handleAuthButtonClick = async () => {
        if (user) {
            await handleLogout();
        } else {
            await handleLogin();
        }
    };

    const resenasOrdenadas = docenteSeleccionado?.resenas
        ? [...docenteSeleccionado.resenas].sort((a, b) => {
            if (order === "highest") {
                // Más estrellas primero (descendente)
                return (b.estrellas || 0) - (a.estrellas || 0);
            }
            if (order === "lowest") {
                // Menos estrellas primero (ascendente)
                return (a.estrellas || 0) - (b.estrellas || 0);
            }
            return 0;
        })
        : [];

    // No necesitas la parte de search/filter si solo quieres ordenar
    const results = resenasOrdenadas;

    return (
        <main className="w-200 min-h-screen bg-fondo border-2 
            border-dashed border-y-transparent border-bordes
            m-auto text-white p-4">
            <div className="relative flex justify-center p-3 mt-4">
                <Link to="/">
                    <h1 className="text-3xl font-semibold">AffinityTeach</h1>
                </Link>
                {/*}
                <CircleUserRound
                    strokeWidth={1}
                    size={48}
                    className="absolute right-4 top-1/2 -translate-y-1/2 mr-3 cursor-pointer"
                />
                */}
                {!authChecked ? (
                    <Loader2
                        size={28}
                        className="animate-spin absolute -right-4 top-1/2 -translate-y-1/2 mr-3 cursor-pointer"
                    />
                ) : (
                    <button
                        onClick={handleAuthButtonClick}
                        className="absolute right-4 top-1/2 -translate-y-1/2 mr-3 cursor-pointer"
                        title={user ? "Cerrar sesión" : "Iniciar sesión con Google"}
                    >
                        {user ? (
                            // Icono de logout cuando está autenticado
                            <LogOut
                                strokeWidth={3}
                                size={32}
                                className="absolute -right-4 top-1/2 -translate-y-1/2 mr-3 cursor-pointer"
                                title="Cerrar sesión"
                            />
                        ) : (
                            // Icono de login cuando no está autenticado
                            <LogIn
                                strokeWidth={3}
                                size={32}
                                className="absolute -right-4 top-1/2 -translate-y-1/2 mr-3 cursor-pointer"
                                title="Iniciar sesión con Google"
                            />
                        )}
                    </button>
                )}
            </div>
            <div className="w-175 flex justify-start m-auto mt-10 items-center gap-4 mb-6 px-1.5 docente-container">
                <div className="w-17 h-17 rounded-full bg-gray-600 flex justify-center 
                        items-center">
                    <UserRound size={32} />
                </div>
                <div>
                    <h2 className="text-[18px]">{docenteSeleccionado?.nombre}</h2>
                </div>
            </div>
            <div className="w-175 flex-col justify-center m-auto mt-6 div-main">

                <div className="w-180 div-card">
                    <div className="card-container h-[calc(100vh-250px)] overflow-y-auto 
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:bg-transparent
                         [&::-webkit-scrollbar-thumb]:bg-bordes
                        [&::-webkit-scrollbar-thumb]:rounded-full
                         [&::-webkit-scrollbar-thumb]:hover:bg-gray-500
                         [&::-webkit-scrollbar-thumb]:cursor-pointer
                        mt-6">
                        <div className="pr-3">
                            <Startrating />
                            <div className='flex justify-between align-middle mb-6'>
                                <FilterCombobox onChange={handleOrderChange} value={order} />
                                <Buttonreview docenteId={docenteId} />
                            </div>
                            <Cardreview resenas={results} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Containerreview;