export const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user info" });
    }

    const { role, isVerified } = req.user;

    // Check if role is allowed
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
    }

    // Special check for Organizations: must be verified
    if (role === "ORGANIZATION" && !isVerified) {
      return res.status(403).json({
        message: "Forbidden - Organization account not verified yet"
      });
    }

    next();
  };
};
