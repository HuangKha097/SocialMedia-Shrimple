import {create} from "zustand";
import {persist} from "zustand/middleware";
import {chatService} from "../services/chatService.js";
import {friendService} from "../services/friendService.js"; // 1. Import thêm service


export const useChatStore = create(
    persist(
        (set, get) => ({
            // --- CODE CŨ ---
            conversations: [],
            messages: {},
            activeConversationId: null,
            loading: false, // Loading của Chat

            // --- CODE MỚI THÊM (State) ---
            friends: [],
            friendRequests: [],
            isFriendRequestsLoading: false, // Loading riêng cho Friend Request

            setActiveConversationId: (id) => set({activeConversationId: id}),

            reset: () => {
                set({
                    conversations: [],
                    messages: {},
                    activeConversationId: null,
                    loading: false,
                    // Reset thêm phần mới
                    friendRequests: [],
                    isFriendRequestsLoading: false,
                });
            },

            fetchConversations: async () => {
                try {
                    set({loading: true});

                    const {conversations} = await chatService.fetchConversations();

                    set({
                        conversations: conversations,
                        loading: false
                    });
                } catch (error) {
                    console.error("Error during fetching conversations", error);
                    set({loading: false});
                }
            },

            fetchFriendRequests: async () => {
                try {
                    set({ isFriendRequestsLoading: true });

                    const data = await friendService.getFriendRequests();

                    set({

                        friendRequests: data.received || [],
                        isFriendRequestsLoading: false
                    });
                } catch (error) {
                    console.error("Error fetching friend requests:", error);
                    set({
                        friendRequests: [],
                        isFriendRequestsLoading: false
                    });
                }
            },

            declineRequestAction: async (requestId) => {
                try {
                    // 1. Gọi API Backend (API decline trả về 204 No Content)
                    await friendService.declineRequest(requestId);

                    // 2. Nếu API thành công, tự động xóa khỏi danh sách trong Store
                    set((state) => ({
                        friendRequests: state.friendRequests.filter((req) => req._id !== requestId)
                    }));

                    // Trả về true để Component biết là thành công (nếu cần hiển thị Toast)
                    return true;
                } catch (error) {
                    console.error("Error declining request:", error);
                    throw error; // Ném lỗi ra để Component hiện Toast lỗi
                }
            },

            // Tương tự cho Accept
            acceptRequestAction: async (requestId) => {
                try {
                    await friendService.acceptRequest(requestId);

                    // Xóa khỏi danh sách chờ (vì đã thành bạn rồi)
                    set((state) => ({
                        friendRequests: state.friendRequests.filter((req) => req._id !== requestId)
                    }));
                    return true;
                } catch (error) {
                    console.error("Error accepting request:", error);
                    throw error;
                }
            },
            fetchFriends: async () => {
                try {
                    const data = await friendService.getFriends();
                    // API trả về { friends: [...] }
                    set({ friends: data.friends || [] });
                } catch (error) {
                    console.error("Error fetching friends:", error);
                    set({ friends: [] });
                }
            },

            // Hàm remove thuần túy (giữ lại nếu cần dùng cho socket sau này)
            removeFriendRequest: (requestId) => {
                set((state) => ({
                    friendRequests: state.friendRequests.filter((req) => req._id !== requestId)
                }));
            },
        }),

        {
            name: "chat-storage",

            partialize: (state) => ({
                conversations: state.conversations,
                friends: state.friends,
                friendRequests: state.friendRequests,
                activeConversationId: state.activeConversationId,
            }),
        }
    )
);