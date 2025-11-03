import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import { Toaster } from "sonner";

const App = () => {
    return (
        <>
            <Toaster richColors />
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/signup" element={<SignUpPage />} />

                    {/* Protected routes */}
                    <Route path="/" element={<ChatPage />} />
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;
