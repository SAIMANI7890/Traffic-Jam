import jwt from "jsonwebtoken";

import User from "../models/User.js";
import logger from "../utils/logger.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      logger.log("[AUTH] No authorization header or invalid format");
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = header.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error("[AUTH] JWT_SECRET not configured");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    const decoded = jwt.verify(token, secret);
    logger.log("[AUTH] Token decoded:", { id: decoded.id, role: decoded.role });
    
    const user = await User.findById(decoded.id).select("username email role organizationId");
    if (!user) {
      logger.log("[AUTH] User not found in database:", decoded.id);
      return res.status(401).json({ message: "Not authorized" });
    }

    logger.log("[AUTH] User found:", { id: user._id, role: user.role, username: user.username });

    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId ? user.organizationId.toString() : null,
    };

    logger.log("[AUTH] req.user set:", req.user);
    return next();
  } catch (err) {
    logger.log("[AUTH] Error:", err.message);
    return res.status(401).json({ message: "Not authorized" });
  }
};
