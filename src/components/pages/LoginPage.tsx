import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import type { FieldValues } from "react-hook-form";
import { auth } from "../../database/firebase";
import { FirebaseError } from "@firebase/util";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AuthForm } from "../AuthForm.tsx";
import { AuthContext } from "../../context/AuthProvider.tsx";
import { AuthActionEnum } from "../../context/AuthReducer.ts";

export const LoginPage = (): React.ReactNode => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = async (data: FieldValues): Promise<void> => {
        setError(null);
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                data.email,
                data.password,
            );
            dispatch({
                type: AuthActionEnum.LOGIN,
                payload: userCredential.user,
            });
            setLoading(false);
            navigate("/profile");
        } catch (error: unknown) {
            setLoading(false);
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case "auth/invalid-credential":
                        setError(
                            "Les informations que vous avez renseignées sont fausses",
                        );
                        break;
                    case "auth/invalid-email":
                        setError("Le format de l'email est invalide");
                        break;
                    case "auth/email-already-in-use":
                        setError("L'email est déjà utilisé'");
                        break;
                    case "auth/too-many-requests":
                        setError(
                            "Trop de requêtes envoyées au serveur. Patientez quelques instants...",
                        );
                        break;
                    default:
                        setError("Une erreur est survenue : " + error.code);
                        break;
                }
            } else {
                setError("An error has occurred");
            }
        }
    };

    return (
        <div className="container">
            <AuthForm
                title={"Login"}
                loading={loading}
                passwordError={null}
                backEndError={error}
                onSubmit={onSubmit}
                textButton={"Login"}
            />
        </div>
    );
};
