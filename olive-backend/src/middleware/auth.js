const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) return res.status(401).json({ msg: "No token provided" });

  // Remove "Bearer " prefix
  if (token.startsWith("Bearer ")) {
    token = token.replace("Bearer ", "");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

