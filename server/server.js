import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io"; // ✅ Correct import

const app = express();
const httpServer = http.createServer(app); // ✅ Renamed to avoid conflict

//initialize socket.io server
export const io = new Server(httpServer, { // ✅ Use Server class
    cors: { origin: "*" }
});

//store online users
// userId: Set of socketIds mapping
export const userSocketMap = {};

//socket.io connection handling
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId) {
        if (!userSocketMap[userId]) {
            userSocketMap[userId] = new Set();
        }
        userSocketMap[userId].add(socket.id);
    }

    //Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        if (userId && userSocketMap[userId]) {
            userSocketMap[userId].delete(socket.id);
            if (userSocketMap[userId].size === 0) {
                delete userSocketMap[userId];
            }
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

//middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

//Routes Setup
app.use("/api/status", (req, res) => res.send("Server is live!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

//connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
