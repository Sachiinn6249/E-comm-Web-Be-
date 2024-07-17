import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryv2 } from "../config/cloudinary.js";

// Configure Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryv2,
  params: {
    folder: "grab-products",
    format: async (req, file) => {
      const extension = file.originalname.split(".").pop().toLowerCase();
      switch (extension) {
        case "jpg":
        case "jpeg":
          return "jpg";
        case "png":
          return "png";
        case "gif":
          return "gif";
        case "webp":
          return "webp";
        default:
          // Fallback to 'png' if the extension is not recognized
          return "png";
      }
    },
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Initialize Multer with the Cloudinary storage
const upload = multer({ storage: storage });
export default upload;
