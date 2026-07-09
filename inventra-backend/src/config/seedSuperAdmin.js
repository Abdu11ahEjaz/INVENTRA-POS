import User from "../models/User.js";

const seedSuperAdmin = async () => {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const name  = process.env.SUPER_ADMIN_NAME;
  const pass  = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !name || !pass) {
    console.warn("⚠️ SuperAdmin env vars not set — skipping seed.");
    return;
  }

  const exists = await User.findOne({ email: email.toLowerCase() });

  if (exists) {
    console.log(`✅ SuperAdmin already exists: ${email}`);
    return;
  }

  await User.create({
    fullName: name,
    email:    email.toLowerCase(),
    password: pass,
    role:     "SuperAdmin",
    status:   "Active",
    phone:    "",
    department: "Administration",
    forcePasswordChange: false,
    failedLoginAttempts: 0,
  });

  console.log(`🔑 SuperAdmin created: ${email}`);
};

export default seedSuperAdmin;
