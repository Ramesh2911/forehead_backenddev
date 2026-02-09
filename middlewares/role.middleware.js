export default (allowedRoleId) => {
  return (req, res, next) => {
    if (req.user.role_id !== allowedRoleId) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
