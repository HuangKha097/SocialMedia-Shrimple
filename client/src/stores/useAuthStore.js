import {create} from "zustand";
import {toast} from "sonner";
import {authService} from "../services/authService.js";

export const useAuthStore = create((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

    signUp: async (username, password, email, firstName, lastName, gender, birthday) => {
        try {
            set({loading: true});
            const res = await authService.signUp(username, password, email, firstName, lastName, gender, birthday)
            toast.success("Sign Up Successfully !");
            return res;
        } catch (err) {
            console.log(err);
            const errorsMsg = err.response?.data?.message ||"Sign Up Failed!";
            toast.error(errorsMsg);

        } finally {
            set({loading: false});

        }
    },
    signIn: async (email, password,) => {
        try {
            set({loading: true});

            const res = await authService.signIn(email, password);
            const {accessToken, message} = res;
            set({accessToken});

            toast.success(message || "Sign In successfully!");
            return {success: true, message: message || 'Sign In successfully!'};
        } catch (err) {
            console.log(err);
            const errorMsg = err.response?.data?.message || "Sign In Failed!";
            toast.error(errorMsg);
        } finally {
            set({loading: false});
        }
    },
    signOut: async () => {
        try {
            get().clearState()
            const res = await authService.signOut()
            toast.success("Sign Out Successfully!");
            return res;
        } catch (error) {
            console.error(error);
            toast.error("Sign Out Failed!");
        }
    }
}))