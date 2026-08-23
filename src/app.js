import express from "express";
import authRoutes from "./routes/auth.route.js";
import studentRoutes from "./routes/student.route.js";
import teacherRoutes from "./routes/teacher.route.js";
import hodRoutes from "./routes/hod.route.js";

const app = express();
app.use(express.json());

// campX health api
app.get("/api/health", (req, res) => {
  res.send({
    success: true,
    message: "campx api is running",
  });
});

// routes
app.use("/api/auth", authRoutes); //auth route
app.use("/api/student", studentRoutes); //student route
app.use("/api/teacher", teacherRoutes); //teacher route
app.use("/api/hod", hodRoutes); //hod route

export default app;
