import {create} from "zustand";
import {persist} from "zustand/middleware";
import {toast} from "sonner";
import {authService} from "../services/authService.js";
import {useChatStore} from "./useChatStore.js";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            accessToken: null,
            user: null,
            loading: false,


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
                    await get().fetchMe();
                    await useChatStore.getState().fetchConversations()

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
                set({user: null,accessToken: null});
                localStorage.clear()
                useChatStore.getState().reset()
            },
            setAccessToken: (accessToken) => set({accessToken}),

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
