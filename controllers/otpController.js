import db from "../config/db.js";

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

export const sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone is required" });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.execute(`DELETE FROM otp_logs WHERE phone = ?`, [phone]);

        await db.execute(
            `INSERT INTO otp_logs (phone, otp, expires_at) VALUES (?, ?, ?)`,
            [phone, otp, expiresAt]
        );

        res.json({
            success: true,
            message: "OTP sent successfully",
            otp,
            expires_in: "10 minutes"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone is required" });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.execute(`DELETE FROM otp_logs WHERE phone = ?`, [phone]);

        await db.execute(
            `INSERT INTO otp_logs (phone, otp, expires_at) VALUES (?, ?, ?)`,
            [phone, otp, expiresAt]
        );

        console.log("Resent OTP:", otp);

        res.json({
            success: true,
            message: "OTP resent successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone and OTP are required"
            });
        }

        const [rows] = await db.execute(
            `SELECT * FROM otp_logs WHERE phone = ? AND otp = ?`,
            [phone, otp]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const otpData = rows[0];
       
        if (new Date() > new Date(otpData.expires_at)) {
            await db.execute(`DELETE FROM otp_logs WHERE phone = ?`, [phone]);

            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }
       
        await db.execute(
            `UPDATE otp_logs SET verified_at = NOW() WHERE id = ?`,
            [otpData.id]
        );
       
        await db.execute(`DELETE FROM otp_logs WHERE phone = ?`, [phone]);

        res.json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
