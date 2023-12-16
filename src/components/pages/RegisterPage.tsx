import React, { useState } from "react";
import { AuthForm } from "../AuthForm.tsx";
import { useNavigate } from "react-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../database/firebase.ts";
import { FirebaseError } from "@firebase/util";
import { doc, setDoc } from "firebase/firestore";
import type { UserCredentialsDto } from "../../types/dto/UserCredentialsDto.ts";
import { DatabaseCollectionEnum } from "../../types/DatabaseCollectionEnum.ts";

export const RegisterPage = (): React.ReactNode => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string | undefined>(
        undefined,
    );
    const navigate = useNavigate();

    const onSubmit = async (data: UserCredentialsDto): Promise<void> => {
        setPasswordError(undefined);
        setError(undefined);
        if (data.password.length < 8) {
            setPasswordError(
                "Le mot de passe doit contenir au moins 8 caractères",
            );
        } else {
            setLoading(true);
            try {
                const { user } = await createUserWithEmailAndPassword(
                    auth,
                    data.email,
                    data.password,
                );
                await setDoc(
                    doc(db, DatabaseCollectionEnum.USERS, user.uid),
                    {},
                );
                setLoading(false);
                navigate("/login");
            } catch (error: unknown) {
                setLoading(false);
                if (error instanceof FirebaseError) {
                    switch (error.code) {
                        case "auth/weak-password":
                            setError("Le mot de passe est trop faible");
                            break;
                        case "auth/invalid-email":
                            setError("Le format de l'email est invalide");
                            break;
                        case "auth/email-already-in-use":
                            setError(
                                "L'email est déjà utilisé pour un autre compte",
                            );
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
        }
    };

    return (
        <div className="container">
            <AuthForm
                title={"Register"}
                loading={loading}
                passwordError={passwordError}
                backEndError={error}
                onSubmit={onSubmit}
                textButton={"Register"}
            />
        </div>
    );
};
