import api from '../lib/axios.js'

export const chatService = {
    async fetchConversations() {
        const res = await api.get("/api/conversations");
        return res.data;
    }
}