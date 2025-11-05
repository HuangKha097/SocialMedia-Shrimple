import api from "../lib/axios.js";

export const authService = {
    signUp: async (username, password, email, firstName, lastName, gender, birthday) => {
        const res = await api.post("/api/auth/signup", {
            username,
            password,
            email,
            firstName,
            lastName,
            gender,
            birthday
        }, {withCredentials: true})
        return res.data;
    },

    signIn: async (email, password) => {
        const res = await api.post("/api/auth/signin", {
            email,
            password
        }, {withCredentials: true})
        return res.data; // accessToken
    },

    signOut: async () => {
        return await api.post("/api/auth/signout", {withCredentials: true})
    },

    fetchMe: async () => {
        const res = await api.get("/api/users/me", {withCredentials: true})

        return res.data.user;
    },
    refresh: async () => {
        const res = await api.post("/api/auth/refresh", {withCredentials: true})
        return res.data.accessToken;
    }
}