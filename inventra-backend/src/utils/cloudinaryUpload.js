import cloudinary from "cloudinary";

// Configure Cloudinary (already setup in config/cloudinary.js, but we import here for direct use)
const uploadImageToCloudinary = async (file, folder = "general") => {
  try {
    // file comes from multer middleware
    // Need to convert to buffer if it's an Express file object
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: `inventra_pos/${folder}`,
          resource_type: "auto",
          max_file_size: 5242880, // 5MB
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );

      // If file is a buffer, write to stream
      if (Buffer.isBuffer(file.buffer)) {
        uploadStream.end(file.buffer);
      } else if (file.path) {
        // If file has path (from multer disk storage), use fs
        const fs = require("fs");
        fs.createReadStream(file.path)
          .pipe(uploadStream)
          .on("error", (err) => reject(err));
      } else {
        reject(new Error("Invalid file object"));
      }
    });
  } catch (err) {
    console.error("❌ Cloudinary upload error:", err);
    throw err;
  }
};

export { uploadImageToCloudinary };
