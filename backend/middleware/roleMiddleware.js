import logger from "../utils/logger.js";

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  logger.log("[ADMIN_ONLY] Checking admin access:", {
    hasUser: !!req.user,
    role: req.user?.role,
    userId: req.user?.id
  });

  if (!req.user) {
    logger.log("[ADMIN_ONLY] No user in request");
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "admin") {
    logger.log("[ADMIN_ONLY] Access denied. User role:", req.user.role);
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  logger.log("[ADMIN_ONLY] Access granted");
  return next();
};
