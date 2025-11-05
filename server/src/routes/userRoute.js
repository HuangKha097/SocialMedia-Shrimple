import express from "express";
import {authMe, test} from "../controllers/userController.js";
import {protectedRoute} from "../middlewares/authMiddleware.js";


const router = express.Router();

router.get("/me", protectedRoute, authMe);

router.get("/test", protectedRoute, test);


export default router;