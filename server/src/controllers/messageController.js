import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {upDateConversationAfterCreateMessage} from "../utils/messageHelper.js";


export const sendDirectMessage = async (req, res) => {
    try {
        const {recipientId, content, conversationId} = req.body;
        const senderId = req.user._id;

        let conversation;

        if (!content) {
            return res.status(400).json({message: "Content not found"});
        }

        // 1. Nếu Client có gửi conversationId -> Tìm theo ID
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        }

        // 2. [QUAN TRỌNG] Nếu chưa tìm thấy (hoặc Client không gửi ID),
        // HÃY TÌM xem 2 người này đã có cuộc trò chuyện nào chưa
        if (!conversation) {
            conversation = await Conversation.findOne({
                isGroup: false,
                "participants.userId": { $all: [senderId, recipientId] }
            });
        }

        // 3. Nếu vẫn không tìm thấy -> Lúc này mới Tạo Mới
        if (!conversation) {
            conversation = await Conversation.create({
                isGroup: false,
                participants: [
                    {userId: senderId, joinedAt: new Date()},
                    {userId: recipientId, joinedAt: new Date()}
                ],
                lastMessageAt: new Date(),
                unreadCounts: new Map(),
            });
        }

        const message = await Message.create({
            conversationId: conversation._id,
            senderId,
            content,
        });

        upDateConversationAfterCreateMessage(conversation, message, senderId);
        await conversation.save();

        return res.status(201).json({message});
    } catch (error) {
        console.error("Error in sendDirectMessage", error);
        return res.status(500).json({message: "System error"});
    }

}

export const sendGroupMessage = async (req, res) => {
    try {
        const {conversationId, content} = req.body;
        const senderId = req.user._id;

        let conversation = req.conversation;
        if(!conversation && conversationId) {
            conversation = await Conversation.findById(conversationId);
        }

        if (!content) {
            return res.status(400).json({message: "Content not found"});
        }
        const message = await Message.create({
            conversationId,
            senderId,
            content,
        })

        upDateConversationAfterCreateMessage(conversation, message, senderId);
        await conversation.save();
        return res.status(201).json({message});
    }catch (error) {
        console.error("Error in sendGroupMessage", error);
        return res.status(500).json({message: "System error"});
    }
}