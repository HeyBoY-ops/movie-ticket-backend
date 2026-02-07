import prisma from "../config/db.js";

// 1. Restrict To (...roles)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
};

// 2. Check Org Status (Approved?)
export const checkOrgStatus = (req, res, next) => {
  if (req.user.role === "ORGANIZATION" && req.user.verificationStatus !== "APPROVED") {
    return res.status(403).json({
      message: "Your organization is not approved yet. Please wait for admin approval."
    });
  }
  next();
};

// 3. Set Org ID (Inject ownerId)
export const setOrgId = (req, res, next) => {
  if (req.user.role === "ORGANIZATION") {
    req.body.ownerId = req.user.id;
  }
  next();
};
