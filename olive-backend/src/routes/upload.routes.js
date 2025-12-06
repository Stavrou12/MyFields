const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const Photo = require("../models/Photo");

const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ensure uploads folder exists once at start


// disk storage
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename:    (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* ----------  UPLOAD MEDIA  ----------
  POST /upload/media
  auth required
  form-data :
    media   : file (image/* or video/*)
    fieldId : string
    gps     : JSON string  {lat, lng}
--------------------------------------*/
router.post("/media", auth, upload.single("media"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const isVideo = req.file.mimetype.startsWith("video/");
    const gps = JSON.parse(req.body.gps || "{}");

    const doc = await Photo.create({
      fieldId: req.body.fieldId,
      url: `/uploads/${req.file.filename}`,
      gps,
      isVideo,
    });

    res.json(doc);
  }catch (err) {
  console.error("Upload error:", err);
  res.status(500).json({ msg: err.message }); // send JSON, not HTML
}
});

/* ----------  LIST ALL MEDIA  ----------
  GET /upload/photos
  no auth required (public read)
--------------------------------------*/
router.get("/photos", async (_req, res) => {
  try {
    const photos = await Photo.find().lean();
    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Fetch failed" });
  }
});



// upload for record media
router.post("/photos", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  const isVideo = req.file.mimetype.startsWith("video/");

  res.json({
  url: `${req.protocol}://${req.get("host")}/uploads/${filename}`,
  isVideo: false
});
});



module.exports = router;