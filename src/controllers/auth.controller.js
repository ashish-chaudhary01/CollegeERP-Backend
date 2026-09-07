import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// login controller function
async function loginUser(req, res) {
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
  const isPasswordValid = await bcrypt.compare(password, user.password);

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
    .cookie("token", newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    })
    .json({
      message: "User logged In successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
}

// logout controller function
async function logoutUser(req, res) {
  res
    .clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false })
    .status(200)
    .json({ message: "logged out successfully" });
}

// export async function changePassword(req,res){
//   const {email,password}
// }

export default { loginUser, logoutUser };
