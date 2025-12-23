import User from "../models/User.js";
import Friend from "../models/Friend.js";
import Post from "../models/Post.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const authMe = async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            user
        })
    } catch (error) {
        console.log("Error during call authMe", error)
        return res.status(500).json({message: "System error"})
    }
}
export const test = async (req, res) => {
    return res.sendStatus(204);
}
export const getUserByUsername = async (req, res) => {
    try {

        let {username} = req.query;

        if (!username) {
            return res.status(400).json({message: "Vui lòng nhập từ khóa"});
        }

        const cleanKeyword = username.trim().replace(/^[@#]+/, "");

        if (!cleanKeyword) {
            return res.status(400).json({message: "Từ khóa không hợp lệ"});
        }


        const users = await User.find({
            username: {
                $regex: cleanKeyword,
                $options: "i"
            }
        }).select("-password");

        return res.status(200).json(users);

    } catch (error) {
        console.log("Error search user:", error);
        return res.status(500).json({message: "Lỗi hệ thống"});
    }
}

export const toggleSavePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isSaved = user.savedPosts.includes(postId);

        if (isSaved) {
            user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
            await user.save();
            return res.status(200).json({ message: "Post unsaved", savedPosts: user.savedPosts });
        } else {
            user.savedPosts.push(postId);
            await user.save();
            return res.status(200).json({ message: "Post saved", savedPosts: user.savedPosts });
        }

    } catch (error) {
        console.error("Error in toggleSavePost:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getSavedPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate({
            path: 'savedPosts',
            populate: [
                { path: 'author', select: 'username displayName avatarURL' },
                { path: 'comments.postedBy', select: 'username displayName avatarURL' }
            ]
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // We return the reversed array to show newest saved first (optional, but good UX)
        // Or just return as is.
        const reversedSavedPosts = [...user.savedPosts].reverse();

        return res.status(200).json(reversedSavedPosts);

    } catch (error) {
        console.error("Error in getSavedPosts:", error);
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { displayName, bio, username, email } = req.body;
        
        const updateData = {};
        if (displayName) updateData.displayName = displayName;
        if (bio) updateData.bio = bio;
        if (username) updateData.username = username;
        // if (email) updateData.email = email; // Changing email usually requires verification

        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.path, "shrimple_avatars");
            
            if (uploadResult) {
                updateData.avatarURL = uploadResult.secure_url;
                updateData.avatarId = uploadResult.public_id;
            } else {
                 return res.status(500).json({ message: "Failed to upload avatar" });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateSettings = async (req, res) => {
    try {
        const userId = req.user._id;
        const { soundEnabled, desktopNotifications } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (soundEnabled !== undefined) user.settings.soundEnabled = soundEnabled;
        if (desktopNotifications !== undefined) user.settings.desktopNotifications = desktopNotifications;

        await user.save();
        return res.status(200).json(user.settings);
    } catch (error) {
        console.error("Error updating settings:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const blockUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { userId: targetId } = req.body;

        if (userId.toString() === targetId.toString()) {
            return res.status(400).json({ message: "Cannot block yourself" });
        }

        const user = await User.findById(userId);
        if (user.blockedUsers.includes(targetId)) {
            return res.status(400).json({ message: "User already blocked" });
        }

        user.blockedUsers.push(targetId);
        await user.save();
        
        // --- AUTO UNFRIEND ON BLOCK ---
        // Find and delete friendship regardless of who is userA/userB
        await Friend.findOneAndDelete({
            $or:[
                {userA: userId, userB: targetId},
                {userA: targetId, userB: userId}
            ]
        });
        // ------------------------------
        
        // Return full list or just success? Full list is nice for updates.
        // We can just return success for now or the list id.
        return res.status(200).json({ message: "User blocked successfully", blockedUsers: user.blockedUsers });
    } catch (error) {
        console.error("Error blocking user:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { userId: targetId } = req.body;

        const user = await User.findById(userId);
        user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetId.toString());
        await user.save();

        return res.status(200).json({ message: "User unblocked successfully", blockedUsers: user.blockedUsers });
    } catch (error) {
        console.error("Error unblocking user:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getBlockedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate("blockedUsers", "username displayName avatarURL");
        
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json(user.blockedUsers);
    } catch (error) {
        console.error("Error fetching blocked users:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateAntiPeepSettings = async (req, res) => {
    try {
        const userId = req.user._id;
        const { isEnabled, pin, faceDescriptor } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.antiPeepData === undefined) {
             user.antiPeepData = { isEnabled: false, pin: "", faceDescriptor: [] };
        }

        if (isEnabled !== undefined) user.antiPeepData.isEnabled = isEnabled;
        if (pin !== undefined) user.antiPeepData.pin = pin;
        if (faceDescriptor !== undefined) {
            // faceDescriptor comes as array/object values, ensure it's stored as array
            user.antiPeepData.faceDescriptor = Object.values(faceDescriptor);
        }

        await user.save();
        return res.status(200).json(user.antiPeepData);
    } catch (error) {
        console.error("Error updateAntiPeepSettings:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
