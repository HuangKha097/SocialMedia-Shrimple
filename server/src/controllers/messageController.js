import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {upDateConversationAfterCreateMessage} from "../utils/messageHelper.js";
import { getReceiverSocketId, io } from "../socket/socket.js";


export const sendDirectMessage = async (req, res) => {
    try {
        const {recipientId, content, conversationId, image, file, type} = req.body;
        const senderId = req.user._id;

        let conversation;

        if (!content && !image && !file) {
            return res.status(400).json({message: "Content or file not found"});
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

        const messageData = {
            conversationId: conversation._id,
            senderId,
            content: content || "",
            messageType: type || 'text',
        };

        if (image) messageData.imgUrl = image;
        if (file) messageData.fileUrl = file;
        if ((image || file) && (!type || type === 'text')) {
             messageData.messageType = image ? 'image' : 'file';
        }

        const message = await Message.create(messageData);

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
        const {conversationId, content, image, file, type} = req.body;
        const senderId = req.user._id;

        let conversation = req.conversation;
        if(!conversation && conversationId) {
            conversation = await Conversation.findById(conversationId).populate('participants.userId');
        }

        if (!content && !image && !file) {
            return res.status(400).json({message: "Content or file not found"});
        }
        
        const messageData = {
            conversationId,
            senderId,
            content: content || "",
            messageType: type || 'text',
        };
        
        if (image) messageData.imgUrl = image;
        if (file) messageData.fileUrl = file;
        if ((image || file) && (!type || type === 'text')) {
             messageData.messageType = image ? 'image' : 'file';
        }

        const message = await Message.create(messageData)

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

export const reactToMessage = async (req, res) => {
    try {
        const { messageId, reaction } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        const existingReactionIndex = message.reactions.findIndex(r => r.userId.toString() === userId.toString());

        if (existingReactionIndex !== -1) {
            // User already reacted
            if (message.reactions[existingReactionIndex].reaction === reaction) {
                // Same reaction -> remove it
                message.reactions.splice(existingReactionIndex, 1);
            } else {
                // Different reaction -> update it
                message.reactions[existingReactionIndex].reaction = reaction;
            }
        } else {
            // New reaction
            message.reactions.push({ userId, reaction });
        }

        await message.save();

        const populatedMessage = await Message.findById(messageId).populate('reactions.userId', 'username displayName avatarURL');

        // Get conversation to find participants for socket
        const conversation = await Conversation.findById(message.conversationId).populate('participants.userId');
        
        if (conversation && conversation.participants) {
             conversation.participants.forEach(p => {
                const participantId = p.userId?._id?.toString() || p.userId?.toString();

                const socketId = getReceiverSocketId(participantId);
                if (socketId) {
                    io.to(socketId).emit("messageReaction", { messageId, reactions: populatedMessage.reactions, conversationId: message.conversationId });
                }
            });
        }

        return res.status(200).json({ message: "Reaction updated", reactions: populatedMessage.reactions });

    } catch (error) {
        console.error("Error in reactToMessage", error);
        return res.status(500).json({ message: "System error" });
    }
}