import express from "express";
import authRoutes from "./routes/auth.route.js";
import studentRoutes from "./routes/student.route.js";

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
app.use("/api/student", studentRoutes); //students route

export default app;
