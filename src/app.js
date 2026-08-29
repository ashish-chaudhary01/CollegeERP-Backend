import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
// import studentRoutes from "./routes/student.route.js";
// import teacherRoutes from "./routes/teacher.route.js";
import hodRoutes from "./routes/hod.route.js";
import adminRoutes from "./routes/admin.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

// cerp health api
app.get("/api/health", (req, res) => {
  res.send({
    success: true,
    message: "CERP(College ERP) api is running",
  });
});

// routes
app.use("/api/auth", authRoutes); //auth route
app.use("/api/admin", adminRoutes); //admin route
app.use("/api/hod", hodRoutes); //hod route
// app.use("/api/teacher", teacherRoutes); //teacher route
// app.use("/api/student", studentRoutes); //student route

export default app;
