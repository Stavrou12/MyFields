const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./src/config/db");

const fieldRoutes = require("./src/routes/fields.routes");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/auth", require("./src/routes/auth.routes"));
app.use("/fields", require("./src/routes/fields.routes"));
app.use("/upload", require("./src/routes/upload.routes"));


// Database
connectDB();

app.get("/", (req, res) => {
  res.send("Olive Backend API Running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
