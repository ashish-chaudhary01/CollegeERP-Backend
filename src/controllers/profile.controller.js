import { getImageKit } from "../lib/imagekit.js";
import ImageKit from "@imagekit/nodejs";
import studentProfileModel from "../models/studentProfile.model.js";
import teacherProfileModel from "../models/teacherProfile.model.js";

const profileModels = {
  student: studentProfileModel,
  teacher: teacherProfileModel,
  hod: teacherProfileModel,
};

async function uploadProfilePhoto(req, res) {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Please select an image" });
    const imagekit = getImageKit();
    if (!imagekit)
      return res
        .status(503)
        .json({ message: "Image upload is not configured" });
    const role = req.user.role;
    const profileModel = profileModels[role];
    if (!profileModel)
      return res
        .status(403)
        .json({ message: "Profile photo is not available for this role" });

    const upload = await imagekit.files.upload({
      file: await ImageKit.toFile(req.file.buffer, req.file.originalname),
      fileName: `${role}-${req.user.id}-${Date.now()}-${req.file.originalname}`,
      folder: "/cerp/profile-photos",
      useUniqueFileName: true,
    });
    const profile = await profileModel.findOneAndUpdate(
      { userId: req.user.id },
      { profilePictureUrl: upload.url, profilePictureFileId: upload.fileId },
      { new: true },
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json({
      message: "Profile photo uploaded",
      profilePictureUrl: upload.url,
      profilePictureFileId: upload.fileId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Profile photo upload failed" });
  }
}

async function deleteProfilePhoto(req, res) {
  try {
    const profileModel = profileModels[req.user.role];
    if (!profileModel)
      return res
        .status(403)
        .json({ message: "Profile photo is not available for this role" });
    const profile = await profileModel.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    const imagekit = getImageKit();
    if (profile.profilePictureFileId) {
      if (!imagekit)
        return res
          .status(503)
          .json({ message: "Image upload is not configured" });
      await imagekit.files.delete(profile.profilePictureFileId);
    }
    profile.profilePictureUrl = "";
    profile.profilePictureFileId = "";
    await profile.save();
    res.json({ message: "Profile photo removed" });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Profile photo removal failed" });
  }
}

export default { uploadProfilePhoto, deleteProfilePhoto };
