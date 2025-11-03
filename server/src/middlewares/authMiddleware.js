import jwt from "jsonwebtoken";
import User from "../models/User.js";

// authorization - who are u
export const protectedRoute = async (req, res, next) => {
    try {
        // get token from header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

        if (!token) {
            return res.status(401).json({message: "Can not find access token"})
        }
        // authenticate token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                console.error(err)
                return res.status(403).json({message: 'Access token was expire or not correct'})
            }

            // find user
            const user = await User.findById(decodedUser.userId).select('-password')

            if (!user) {
                return res.status(404).json({message: "User does not exist"})
            }
            // return user
            req.user = user;
            next();
        })
    } catch (error) {
        console.log("Error during authenticate JWT in authMiddleware", error)
        return res.status(500).json({message: "System error"})
    }
}