import express from "express";
import {authMe, getUserByUsername, test, toggleSavePost, getSavedPosts, getUserById} from "../controllers/userController.js";
import {protectedRoute} from "../middlewares/authMiddleware.js";


const router = express.Router();

router.get("/me", protectedRoute, authMe);

router.get("/test", protectedRoute, test);

router.get("/get-user-by-username", protectedRoute, getUserByUsername);

router.post("/toggle-save", protectedRoute, toggleSavePost);
router.get("/saved-posts", protectedRoute, getSavedPosts);
router.get("/:id", protectedRoute, getUserById);


export default router;