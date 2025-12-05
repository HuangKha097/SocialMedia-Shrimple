import express from "express";
import {authMe, getUserByUsername, test} from "../controllers/userController.js";
import {protectedRoute} from "../middlewares/authMiddleware.js";


const router = express.Router();

router.get("/me", protectedRoute, authMe);

router.get("/test", protectedRoute, test);

router.get("/get-user-by-username", protectedRoute, getUserByUsername);


export default router;