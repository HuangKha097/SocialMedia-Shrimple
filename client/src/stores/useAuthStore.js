import {create} from "zustand";
import {persist} from "zustand/middleware";
import {toast} from "sonner";
import {authService} from "../services/authService.js";
import {useChatStore} from "./useChatStore.js";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "https://shrimple.onrender.com";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            accessToken: null,
            user: null,
            loading: false,
            socket: null,
            onlineUsers: [],

            checkAuth: async () => { await get().fetchMe(); },

            signUp: async (username, password, email, firstName, lastName, gender, birthday) => {
                try {
                    set({loading: true});
                    const res = await authService.signUp(username, password, email, firstName, lastName, gender, birthday);
                    toast.success("Sign Up Successfully!");
                    return res;
                } catch (err) {
                    console.error(err);
                    const errorMsg = err.response?.data?.message || "Sign Up Failed!";
                    toast.error(errorMsg);
                } finally {
                    set({loading: false});
                }
            },


            signIn: async (email, password) => {
                try {
                    set({loading: true});

                    // xoá dữ liệu cũ, Phòng lỗi user bị văng khi chưa logout
                    localStorage.clear()
                    useChatStore.getState().reset()

                    const res = await authService.signIn(email, password);
                    const {accessToken, message} = res;

                    if (accessToken) {
                        localStorage.setItem("accessToken", accessToken);
                    }

                    get().setAccessToken(accessToken);
                    await get().fetchMe(); // This will connect socket now inside fetchMe or explicitly here

                    await useChatStore.getState().fetchConversations()
                    await useChatStore.getState().fetchFriends()
                    await useChatStore.getState().fetchFriendRequests()

                    get().connectSocket(); // Ensure connection

                    toast.success(message || "Sign In successfully!");
                    return {success: true};
                } catch (err) {
                    console.error(err);
                    const errorMsg = err.response?.data?.message || "Sign In Failed!";
                    toast.error(errorMsg);
                    return {success: false};
                } finally {
                    set({loading: false});
                }
            },

            signOut: async () => {
                try {
                    toast.success("Sign Out Successfully!");
                    get().disconnectSocket(); // Disconnect
                    get().clearState();
                    await authService.signOut();
                } catch (error) {
                    console.error(error);
                    toast.error("Sign Out Failed!");
                }
            },


            fetchMe: async () => {
                try {
                    set({loading: true});
                    const user = await authService.fetchMe();
                    set({user});
                    get().connectSocket(); // Connect on refresh/load
                } catch (err) {
                    console.log(err);
                    set({user: null, accessToken: null});
                    toast.error("Failed to fetch user, try again!");
                } finally {
                    set({loading: false});
                }
            },

            refresh: async () => {
                try {
                    set({loading: true});
                    const {user, fetchMe, setAccessToken} = get();
                    const accessToken = await authService.refresh();
                    console.log(accessToken)

                    setAccessToken(accessToken);

                    if (!user) {
                        await fetchMe();
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("Session is expired, please sign in again!");
                    get().clearState();
                } finally {
                    set({loading: false});
                }
            },


            clearState: () => {
                get().disconnectSocket();
                set({user: null,accessToken: null, onlineUsers: [], socket: null});
                localStorage.clear()
                useChatStore.getState().reset()
            },
            setAccessToken: (accessToken) => set({accessToken}),
            updateUser: (newData) => {
                set((state) => ({ user: { ...state.user, ...newData } }));
            },

            connectSocket: () => {
                const { user, socket } = get();
                if (!user || socket?.connected) return;

                const newSocket = io(BASE_URL, {
                    query: {
                        userId: user._id,
                    },
                });

                newSocket.connect();
                set({ socket: newSocket });

                newSocket.on("getOnlineUsers", (userIds) => {
                    set({ onlineUsers: userIds });
                });
                
                // Subscribe to chat events
                useChatStore.getState().subscribeToMessages();
            },

            disconnectSocket: () => {
                useChatStore.getState().unsubscribeFromMessages();
                if (get().socket?.connected) get().socket.disconnect();
                set({ socket: null, onlineUsers: [] });
            }

        }),

        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
            }),
        }
    )
);
