import nodemailer from "nodemailer";

/**
 * Creates a fresh Nodemailer transporter each time it's called.
 * This ensures env vars are read AFTER dotenv.config() has run,
 * not at module import time (which is too early).
 */
export function createTransporter() {
  const config = {
    host:   process.env.EMAIL_HOST || "smtp.gmail.com",
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout:   15000,
    socketTimeout:     15000,
  };

  console.log("[Email Config]", {
    host: config.host,
    port: config.port,
    secure: config.secure,
    userConfigured: !!config.auth.user,
  });

  return nodemailer.createTransport(config);
}
