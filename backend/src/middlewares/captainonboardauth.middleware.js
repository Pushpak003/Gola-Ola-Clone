/**
 * Lightweight middleware to verify that captain went through OTP verification
 * before reaching /captain/complete-profile.
 *
 * Flow:
 *   1. verifyCaptainOTP returns { onboardingRequired: true, onboardToken }
 *   2. Frontend sends onboardToken in Authorization header when POSTing complete-profile
 *   3. This middleware validates the short-lived onboard token
 */
import jwt from "jsonwebtoken";

export const captainOnboardAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "captain-onboard") {
      return res.status(401).json({ success: false, message: "Invalid onboard token" });
    }
    req.onboardPhone = decoded.phone;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};