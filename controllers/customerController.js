import db from "../config/db.js";

// All Customer
export const getAllCustomers = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT 
                c.id AS customer_id,
                u.id AS user_id,
                u.name,
                u.phone,

                c.station_id,
                ps.station_name AS station_name

            FROM users u
            JOIN customers c ON u.id = c.user_id

            LEFT JOIN police_stations ps 
                ON ps.id = c.station_id

            WHERE u.role_id = 4
            ORDER BY c.id DESC
            `
        );

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No customers found",
                data: [],
            });
        }

        return res.status(200).json({
            success: true,
            data: rows,
        });

    } catch (error) {
        console.error("Get All Customers Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// Customer Details 
export const getCustomerDetails = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "id is required",
            });
        }

        const [rows] = await db.query(
            `
            SELECT 
                u.id AS user_id,
                u.name,
                u.phone,
                u.email,
                u.is_verified,
                u.status,

                c.id AS customer_id,
                c.latitude,
                c.longitude,
                c.address,
                c.station_id,
                ps.station_name AS station_name,
                c.pin,
                c.created_at

            FROM users u
            JOIN customers c ON u.id = c.user_id

            LEFT JOIN police_stations ps 
                ON ps.id = c.station_id

            WHERE u.id = ? 
            AND u.role_id = 4
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0],
        });

    } catch (error) {
        console.error("Get Customer Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

