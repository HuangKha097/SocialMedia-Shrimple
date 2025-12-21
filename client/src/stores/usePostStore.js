import { create } from "zustand";
import api from "../lib/axios.js";
import { toast } from "sonner";

export const usePostStore = create((set, get) => ({
    posts: [],
    videoPosts: [],
    isLoading: false,

    fetchPosts: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get("/api/posts");
            set({ posts: res.data });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to fetch posts");
        } finally {
            set({ isLoading: false });
        }
    },

    createPost: async (postData) => {
        set({ isLoading: true });
        try {
            // Check if postData.image is a File object to determine if we need FormData
            let dataToSend = postData;
            let headers = {};

            if (postData.image instanceof File) {
                const formData = new FormData();
                formData.append("content", postData.content);
                formData.append("media", postData.image);
                dataToSend = formData;
                // headers = { "Content-Type": "multipart/form-data" }; // Let browser/axios set this
            }

            const res = await api.post("/api/posts/create", dataToSend); // removed explicit headers
            set((state) => ({ posts: [res.data, ...state.posts] }));
            toast.success("Post created successfully");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create post");
        } finally {
            set({ isLoading: false });
        }
    },

    likePost: async (postId) => {
        try {
            const res = await api.put(`/api/posts/like/${postId}`);
            // Update local state is tricky because we need the full updated post or handle it manually.
            // The API returns the updated post.
            set((state) => ({
                posts: state.posts.map((post) => (post._id === postId ? res.data : post)),
                videoPosts: state.videoPosts.map((post) => (post._id === postId ? res.data : post)), // Also update video feed
            }));
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to like post");
        }
    },

    addComment: async (postId, text) => {
        try {
            const res = await api.put(`/api/posts/comment/${postId}`, { text });
            set((state) => ({
                posts: state.posts.map((post) => (post._id === postId ? res.data : post)),
                videoPosts: state.videoPosts.map((post) => (post._id === postId ? res.data : post)), // Also update video feed
            }));
            toast.success("Comment added");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add comment");
        }
    },

    deletePost: async (postId) => {
        try {
            await api.delete(`/api/posts/${postId}`);
            set((state) => ({
                posts: state.posts.filter((post) => post._id !== postId),
            }));
            toast.success("Post deleted");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete post");
        }
    },

    savedPosts: [], 
    userPosts: [],

    fetchUserPosts: async (userId) => {
        set({ isLoading: true });
        try {
            const res = await api.get(`/api/posts/user/${userId}`);
            set({ userPosts: res.data });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to fetch user posts");
        } finally {
            set({ isLoading: false });
        }
    },

    fetchVideoFeed: async (page = 1) => {
        try {
            const res = await api.get(`/api/posts/videos?page=${page}&limit=5`);
            if (page === 1) {
                set({ videoPosts: res.data });
            } else {
                set(state => ({ videoPosts: [...state.videoPosts, ...res.data] }));
            }
            return res.data;
        } catch (error) {
            console.error(error);
            toast.error("Failed to load videos");
            return [];
        }
    },

    getPostById: async (postId) => {
        // ... (existing code)
        try {
            const res = await api.get(`/api/posts/single/${postId}`);
            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    toggleSavePost: async (postId) => {
        try {
            const res = await api.post("/api/users/toggle-save", { postId });
            
            // We can locally update the savedPosts array if we have it loaded
            const currentSaved = get().savedPosts;
            const isAlreadySaved = currentSaved.some(p => p._id === postId);
            
            if (isAlreadySaved) {
                set({ savedPosts: currentSaved.filter(p => p._id !== postId) });
                 toast.success("Post unsaved");
            } else {
                toast.success("Post saved");
            }
            
            // Update AuthStore User object too, so UI relying on user.savedPosts updates immediately
             import("./useAuthStore.js").then(({ useAuthStore }) => {
                 const user = useAuthStore.getState().user;
                 if (user) {
                     let newSavedPosts = user.savedPosts || [];
                     // Check if it's already in the user's list (which might be just IDs or Objects)
                     const exists = newSavedPosts.some(id => (typeof id === 'string' ? id : id._id) === postId);
                     
                     if (exists) {
                         newSavedPosts = newSavedPosts.filter(id => (typeof id === 'string' ? id : id._id) !== postId);
                     } else {
                         newSavedPosts = [...newSavedPosts, postId];
                     }
                     useAuthStore.getState().updateUser({ savedPosts: newSavedPosts });
                 }
             });

            return res.data;
        } catch (error) {
             console.error(error);
             toast.error(error.response?.data?.message || "Failed to toggle save");
        }
    },

    fetchSavedPosts: async () => {
        set({ isLoading: true });
        try {
             // Note: Route depends on userRoute definition. userRoute is usually mounted at /api/users
             const res = await api.get("/api/users/saved-posts");
             set({ savedPosts: res.data });
        } catch (error) {
             console.error(error);
             toast.error(error.response?.data?.message || "Failed to fetch saved posts");
        } finally {
             set({ isLoading: false });
        }
    },
}));
