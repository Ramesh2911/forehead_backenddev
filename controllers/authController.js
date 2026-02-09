import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ===============================
   SUPER ADMIN REGISTER (ONE TIME)
================================ */
export const registerSuperAdmin = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email & password required" });
  }

  try {
    const [exists] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (exists.length > 0) {
      return res.status(400).json({ success: false, message: "Super Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO users 
       (name, email, phone, password, role_id, is_verified)
       VALUES (?,?,?,?,1,1)`,
      [name, email, phone, hashedPassword]
    );

    res.json({
      success: true,
      message: "Super Admin registered",
      super_admin_id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   SUPER ADMIN LOGIN
================================ */
export const loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [[user]] = await db.execute(
      `
      SELECT 
        u.id,
        u.role_id,
        r.role_name,
        u.name,
        u.phone,
        u.email,
        u.password
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.email = ? AND u.role_id = 1
      `,
      [email]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        role: user.role_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    await db.execute(
      `
      INSERT INTO user_tokens
      (user_id, access_token, refresh_token, device_type, ip_address, expires_at)
      VALUES (?,?,?,?,?, DATE_ADD(NOW(), INTERVAL 7 DAY))
      `,
      [user.id, accessToken, refreshToken, "admin", req.ip]
    );

    // 🔥 FINAL RESPONSE
    res.json({
      success: true,
      message: "Login successful",
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        role_id: user.role_id,
        role_name: user.role_name,
        name: user.name,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* ===============================
   SUPER ADMIN LOGOUT
================================ */
export const logoutSuperAdmin = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ success: false, message: "Token required" });
  }

  try {
    await db.execute(
      "UPDATE user_tokens SET is_revoked = 1 WHERE access_token = ?",
      [token]
    );

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
