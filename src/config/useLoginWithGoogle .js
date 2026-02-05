import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/config/firebaseconfig"
import { doc, setDoc, getDoc } from "firebase/firestore";

export  const useLoginWithGoogle  = () => {
    const handleClickLoginGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            if (!userCredential.user) throw new Error("Error al loguear con google");

            const useRef = doc(db, "users", userCredential.user.uid);
            const userDb = await getDoc(useRef);

            if (!userDb.exists()) {
                await setDoc(useRef, {
                    username: userCredential.user.email,
                    email: userCredential.user.email,
                    avatar: "default.png"
                })
            }

        } catch (error) {

        }
    }
    return { handleClickLoginGoogle };
}

export default useLoginWithGoogle;
