import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.RENDER === "true" ||
  process.env.FRONTEND_URL?.startsWith("https://");
const authCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// login controller function
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const token = req.cookies.token;

    if (token) {
      return res.status(200).json({
        message: "User already logged In",
      });
    }

    //   find the user by email and password
    const user = await userModel.findOne({
      email: email,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // is password correct
    const isPasswordValid = bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //   creating token and sending to the user
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
    );

    res
      .status(200)
      .cookie("token", newToken, authCookieOptions)
      .json({
        message: "User logged In successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
}

// logout controller function
async function logoutUser(req, res) {
  try {
    res
      .clearCookie("token", authCookieOptions)
      .status(200)
      .json({ message: "logged out successfully" });
  } catch (error) {
    console.log(error.message);
  }
}

// change password
async function changePassword(req, res) {
  try {
    const { userId } = req.params;
    if (!req.user || String(req.user.id) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "You can only change your own password" });
    }
    const { current, next, confirm } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(500).json({ message: "No user found" });
    }

    // is password correct
    const isPasswordValid = await bcrypt.compare(current, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    if (next !== confirm) {
      return res.status(500).json({ message: "Password do not match" });
    }

    const newPassword = await bcrypt.hash(next, 10);
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "password change failed" });
  }
}

// forget password
async function resetPassword(req, res) {
  try {
    const { email } = req.body;
    res.status(200).json({ message: "Working" });
  } catch (error) {}
}

export default { loginUser, logoutUser, changePassword, resetPassword };
