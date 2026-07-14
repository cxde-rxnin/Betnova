const nodemailer = require("nodemailer");

async function test() {
  try {
    console.log("Creating transporter...");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "okemsinachiobed01@gmail.com",
        pass: "ikcfbieccpgbxlve",
      },
    });

    console.log("Verifying connection...");
    await transporter.verify();
    console.log("Connection verified!");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: '"Betnovo" <noreply@lynk.app>',
      to: "okemsinachiobed01@gmail.com",
      subject: "Test",
      text: "Hello",
    });
    console.log("Email sent!", info.messageId);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
