import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';


export const createConversation = async (req, res) => {
    try {
        const {isGroup, name, memberIds} = req.body;
        const userId = req.user._id;

        if (
            (isGroup && !name) ||
            !memberIds ||
            !Array.isArray(memberIds) ||
            memberIds.length === 0) {
            return res.status(400).json({message: "GroupName and membersList are required"});
        }

        let conversation;
        if (!isGroup) {
            const participantId = memberIds[0];

            conversation = await Conversation.findOne({
                isGroup: false,
                "participants.userId": {$all: [userId, participantId]},
            });

            if (!conversation) {
                conversation = new Conversation({
                    isGroup: false,
                    participants: [{userId}, {userId: participantId}],
                    lastMessageAt: new Date()
                })
                await conversation.save();
            }
        }
        if (isGroup) {
            conversation = new Conversation({
                isGroup: true,
                participants: [
                    {userId},
                    ...memberIds.map(id => ({userId: id})),
                ],
                group: {
                    name,
                    createdBy: userId,
                },
                lastMessageAt: new Date()
            });
            await conversation.save();
        }
        if (!conversation) {
            return res.status(400).json({message: "Conversation type is invalid"});
        }

        await conversation.populate([
            {path: "participants.userId", select: "displayName avatarUrl"},
            {
                path: 'seenBy', select: 'displayName avatarUrl'
            },
            {
                path: "lastMessage.senderId", select: "displayName avatarUrl"
            }
        ]);
        return res.status(201).json({conversation});
    } catch (error) {
        console.error("Error creating conversation", error);
        return res.status(500).json({message: "System error"});
    }
}

export const getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({
            'participants.userId': userId,
        })
            .sort({lastMessageAt: -1, updatedAt: -1})
            .populate({
                path: "participants.userId",
                select: "displayName avatarUrl"
        }).populate({
                path: "lastMessage.senderId",
                select: "displayName avatarUrl"
            }).populate({
                path: "seenBy",
                select: "displayName avatarUrl"
            })

        const formatted = conversations.map((convo) =>{
            const participants = (convo.participants || []).map((p)=>({
                _id:p.userId?._id,
                displayName:p.userId?.displayName,
                avatarUrl:p.userId?.avatarUrl ?? null,
                joinedAt: p.joinedAt,
            }));
            return {
                ...convo.toObject(),
                unreadCounts: convo.unreadCounts || {},
                participants,
            }
        });
        return res.status(200).json({conversations: formatted});
    }catch(err) {
        console.error("Error getting conversation", err);
        return res.status(500).json({message: "System error"});
    }
}


export const getMessage = async (req, res) => {
    try {
        const {conversationId} = req.params;
        const {limit = 50, cursor} = req.query;

        const query = {conversationId};

        if(cursor){
            query.createdAt = {$lt: new Date(cursor)};
        }

        let messages = await  Message.find(query)
            .sort({createdAt: -1 })
            .limit(Number(limit)+1);

        let nextCursor = null;
        if(messages.length > Number(limit)){
            const nextMessage = messages[messages.length - 1];
            nextCursor = nextMessage.createdAt.toISOString();
            messages.pop();
        }
        messages = messages.reverse();
        return res.status(200).json({messages, nextCursor});
    }catch (error) {
        console.error("Error getting message", error);
        return res.status(500).json({message: "System error"});
    }
}