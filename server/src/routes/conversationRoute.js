import express from "express";
import { createConversation, getConversation, getMessage, getSharedMedia, markConversationAsRead} from "../controllers/conversationController.js";
import {checkFriendship} from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/",checkFriendship,createConversation)
router.get("/", getConversation)
router.get("/:conversationId/messages", getMessage)
router.get("/:conversationId/media", getSharedMedia)
router.patch("/:conversationId/read", markConversationAsRead)

export default router;