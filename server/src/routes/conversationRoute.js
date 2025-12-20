import express from "express";
import { createConversation, getConversation, getMessage, getSharedMedia} from "../controllers/conversationController.js";
import {checkFriendship} from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/",checkFriendship,createConversation)
router.get("/", getConversation)
router.get("/:conversationId/messages", getMessage)
router.get("/:conversationId/media", getSharedMedia)

export default router;