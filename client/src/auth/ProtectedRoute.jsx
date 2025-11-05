import React, {useEffect, useState} from 'react';
import {useAuthStore} from "../stores/useAuthStore.js";
import {Navigate, Outlet} from "react-router";

const ProtectedRoute = () => {
    const {accessToken, user, loading, refresh, fetchMe} = useAuthStore()
    const [starting, setStarting] = useState(true);
    const init = async () => {
        if (!accessToken) {
            await refresh()
        }
        if (accessToken && !user) {
            await fetchMe();
        }

        setStarting(false);
    }

    useEffect(() => {
        init()
    }, [])
    if (starting || loading) {
        return <div>Loading...</div>
    }
    if (!accessToken) {
        return <Navigate to="/signin" replace={true}/>
    }
    return (
        <Outlet></Outlet>
    );
};

export default ProtectedRoute;