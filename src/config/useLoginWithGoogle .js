import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/config/firebaseconfig"
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuthStore } from "@/stores/authStore";

export const useLoginWithGoogle = () => {
    const handleClickLoginGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);

            if (!userCredential.user) throw new Error("Error al loguear con google");

            const userRef = doc(db, "users", userCredential.user.uid);
            const userDb = await getDoc(userRef);

            if (!userDb.exists()) {
                await setDoc(userRef, {
                    username: userCredential.user.email,
                    email: userCredential.user.email,
                    avatar: "default.png",
                    createdAt: new Date().toISOString(),
                });
            }

            return userCredential.user;

        } catch (error) {
            console.error("Error en login con Google:", error);
            throw error;
        }
    }
    return { handleClickLoginGoogle };
}

export default useLoginWithGoogle;
