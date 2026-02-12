import db from "../config/db.js";

// All Module
export const getAllPermissions = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        id,
        name,
        icon,
        iconColor
      FROM permissions
      ORDER BY id ASC
    `);

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Module found!",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Module list fetched successfully",
      data: rows,
    });

  } catch (error) {
    console.error("Get Permissions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
