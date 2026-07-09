import multer from "multer";

// Store file in memory — buffer is passed to Cloudinary directly
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP and GIF images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Single image field named "image" (for products/inventory)
export const uploadSingle = upload.single("image");

// Single image field named "profileImage" (for user profiles)
export const uploadProfileImage = upload.single("profileImage");
