import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        avatarURL: {
            type: String, // Link CDN (ví dụ Cloudinary)
            default: "",
        },
        avatarId: {
            type: String, // Cloudinary public_id (nếu muốn xóa ảnh)
            default: "",
        },
        bio: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        phone: {
            type: String,
            sparse: true,
            match: [/^0\d{9}$/, "Số điện thoại không hợp lệ"], //  số VN
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: "other",
        },
        birthday: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["online", "offline", "busy"],
            default: "offline",
        },
        lastActiveAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

const User = mongoose.model("User", userSchema);
export default User;
