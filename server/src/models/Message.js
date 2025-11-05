import mongoose, * as ongoose from 'mongoose'

const messageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,

    },
    content: {type: String, trim: true},
    messageType: {
        type: String,
        required: true,
        enum: ['text', 'image', 'video', 'file', 'audio'],
        default: 'text'
    },
    replyTo: {
        type: ongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    edit: {type: Boolean, default: false},
    editAt: {type: Date, default: Date.now},

    imgUrl: {
        type: String,
    },
}, {
    timestamps: true
})
// sap xep theo conversationId theo thu tu tang dan, createAt theo thu tu giam dan
//  => tin nhan moi nhat se nam o tren cung
messageSchema.index({conversationId: 1, createdAt: -1})

const Message = mongoose.model('Message', messageSchema);
export default Message