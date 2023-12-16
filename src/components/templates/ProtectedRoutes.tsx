import { useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "../../providers/AuthProvider.tsx";
import { Navigate, useLocation } from "react-router";
import { AuthActionEnum } from "../../reducers/AuthReducer.ts";
import { Outlet } from "react-router-dom";

export const ProtectedRoutes = (): ReactNode => {
    const { dispatch } = useContext(AuthContext);
    const location = useLocation();
    const user = localStorage.getItem("@user");

    useEffect(() => {
        if (user != null) {
            dispatch({ type: AuthActionEnum.LOGIN, payload: JSON.parse(user) });
        }
    }, [user]);

    if (user == null) {
        console.warn(
            "You must be logged in to view this page. Redirection to the login page...",
        );
        // eslint-disable-next-line react/react-in-jsx-scope
        return <Navigate to="/login" state={{ from: location.pathname }} />;
    }

    // eslint-disable-next-line react/react-in-jsx-scope
    return <Outlet />;
};
