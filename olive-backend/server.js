const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// 🔐 Security packages
const helmet = require("helmet");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");



dotenv.config();

// DB connection
const connectDB = require("./src/config/db");


const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

/* =======================
   SECURITY MIDDLEWARE
======================= */

// Add security headers
app.use(helmet());

// Prevent HTTP parameter pollution
app.use(hpp());

// Sanitize Mongo queries



// Hide Express info
app.disable("x-powered-by");

// CORS


// Parse JSON
app.use(express.json());


// Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Rate limiting (global)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // max requests per IP
    message: "Too many requests from this IP, try again later"
  })
);

/* =======================
   ROUTES
======================= */

app.use("/auth", require("./src/routes/auth.routes"));
app.use("/fields", require("./src/routes/fields.routes"));
app.use("/upload", require("./src/routes/upload.routes"));

/* =======================
   DB + SERVER START
======================= */

connectDB();

app.get("/", (req, res) => {
  res.send("Olive Backend API Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
