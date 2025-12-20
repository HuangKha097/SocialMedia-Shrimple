import express from "express";
import {
    createPost,
    getAllPosts,
    getUserPosts,
    getPostById,
    likePost,
    addComment,
    deletePost,
    getVideoFeed,
} from "../controllers/postController.js";

import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/videos", getVideoFeed);
router.get("/user/:userId", getUserPosts);
router.get("/single/:id", getPostById);
router.post("/create", upload.single("media"), createPost);
router.put("/like/:id", likePost);
router.put("/comment/:id", addComment);
router.delete("/:id", deletePost);

export default router;
