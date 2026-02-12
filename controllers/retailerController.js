import db from "../config/db.js";

// All Retailers List
export const getRetailersList = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        r.id,
        r.retailerId,
        r.user_id,
        u.name,
        u.phone,
        u.is_verified,
        u.status
      FROM retailers r
      JOIN users u ON u.id = r.user_id
      ORDER BY r.id DESC
    `);

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Retailers found!",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Retailers fetched successfully",
      data: rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Retailers Details 
export const getRetailerDetails = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Retailer id is required"
      });
    }

    const [rows] = await db.execute(
      `
      SELECT
        r.id,
        r.retailerId,
        r.user_id,

        r.state_id,
        s.state_name,

        r.dist_id,
        d.district_name,

        r.city_id,
        c.city_name,

        r.shop_type AS shop_type_id,
        st.name AS shop_type_name,

        r.shop_name,
        r.address,
        r.latitude,
        r.longitude,
        r.shop_img,
        r.license_img,
        r.master_retailer_img,
        r.shop_video,
        r.created_at,

        u.name,
        u.phone,
        u.is_verified,
        u.status

      FROM retailers r
      JOIN users u ON u.id = r.user_id
      LEFT JOIN states s ON s.id = r.state_id
      LEFT JOIN districts d ON d.id = r.dist_id
      LEFT JOIN cities c ON c.id = r.city_id
      LEFT JOIN shop_types st ON st.id = r.shop_type
      WHERE r.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Retailer found!",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: "Retailer details fetched successfully",
      data: rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
