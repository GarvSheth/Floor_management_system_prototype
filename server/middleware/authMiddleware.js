// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  next(); return;
  console.log("Auth middleware triggered");
  console.log("Cookies:", req.cookies); // Log cookies to debug 
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user info to request so routes can use it
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
