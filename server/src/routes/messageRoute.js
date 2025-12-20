import express from "express";
import {sendDirectMessage, sendGroupMessage, reactToMessage} from "../controllers/messageController.js";
import {checkFriendship, checkGroupMembership} from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/direct", checkFriendship, sendDirectMessage)
router.post("/group", checkGroupMembership,sendGroupMessage)
router.post("/reaction", reactToMessage)

export default router;