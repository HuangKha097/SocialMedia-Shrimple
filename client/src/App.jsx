import React, {useEffect} from 'react';
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import {Toaster} from "sonner";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import {useThemeStore} from "./stores/useThemeStore.js";
import PostsContainer from "./components/posts/PostsContainer.jsx";
import ChatContainer from "./components/chat/ChatContainer.jsx";
import { useOutletContext } from "react-router-dom";
import SinglePostPage from "./pages/SinglePostPage.jsx";
import SavedPostsContainer from "./components/posts/SavedPostsContainer.jsx";
import FriendsContainer from "./components/posts/FriendsContainer.jsx";
import ProfileContainer from "./components/posts/ProfileContainer.jsx";
import VideoFeed from "./pages/VideoFeed.jsx";

import CallModal from "./components/chat/CallModal.jsx";
import { useCallStore } from "./stores/useCallStore.js";
import { useAuthStore } from "./stores/useAuthStore.js";

// Wrapper to consume outlet context and pass it to ChatContainer
const ChatContainerWrapper = () => {
    const context = useOutletContext();
    return <ChatContainer {...context} />;
};

const App = () => {
    const {isLight, primaryColor} = useThemeStore();
    const { subscribeToCallEvents, unsubscribeFromCallEvents } = useCallStore();
    const { user } = useAuthStore(); // Check if user is logged in to subscribe

    useEffect(() => {
        if (isLight) {
            document.documentElement.classList.add("light");
        } else {
            document.documentElement.classList.remove("light");
        }
    }, [isLight]);

    useEffect(() => {
        if (primaryColor) {
             document.documentElement.style.setProperty("--primary-color", primaryColor);
        }
    }, [primaryColor]);

    // Subscribe to call events
    useEffect(() => {
        if (user) {
            subscribeToCallEvents();
        }
        return () => {
            unsubscribeFromCallEvents();
        };
    }, [user, subscribeToCallEvents, unsubscribeFromCallEvents]);

    return (
        <>
            <Toaster richColors/>
            <CallModal />
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/signin" element={<SignInPage/>}/>
                    <Route path="/signup" element={<SignUpPage/>}/>


                    <Route element={<ProtectedRoute/>}>
                        <Route path="/post/:postId" element={<SinglePostPage />} />
                        <Route element={<ChatPage/>}>
                            <Route path="/" element={<Navigate to="/feed" replace/>}/>
                            <Route path="/chat" element={<ChatContainerWrapper />}/>
                            <Route path="/feed" element={<PostsContainer />}/>
                            <Route path="/feed/saved" element={<SavedPostsContainer />}/>
                            <Route path="/feed/friends" element={<FriendsContainer />}/>
                            <Route path="/feed/profile/:userId" element={<ProfileContainer />}/>
                            <Route path="/video" element={<VideoFeed />}/>
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;
