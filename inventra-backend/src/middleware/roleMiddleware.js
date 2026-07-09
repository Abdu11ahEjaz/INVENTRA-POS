/**
 * authorize(...roles)
 * Usage: router.get("/route", protect, authorize("SuperAdmin", "Admin"), handler)
 *
 * Role hierarchy:
 *   SuperAdmin  — full access including user management
 *   Admin       — inventory, suppliers, purchases, invoices, ledger, reports
 *   Manager     — inventory, suppliers, purchases, invoices, reports
 *   Accountant  — ledger, reports, invoices (read)
 *   Sales       — sales, invoices (create/read)
 */
export const authorize = (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(
          `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };

// Convenience shortcuts
export const superAdminOnly = authorize("SuperAdmin");
export const adminAndAbove  = authorize("SuperAdmin", "Admin");
export const managerAndAbove = authorize("SuperAdmin", "Admin", "Manager");
export const accountantAndAbove = authorize("SuperAdmin", "Admin", "Accountant");
export const allStaff = authorize("SuperAdmin", "Admin", "Manager", "Accountant", "Sales");
