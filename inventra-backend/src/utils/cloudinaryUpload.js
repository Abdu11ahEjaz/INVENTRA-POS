import cloudinary from "cloudinary";

/**
 * Upload image to Cloudinary and return URL + public_id for tracking
 * @param {Object} file - multer file object (has buffer or path)
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<{url: string, public_id: string}>}
 */
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
          else resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
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

/**
 * Delete image from Cloudinary by public_id
 * @param {string} public_id - Cloudinary public_id
 */
const deleteImageFromCloudinary = async (public_id) => {
  if (!public_id) return;
  try {
    await cloudinary.v2.uploader.destroy(public_id);
  } catch (err) {
    console.error("❌ Cloudinary delete error:", err);
    // Don't throw - continue even if delete fails
  }
};

export { uploadImageToCloudinary, deleteImageFromCloudinary };
