import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/**
 * protect — verifies JWT and attaches req.user
 * Use on any route that requires authentication.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized — no token provided");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized — token is invalid or expired");
  }

  const user = await User.findById(decoded.id).select("-password -resetPasswordToken -resetPasswordExpire");
  if (!user) {
    res.status(401);
    throw new Error("Not authorized — user no longer exists");
  }

  if (user.deletedAt) {
    res.status(401);
    throw new Error("Your account has been deleted");
  }

  if (user.status === "Inactive") {
    res.status(403);
    throw new Error("Your account is inactive. Contact your administrator.");
  }

  if (user.status === "Suspended") {
    res.status(403);
    throw new Error("Your account has been suspended. Contact your administrator.");
  }

  if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
    res.status(423);
    throw new Error("Your account is locked due to multiple failed login attempts. Please try again later.");
  }

  req.user = user;
  next();
});

