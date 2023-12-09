import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NavbarPage } from "./components/templates/NavbarPage.tsx";
import { ThreadsPage } from "./components/pages/ThreadsPage.tsx";
import { RegisterPage } from "./components/pages/RegisterPage.tsx";
import { LoginPage } from "./components/pages/LoginPage.tsx";

export const Router = (): React.ReactNode => (
    <BrowserRouter basename={"/"}>
        <Routes>
            <Route element={<NavbarPage />}>
                <Route index element={<ThreadsPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>
        </Routes>
    </BrowserRouter>
);
