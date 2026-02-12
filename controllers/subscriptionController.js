import db from "../config/db.js";

// All Subscriptions
export const listAllSubscriptions = async (req, res) => {
  try {
    const [plans] = await db.query(`
      SELECT 
        p.id,
        p.role_id,
        CASE 
          WHEN p.role_id = 3 THEN 'Retailer'
          WHEN p.role_id = 4 THEN 'Customer'
        END AS role_name,
        p.plan_name,
        p.plan_type,
        p.price,
        p.duration_days,
        p.status
      FROM subscription_plans p
      WHERE p.status = 'ACTIVE'
      ORDER BY p.role_id, p.price ASC
    `);

    if (plans.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No subscription plans found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: plans,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//Subcription Details
export const getSubscriptionDetails = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Plan id is required",
      });
    }

    // Get Plan
    const [planResult] = await db.query(
      `SELECT 
        p.id,
        p.role_id,
        CASE 
          WHEN p.role_id = 3 THEN 'Retailer'
          WHEN p.role_id = 4 THEN 'Customer'
        END AS role_name,
        p.plan_name,
        p.plan_type,
        p.price,
        p.duration_days,
        p.status
       FROM subscription_plans p
       WHERE p.id = ?`,
      [id]
    );

    if (planResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // Get Features
    const [features] = await db.query(
      `SELECT 
        f.id,
        f.title,
        f.description
       FROM plan_feature_mapping pf
       JOIN subscription_features f 
       ON pf.feature_id = f.id
       WHERE pf.plan_id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...planResult[0],
        features: features,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

