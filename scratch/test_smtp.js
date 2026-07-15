const nodemailer = require("nodemailer");

// Load env vars
require("dotenv").config();

console.log("Testing SMTP connection with:");
console.log("  Host:", process.env.SMTP_HOST);
console.log("  Port:", process.env.SMTP_PORT);
console.log("  Secure:", process.env.SMTP_SECURE);
console.log("  User:", process.env.SMTP_USER);
console.log("  Pass:", process.env.SMTP_PASS ? "****" + process.env.SMTP_PASS.slice(-3) : "(empty!)");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify()
  .then(() => {
    console.log("\n✅ SMTP connection successful! Credentials are valid.");
  })
  .catch((err) => {
    console.log("\n❌ SMTP connection FAILED:", err.message);
  });
