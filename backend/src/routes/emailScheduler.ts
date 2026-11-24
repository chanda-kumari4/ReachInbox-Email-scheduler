import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/schedule", (req, res) => {
  const { to, subject, body, scheduledAt } = req.body;

  if (!to || !subject || !body || !scheduledAt) {
    return res.status(400).json({
      success: false,
      message: "Please provide all email details",
    });
  }

  const delay = new Date(scheduledAt).getTime() - Date.now();

  if (isNaN(delay) || delay <= 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide a future scheduled time",
    });
  }

  setTimeout(async () => {
    console.log("Trying to send email...");

    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: body,
      });

      console.log("Email sent successfully!", info.messageId);
    } catch (error) {
      console.error("Email sending failed:", error);
    }
  }, delay);

  return res.status(200).json({
    success: true,
    message: "Email scheduled successfully!",
    scheduledAt,
  });
});

export default router;