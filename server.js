import app from "./src/app.js";
import dotenv from "dotenv";
import { connectDB } from "./src/lib/db.js";
import dns from "dns";

// setting dns for mongo db
dns.setServers(["0.0.0.0", "8.8.8.8"]);
dotenv.config();

// server port
const port = process.env.PORT || 8000;

// server listen
app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
