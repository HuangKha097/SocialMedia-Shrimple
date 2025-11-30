import { create } from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import { chatService } from "../services/chatService.js";


export const useChatStore = create(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            activeConversationId: null,
            loading: false,

            setActiveConversationId: (id) => set({ activeConversationId: id }),

            reset: () => {
                set({
                    conversations: [],
                    messages: {},
                    activeConversationId: null,
                    loading: false,
                });
            },

            fetchConversations: async () => {
                try {
                    set({ loading: true });

                    const { conversations } = await chatService.fetchConversations();

                    set({
                        conversations: conversations,
                        loading: false
                    });
                } catch (error) {
                    console.error("Error during fetching conversations", error);
                    set({ loading: false });
                }
            }
        }),

        {
            name: "chat-storage",
            // Chuyển sang dùng sessionStorage
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                conversations: state.conversations
            }),
        }
    )
);