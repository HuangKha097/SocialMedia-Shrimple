import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken"
import crypto from "crypto"
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = '15m' // less than equal 15m, 30m cuz wanna test API
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14days

export const signUp = async (req, res) => {
    try {
        const {username, password, email, firstName, lastName, gender, birthday} = req.body;

        // Validate input
        if (!username || !password || !email || !firstName || !lastName || !gender || !birthday) {
            return res.status(400).json({
                success: false,
                message: "All input fields are required.",
            });
        }

        // Check duplicate username or email
        const duplicateUser = await User.findOne({$or: [{username}, {email}]});
        if (duplicateUser) {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists.",
            });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        await User.create({
            username,
            password: hashedPassword,
            email,
            displayName: `${firstName} ${lastName}`,
            gender,
            birthday,
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully.",
        });
    } catch (error) {
        console.error("Error during signUp:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export const signIn = async (req, res) => {
    try {
        // get input from request body ( (email || phone) && password)
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "The input is required"
            })

        }
        // check user in database
        const user = await User.findOne({email})

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email or phone is not exits"
            })
        }

        // compare password
        const passwordCorrect = await bcrypt.compare(password, user.password)
        if (!passwordCorrect) {
            return res.status(401).json({message: "Password is not correct"})
        }
        // create a accessToken by JWT
        const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TTL})

        // create a refreshToken by JWT
        const refreshToken = crypto.randomBytes(64).toString('hex');

        // create new session to save refreshToken
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL)
        })

        // send refreshToken to client from cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL,
        })
        // send accessToken to response
        return res.status(200).json({message: `User ${user.displayName} logged in successfully !`, accessToken})

    } catch (error) {
        console.error("Error during signIn:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
}

export const signOut = async (req, res) => {
    try {
        // get refreshToken from cookie
        const token = req.cookies?.refreshToken;

        if (token) {
            // remove refreshToken on Session
            await Session.deleteOne({refreshToken: token})
            // remove cookie
            res.clearCookie("refreshToken")
        }

        return res.status(204);
    } catch (error) {
        console.error("Error during signOut:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
}

export const refreshToken = async (req, res) => {
    try {
        // get refresh token in db
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({message: "Refresh token doesn't exist."})
        }

        // compare with refreshToken in db
        const session = await Session.findOne({refreshToken: token})
        if (!session) {
            return res.status(403).json({message: "Refresh token is missing or expired."})
        }

        // check if expire
        if (session.expiresAt < Date) {
            return res.status(403).json({message: "Refresh token is expired."})
        }

        // create new accessToken
        const accessToken = jwt.sign({
            userId: session.userId,
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TTL})

        return res.status(200).json({accessToken})
    } catch (error) {
        console.error("Error during call refreshToken:", error);
        return res.status(500).json({message: "Internal server error."});
    }
}