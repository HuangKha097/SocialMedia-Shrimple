import React, {useEffect} from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import {Toaster} from "sonner";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import {useThemeStore} from "./stores/useThemeStore.js";


const App = () => {
    const {isLight, setTheme} = useThemeStore()

    useEffect(() => {
        setTheme(isLight);
    }, [isLight])
    return (
        <>
            <Toaster richColors/>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/signin" element={<SignInPage/>}/>
                    <Route path="/signup" element={<SignUpPage/>}/>

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/" element={<ChatPage/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;
