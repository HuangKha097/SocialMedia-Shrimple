import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./src/libs/db.js";
import authRoute from "./src/routes/authRoute.js";
import cookieParser from "cookie-parser";
import userRoute from "./src/routes/userRoute.js";
import { protectedRoute } from "./src/middlewares/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// middlewares
app.use(express.json());
app.use(cookieParser());

// public routes
app.use("/api/auth", authRoute);

// private routes
app.use("/api/users", protectedRoute, userRoute);

connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(` Server is running at port: ${PORT}`);
    });
});
