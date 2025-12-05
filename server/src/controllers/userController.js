import User from "../models/User.js";

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