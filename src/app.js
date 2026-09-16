import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import studentRoutes from "./routes/student.route.js";
import teacherRoutes from "./routes/teacher.route.js";
import hodRoutes from "./routes/hod.route.js";
import adminRoutes from "./routes/admin.route.js";

dotenv.config();
const app = express();
const normalizeOrigin = (value) => value.trim().replace(/\/$/, "");
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (
        process.env.FRONTEND_URL || "http://localhost:5173"
      )
        .split(",")
        .map(normalizeOrigin)
        .filter(Boolean);
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin)))
        return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);

// cerp health api
app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store").send({
    success: true,
    message: "CERP(College ERP) api is running",
    timestamp: new Date().toISOString(),
  });
});

// routes
app.use("/api/auth", authRoutes); //auth route
app.use("/api/admin", adminRoutes); //admin route
app.use("/api/hod", hodRoutes); //hod route
app.use("/api/teacher", teacherRoutes); //teacher route
app.use("/api/student", studentRoutes); //student route

export default app;
