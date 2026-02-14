import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//  current financial year 
const getFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 4) {
    // April–Dec → current to next year
    return `${year.toString().slice(-2)}${(year + 1).toString().slice(-2)}`;
  } else {
    // Jan–Mar → previous to current year
    return `${(year - 1).toString().slice(-2)}${year.toString().slice(-2)}`;
  }
};

// Super Admin Registration
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

// Login
export const login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and password are required",
      });
    }

    const [[user]] = await db.execute(
      `
      SELECT 
        u.id,
        u.role_id,
        r.role_name,
        u.name,
        u.phone,
        u.email,
        u.password,
        u.default_password,
        up.permission_id
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN user_permissions up ON up.user_id = u.id
      WHERE u.phone = ?
      `,
      [phone]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ Handle permissions
    let permissionIds = [];
    let permissions = [];

    if (user.permission_id) {
      permissionIds =
        typeof user.permission_id === "string"
          ? JSON.parse(user.permission_id)
          : user.permission_id;

      if (Array.isArray(permissionIds) && permissionIds.length > 0) {
        const [permissionRows] = await db.query(
          `
          SELECT id, name, icon, iconColor
          FROM permissions
          WHERE id IN (?)
          `,
          [permissionIds]
        );

        permissions = permissionRows;
      }
    }

    // ✅ Dynamic device_type
    let deviceType = ""; // default empty

    if (user.role_id === 1) {
      deviceType = "Super Admin";
    } else if (user.role_id === 2) {
      deviceType = "Admin";
    }

    // ✅ Capture device info from login request
    const deviceInfo = req.headers["user-agent"] || "";

    // ✅ Proper IP address
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      req.ip ||
      "";

    // ✅ Generate Tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        role: user.role_name,
        permissions: permissionIds,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // ✅ Insert into user_tokens
    await db.execute(
      `
      INSERT INTO user_tokens
      (user_id, access_token, refresh_token, device_type, device_info, ip_address, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
      `,
      [
        user.id,
        accessToken,
        refreshToken,
        deviceType,
        deviceInfo,   // 👈 now storing actual device
        ipAddress,
      ]
    );

    return res.json({
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
        defaultPassword: user.default_password,
        permissions: permissions,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Super Admin Logout
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

// Retailer Registration
export const registerRetailer = async (req, res) => {
  try {
    const {
      name,
      phone,
      state_id,
      dist_id,
      city_id,
      shop_name,
      shop_type
    } = req.body;

    if (
      !name ||
      !phone ||
      !state_id ||
      !dist_id ||
      !city_id ||
      !shop_name ||
      !shop_type
    ) {
      return res.status(400).json({
        success: false,
        message: "All mandatory fields are required"
      });
    }

    const [existingUser] = await db.execute(
      `SELECT id FROM users WHERE phone = ?`,
      [phone]
    );

    if (existingUser.length > 0) {
      return res.status(404).json({
        success: false,
        message: "Phone number already registered"
      });
    }

    const [userResult] = await db.execute(
      `INSERT INTO users
       (role_id, name, phone, is_verified, status)
       VALUES (?, ?, ?, ?, ?)`,
      [3, name, phone, 0, "ACTIVE"]
    );

    const userId = userResult.insertId;

    const financialYear = getFinancialYear();

    const [lastRetailer] = await db.execute(
      `SELECT retailerId
       FROM retailers
       WHERE retailerId LIKE ?
       ORDER BY id DESC
       LIMIT 1`,
      [`FH-TM-${financialYear}%`]
    );

    let nextNumber = 1;

    if (lastRetailer.length > 0) {
      const lastId = lastRetailer[0].retailerId;
      nextNumber = parseInt(lastId.slice(-3), 10) + 1;
    }

    const retailerId = `TM-${financialYear}${String(nextNumber).padStart(3, "0")}`;

    await db.execute(
      `INSERT INTO retailers
       (user_id, retailerId, state_id, dist_id, city_id, shop_name, shop_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, retailerId, state_id, dist_id, city_id, shop_name, shop_type]
    );

    res.status(200).json({
      success: true,
      message: "Retailer registered successfully",
      data: {
        retailerId,
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Customer Registration
export const customerRegister = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      latitude,
      longitude,
      address,
      police_station,
      pin,
    } = req.body;

    if (
      !name ||
      !phone ||
      !latitude ||
      !longitude ||
      !address ||
      !pin
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE phone = ?",
      [phone]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    const [userResult] = await db.query(
      `INSERT INTO users
        (role_id, name, phone, email, password, is_verified, status, created_at, updated_at)
       VALUES
        (4, ?, ?, ?, NULL, 0, 'ACTIVE', NOW(), NOW())`,
      [name, phone, email || null]
    );

    const userId = userResult.insertId;

    await db.query(
      `INSERT INTO customers
        (user_id, latitude, longitude, address, police_station, pin, created_at)
       VALUES
        (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, latitude, longitude, address, police_station || null, pin]
    );

    return res.status(200).json({
      success: true,
      message: "Customer registered successfully",
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//Admin Registration
export const registerAdmin = async (req, res) => {
  try {
    const { name, phone, email, permissions } = req.body;

    if (
      !name ||
      !phone ||
      !email ||
      !permissions ||
      !Array.isArray(permissions) ||
      permissions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check phone exists
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE phone = ?",
      [phone]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    const defaultPassword = "FTM@2526";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await db.query("START TRANSACTION");

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users 
      (role_id, name, phone, email, password, is_verified, default_password, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        2,
        name,
        phone,
        email,
        hashedPassword,
        0,
        0,
        "ACTIVE",
      ]
    );

    const userId = result.insertId;

    // ✅ Store permissions as JSON array
    await db.query(
      `INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)`,
      [
        userId,
        JSON.stringify(permissions), // 🔥 important
      ]
    );

    await db.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        user_id: userId,
        phone,
        permissions,
        default_password: defaultPassword,
      },
    });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Admin Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log(req.body,'ll');
    
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be minimum 8 characters and include uppercase, lowercase, number and special character",
      });
    }
    
    const [rows] = await db.query(
      "SELECT id, password FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];
   
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password",
      });
    }
   
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.query(
      "UPDATE users SET password = ?, default_password = 1 WHERE id = ?",
      [hashedPassword, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


