const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const auth = require("../middleware/auth");
const Photo = require("../models/Photo");
const cloudinary = require("../config/cloudinary");

// -------------------------------
// Ensure TEMP folder exists
// -------------------------------
if (!fs.existsSync("temp")) {
  fs.mkdirSync("temp");
}

// Store uploaded file temporarily
const upload = multer({ dest: "temp/" });

/* ========================================================
    UPLOAD MEDIA
    POST /upload/media
    auth required

    form-data:
      media   : file
      fieldId : optional (string)
      gps     : JSON string {lat,lng}
======================================================== */
router.post("/media", auth, upload.single("media"), async (req, res) => {
  try {
    // No file?
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    // Parse GPS JSON or default empty
    const gps = JSON.parse(req.body.gps || "{}");

    // Upload to Cloudinary from temp location
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto", // images + videos
      folder: "MyFields"
    });

    // Remove temp file
    fs.unlinkSync(req.file.path);

    const url = result.secure_url;
    const isVideo = result.resource_type === "video";

    // -------------------------------
    // If uploaded for a FIELD → Save to Photo DB
    // -------------------------------
    if (req.body.fieldId) {
      const doc = await Photo.create({
        fieldId: req.body.fieldId,
        url,
        gps,
        isVideo
      });

      return res.json(doc);
    }

    // -------------------------------
    // If uploaded for a RECORD → Send only media info
    // -------------------------------
    return res.json({ url, isVideo });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: err.message });
  }
});

/* ========================================================
    GET ALL MEDIA
    GET /upload/photos
======================================================== */
router.get("/photos", async (_req, res) => {
  try {
    const photos = await Photo.find().lean();
    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Fetch failed" });
  }
});

/* ========================================================
    DELETE PHOTO
    DELETE /upload/photos/:photoId
    auth required
======================================================== */
router.delete("/photos/:photoId", auth, async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.photoId);
    
    if (!photo) {
      return res.status(404).json({ msg: "Photo not found" });
    }

    // Optionally delete from Cloudinary using public_id extracted from URL
    // For now, we'll just delete from DB
    
    res.json({ msg: "Photo deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Delete failed" });
  }
});

module.exports = router;
