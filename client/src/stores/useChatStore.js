import {create} from "zustand";
import {persist} from "zustand/middleware";
import {chatService} from "../services/chatService.js";
import {friendService} from "../services/friendService.js";
import {useAuthStore} from "./useAuthStore.js"; // 1. Import thêm service


export const useChatStore = create(
    persist(
        (set, get) => ({

            conversations: [],
            messages: {},
            activeConversationId: null,
            loading: false, // convo loading
            messageLoading: false,
            isCreatingGroup: false,

            friends: [],
            friendRequests: [],
            suggestedFriends: [],
            isFriendRequestsLoading: false,

            setActiveConversationId: (id) => set({activeConversationId: id}),

            reset: () => {
                set({
                    conversations: [],
                    messages: {},
                    activeConversationId: null,
                    loading: false,
                    messageLoading: false,

                    friendRequests: [],
                    isFriendRequestsLoading: false,
                });
            },

            fetchConversations: async () => {
                try {
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
                    set({isFriendRequestsLoading: true});

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

                    await friendService.declineRequest(requestId);
                    set((state) => ({
                        friendRequests: state.friendRequests.filter((req) => req._id !== requestId)
                    }));
                    return true;
                } catch (error) {
                    console.error("Error declining request:", error);
                    throw error;
                }
            },
            acceptRequestAction: async (requestId) => {
                try {
                    await friendService.acceptRequest(requestId);


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
                    set({friends: data.friends || []});
                } catch (error) {
                    console.error("Error fetching friends:", error);
                    set({friends: []});
                }
            },
            fetchSuggestedFriends: async () => {
                try {
                    const data = await friendService.getSuggestedFriends();
                    set({suggestedFriends: data || []});
                } catch (error) {
                    console.error("Error fetching suggested friends:", error);
                    set({suggestedFriends: []});
                }
            },
            unfriendAction: async (friendId) => {
                try {
                    await friendService.unfriend(friendId);
                    set((state) => ({
                         friends: state.friends.filter(f => f._id !== friendId)
                    }));
                } catch (error) {
                    console.error("Error unfriending user:", error);
                    throw error;
                }
            },

            sendRequestAction: async (targetUserId) => {
                try {
                    await friendService.sendRequest(targetUserId);
                    // Optionally update state if needed, e.g. add to sent requests list
                     set((state) => ({
                         // Maybe track sent requests ID to disable button
                     }));
                } catch (error) {
                    console.error("Error sending friend request:", error);
                    throw error;
                }
            },

            removeFriendRequest: (requestId) => {
                set((state) => ({
                    friendRequests: state.friendRequests.filter((req) => req._id !== requestId)
                }));
            },
            fetchMessages: async (conversationId) => {
                const {activeConversationId, messages} = get();
                const {user} = useAuthStore.getState()

                const convoId = conversationId ?? activeConversationId;

                if (!convoId) return;

                const current = messages?.[convoId];

                const nextCursor = current?.nextCursor === undefined ? "" : current?.nextCursor;

                if (nextCursor === null) return;

                set({messageLoading: true});

                try {
                    const {messages: fetched, cursor} = await chatService.fetchMessage(conversationId, nextCursor);

                    const processed = fetched.map((m) => ({
                        ...m,
                        isOwn: m.senderId === user?._id,
                    }))
                    set((state) => {
                        const prev = state.messages[convoId]?.item ?? [];
                        const merged = prev.length > 0 ? [...processed, ...prev] : processed;

                        return {
                            messages: {
                                ...state.messages,
                                [convoId]: {
                                    items: merged,
                                    hasMore: !!cursor,
                                    nextCursor: cursor ?? null,
                                }
                            }
                        }
                    })
                } catch (error) {
                    console.error("Error declining message:", error);
                } finally {
                    set({messageLoading: false});
                }
            },
            sendDirectMessage: async (recipientId, content, conversationId) => {
                const { user } = useAuthStore.getState();
                const { activeConversationId } = get();

                // Xác định conversationId gửi đi (ưu tiên tham số truyền vào, sau đó đến activeId)
                // Lưu ý: Nếu activeId là "temp_...", ta gửi conversationId = null lên server
                let targetConvoId = conversationId || activeConversationId;
                if (targetConvoId && targetConvoId.toString().startsWith('temp_')) {
                    targetConvoId = null;
                }

                try {
                    // 1. Gọi API
                    const response = await chatService.sendDirectMessage(recipientId, content, targetConvoId);
                    const newMessage = response.message;

                    // 2. Xác định ID cuộc trò chuyện thực sự sau khi server trả về
                    const realConversationId = newMessage.conversationId;

                    // 3. Xử lý tin nhắn mới (Thêm isOwn = true vì mình vừa gửi)
                    const processedMessage = {
                        ...newMessage,
                        isOwn: true,
                        senderId: user?._id // Đảm bảo có senderId để render avatar nếu cần
                    };

                    set((state) => {
                        // A. Cập nhật Messages State
                        const existingMessages = state.messages[realConversationId]?.items || [];
                        const updatedMessages = [...existingMessages, processedMessage];

                        // B. Cập nhật Conversations State (Danh sách bên trái)
                        let updatedConversations = [...state.conversations];
                        const convoIndex = updatedConversations.findIndex(c => c._id === realConversationId);

                        if (convoIndex !== -1) {
                            // Trường hợp 1: Cuộc trò chuyện ĐÃ CÓ trong danh sách
                            // -> Cập nhật lastMessage và đưa lên đầu
                            const updatedConvo = {
                                ...updatedConversations[convoIndex],
                                lastMessage: {
                                    content: processedMessage.content,
                                    createdAt: processedMessage.createdAt,
                                    senderId: user?._id // Hoặc object user nếu schema yêu cầu
                                },
                                updatedAt: new Date().toISOString(), // Để sort
                                lastMessageAt: new Date().toISOString()
                            };

                            // Xoá vị trí cũ, thêm vào đầu
                            updatedConversations.splice(convoIndex, 1);
                            updatedConversations.unshift(updatedConvo);

                            return {
                                messages: {
                                    ...state.messages,
                                    [realConversationId]: {
                                        ...state.messages[realConversationId],
                                        items: updatedMessages
                                    }
                                },
                                conversations: updatedConversations
                            };
                        } else {
                            // Trường hợp 2: Cuộc trò chuyện MỚI (chưa có trong list conversations)
                            // -> Đây chính là lúc gây ra lỗi duplicate nếu không xử lý kỹ.
                            // -> Cách an toàn nhất: Gọi fetchConversations để lấy full data (avatar, name partner...)
                            // -> Cập nhật messages trước để hiện tin nhắn ngay

                            // Trigger fetch lại conversation ngầm
                            get().fetchConversations();

                            // Nếu trước đó đang ở state 'temp_', cần chuyển activeConversationId sang ID thật
                            if (activeConversationId && activeConversationId.toString().startsWith('temp_')) {
                                return {
                                    activeConversationId: realConversationId, // Chuyển sang ID thật
                                    messages: {
                                        ...state.messages,
                                        [realConversationId]: { items: [processedMessage], hasMore: false, nextCursor: null }
                                    }
                                };
                            }

                            return {
                                messages: {
                                    ...state.messages,
                                    [realConversationId]: { items: updatedMessages, hasMore: false, nextCursor: null }
                                }
                            };
                        }
                    });

                } catch (error) {
                    console.error("Failed to send message:", error);
                    // Có thể thêm toast error ở đây
                    throw error;
                }
            },
            createConversation: async (isGroup, name, memberIds) => {
                set({ isCreatingGroup: true });
                try {
                    // Gọi API từ chatService
                    const newConversation = await chatService.createConversation(isGroup, name, memberIds);

                    set((state) => ({
                        // Thêm cuộc trò chuyện mới vào đầu danh sách
                        conversations: [newConversation, ...state.conversations],
                        // Tự động chuyển sang cuộc trò chuyện mới vừa tạo (tuỳ chọn)
                        activeConversationId: newConversation._id,
                        isCreatingGroup: false
                    }));

                    return newConversation;
                } catch (error) {
                    console.error("Error creating conversation:", error);
                    set({ isCreatingGroup: false });
                    throw error; // Ném lỗi để UI (CreateGroupPopup) bắt và hiện Toast
                }
            },
            sendGroupMessage: async (conversationId, content) => {
                const { user } = useAuthStore.getState();

                try {
                    // 1. Gọi API gửi tin nhắn nhóm
                    const response = await chatService.sendGroupMessage(conversationId, content);
                    const newMessage = response.message;

                    // 2. Tạo object tin nhắn để update UI ngay lập tức
                    const processedMessage = {
                        ...newMessage,
                        isOwn: true, // Đánh dấu là tin nhắn của mình
                        senderId: user?._id
                    };

                    set((state) => {
                        // A. Cập nhật danh sách Messages
                        const existingMessages = state.messages[conversationId]?.items || [];
                        const updatedMessages = [...existingMessages, processedMessage];

                        // B. Cập nhật danh sách Conversations (Đưa nhóm lên đầu)
                        let updatedConversations = [...state.conversations];
                        const convoIndex = updatedConversations.findIndex(c => c._id === conversationId);

                        if (convoIndex !== -1) {
                            const updatedConvo = {
                                ...updatedConversations[convoIndex],
                                lastMessage: {
                                    content: content,
                                    createdAt: new Date().toISOString(),
                                    senderId: user?._id
                                },
                                updatedAt: new Date().toISOString(),
                                lastMessageAt: new Date().toISOString()
                            };

                            // Xoá vị trí cũ, đưa lên đầu mảng
                            updatedConversations.splice(convoIndex, 1);
                            updatedConversations.unshift(updatedConvo);
                        }

                        return {
                            messages: {
                                ...state.messages,
                                [conversationId]: {
                                    ...state.messages[conversationId],
                                    items: updatedMessages
                                }
                            },
                            conversations: updatedConversations
                        };
                    });

                } catch (error) {
                    console.error("Failed to send group message:", error);
                    throw error;
                }
            },

            subscribeToMessages: () => {
                const { socket } = useAuthStore.getState();
                if (!socket) return;

                // Prevent duplicate listeners
                socket.off("newMessage");

                socket.on("newMessage", (newMessage) => {
                    set((state) => {
                        const convoId = newMessage.conversationId;
                        const isActive = state.activeConversationId === convoId;

                        // 1. Update Messages if loaded
                        let updatedMessagesMap = { ...state.messages };
                        // If we have messages for this convo loaded, append.
                        // If not, we don't strictly *need* to append, but if we open it, we'll fetch.
                        // BUT, if it's not loaded, the user won't see it until they click.
                        if (updatedMessagesMap[convoId]) {
                             updatedMessagesMap[convoId] = {
                                ...updatedMessagesMap[convoId],
                                items: [...updatedMessagesMap[convoId].items, { ...newMessage, isOwn: false }]
                            };
                        }

                        // 2. Update Conversations List
                        const conversationIndex = state.conversations.findIndex(c => c._id === convoId);
                        let updatedConversations = [...state.conversations];

                        if (conversationIndex !== -1) {
                            const updatedConvo = {
                                ...updatedConversations[conversationIndex],
                                lastMessage: {
                                    content: newMessage.content,
                                    createdAt: newMessage.createdAt,
                                    senderId: newMessage.senderId
                                },
                                updatedAt: new Date().toISOString(),
                                lastMessageAt: new Date().toISOString(),
                                // Assuming unreadCounts logic needs work on backend too, but for local state:
                                unreadCounts: isActive 
                                    ? updatedConversations[conversationIndex].unreadCounts // Keep as is if active (or reset elsewhere)
                                    : (updatedConversations[conversationIndex].unreadCounts instanceof Map 
                                        ? updatedConversations[conversationIndex].unreadCounts 
                                        : 0) + 1 // Simple increment for now, actually needs structured Map handling
                            };
                            updatedConversations.splice(conversationIndex, 1);
                            updatedConversations.unshift(updatedConvo);
                        } else {
                            // New conversation logic
                             setTimeout(() => get().fetchConversations(), 0);
                        }

                        return {
                            messages: updatedMessagesMap,
                            conversations: updatedConversations
                        };
                    });
                });
            },

            unsubscribeFromMessages: () => {
                const { socket } = useAuthStore.getState();
                if (socket) socket.off("newMessage");
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