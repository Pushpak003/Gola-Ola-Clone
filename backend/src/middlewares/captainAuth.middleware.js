import jwt from "jsonwebtoken";

import prisma from "../config/db.js";

export const captainAuth = async (req,res,next) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const captain =
      await prisma.captain.findUnique({
        where: {
          id: decoded.id,
        },
      });

    if (!captain) {
      return res.status(401).json({
        success: false,
        message: "Captain not found",
      });
    }

    req.captain = captain;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });

  }
};