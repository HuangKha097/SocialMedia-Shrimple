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
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        }

        if (!conversation) {
            conversation = await Conversation.create({
                isGroup: false,
                participants: [
                    {userId: senderId, joinedAt: new Date()},
                    {userId: recipientId, joinedAt: new Date()}
                ],
                lastMessageAt: new Date(),
                unreadCounts: new Map(),
            })
        }
        const message = await Message.create({
            conversationId: conversation._id,
            senderId,
            content,
        })
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
        const conversation = req.conversation;

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