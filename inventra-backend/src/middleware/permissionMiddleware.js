/**
 * Role-based permission definitions
 */
const PERMISSIONS = {
  SuperAdmin: [
    // Full access to everything
    "inventory.view",
    "inventory.create",
    "inventory.edit",
    "inventory.delete",
    "suppliers.view",
    "suppliers.create",
    "suppliers.edit",
    "suppliers.delete",
    "purchases.view",
    "purchases.create",
    "purchases.edit",
    "purchases.delete",
    "invoices.view",
    "invoices.create",
    "invoices.edit",
    "invoices.delete",
    "ledger.view",
    "ledger.create",
    "ledger.edit",
    "ledger.delete",
    "reports.view",
    "reports.export",
    "settings.view",
    "settings.edit",
    "staff.view",
    "staff.create",
    "staff.edit",
    "staff.delete",
  ],

  Admin: [
    // All business operations except staff management
    "inventory.view",
    "inventory.create",
    "inventory.edit",
    "inventory.delete",
    "suppliers.view",
    "suppliers.create",
    "suppliers.edit",
    "suppliers.delete",
    "purchases.view",
    "purchases.create",
    "purchases.edit",
    "purchases.delete",
    "invoices.view",
    "invoices.create",
    "invoices.edit",
    "invoices.delete",
    "ledger.view",
    "ledger.create",
    "ledger.edit",
    "ledger.delete",
    "reports.view",
    "reports.export",
    "settings.view",
  ],

  Manager: [
    // Core business operations (no deletions)
    "inventory.view",
    "inventory.create",
    "inventory.edit",
    "suppliers.view",
    "suppliers.create",
    "suppliers.edit",
    "purchases.view",
    "purchases.create",
    "purchases.edit",
    "invoices.view",
    "invoices.create",
    "invoices.edit",
    "reports.view",
    "reports.export",
  ],

  Accountant: [
    // Financial operations only
    "ledger.view",
    "ledger.create",
    "ledger.edit",
    "invoices.view",
    "reports.view",
    "reports.export",
  ],

  Sales: [
    // Sales operations only
    "invoices.view",
    "invoices.create",
    "invoices.edit",
    "reports.view",
  ],
};

/**
 * Middleware to check user has required permission
 * Usage: authorize("inventory.create", "inventory.edit")
 */
export const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Unauthorized"));
    }

    if (req.user.status !== "Active") {
      res.status(403);
      return next(new Error("Your account is not active"));
    }

    const userPermissions = PERMISSIONS[req.user.role] || [];

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403);
      return next(new Error("You don't have permission to access this resource"));
    }

    next();
  };
};

/**
 * Middleware to require SuperAdmin role
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error("Unauthorized"));
  }

  if (req.user.role !== "SuperAdmin") {
    res.status(403);
    return next(new Error("Only SuperAdmin can perform this action"));
  }

  if (req.user.status !== "Active") {
    res.status(403);
    return next(new Error("Your account is not active"));
  }

  next();
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role) => {
  return PERMISSIONS[role] || [];
};

/**
 * Check if role has specific permission
 */
export const hasPermission = (role, permission) => {
  const permissions = PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

export default PERMISSIONS;
