import db from "../config/db.js";

// Permission List
export const getUserPermissions = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        up.id,
        up.user_id,
        u.name AS user_name,
        up.permission_id,
        p.id AS permission_id_value,
        p.name AS permission_name
      FROM user_permissions up
      JOIN users u ON u.id = up.user_id
      JOIN permissions p 
        ON JSON_CONTAINS(up.permission_id, CAST(p.id AS JSON), '$')
      ORDER BY up.id DESC
    `);

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Admin data found!",
        data: [],
      });
    }

    // ✅ Group by user
    const groupedData = {};

    rows.forEach(row => {
      if (!groupedData[row.user_id]) {
        groupedData[row.user_id] = {
          id: row.id,
          user_id: row.user_id,
          user_name: row.user_name,
          permissions: []
        };
      }

      groupedData[row.user_id].permissions.push({
        id: row.permission_id_value,
        name: row.permission_name
      });
    });

    const finalData = Object.values(groupedData);

    return res.status(200).json({
      success: true,
      message: "Admin data fetched successfully",
      data: finalData,
    });

  } catch (error) {
    console.error("Get User Permissions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
