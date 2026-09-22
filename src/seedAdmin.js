import userModel from "./models/user.model.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import dns from "dns";
import mongoose from "mongoose";

// setting dns for mongo db
dns.setServers(["0.0.0.0", "8.8.8.8"]);
dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin12@gmail.com";
    const password = "admin";
    const name = "";

    // checking if admin already exist
    const existingAdmin = await userModel.findOne({ email: email });

    if (existingAdmin) {
      console.log("Admin already exist");
      process.exit();
    }

    // creating hased password
    const hasedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      name,
      email,
      password: hasedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (error) {
    console.log("Error in create admin", error.message);
    process.exit(1);
  }
}

createAdmin();
