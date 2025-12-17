import api from '../lib/axios.js'


export const chatService = {
    async fetchConversations() {
        const res = await api.get("/api/conversations");
        return res.data;
    },
    async fetchMessage(id, cursor) {

        const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
        const res = await api.get(`/api/conversations/${id}/messages?limit=50${cursorParam}`);
        return {messages: res.data.messages, cursor: res.data.nextCursor};
    },
    async sendDirectMessage(recipientId, content, conversationId) {

        const res = await api.post(`/api/messages/direct`, {
            recipientId,
            content,
            conversationId
        });
        return res.data;
    } ,
    async sendGroupMessage(conversationId, content) {

        const res = await api.post(`/api/messages/group`, {
            conversationId, content
        });
        return res.data;
    } ,
    async createConversation(isGroup, name, memberIds) {
        const res = await api.post(`/api/conversations/`, {
            isGroup, name, memberIds
        })
        return res.data;
    }
}