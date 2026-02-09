import jwt from "jsonwebtoken";
import db from "../config/db.js";

export default async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [[session]] = await db.execute(
      "SELECT * FROM user_tokens WHERE access_token = ? AND is_revoked = 0",
      [token]
    );

    if (!session) {
      return res.status(401).json({ message: "Session expired" });
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
