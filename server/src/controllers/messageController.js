import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {upDateConversationAfterCreateMessage} from "../utils/messageHelper.js";
import { getReceiverSocketId, io } from "../socket/socket.js";


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

        // REALTIME SOCKET
        const receiverSocketId = getReceiverSocketId(recipientId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);
        }

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
            conversation = await Conversation.findById(conversationId).populate('participants.userId');
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

        // REALTIME GROUP SOCKET
        // Emit to all participants except sender
        if (conversation && conversation.participants) {
            conversation.participants.forEach(p => {
                 // Handling populated vs non-populated participants structure just in case, 
                 // though usually it is { userId: ... } or just ID if not populated.
                 // The schema says participants: [{ userId: ObjectId, ... }]
                const participantId = p.userId?._id?.toString() || p.userId?.toString();
                
                if (participantId && participantId !== senderId.toString()) {
                    const socketId = getReceiverSocketId(participantId);
                    if (socketId) {
                        io.to(socketId).emit("newMessage", message);
                    }
                }
            });
        }

        return res.status(201).json({message});
    }catch (error) {
        console.error("Error in sendGroupMessage", error);
        return res.status(500).json({message: "System error"});
    }
}