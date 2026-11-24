
import "dotenv/config";
import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

const emailJobs = new Map();
const emailTimers = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Email sending failed";
}

// Send Email
async function sendEmail(jobId) {
  const job = emailJobs.get(jobId);

  if (!job) {
    return false;
  }

  emailJobs.set(jobId, {
    ...job,
    status: "sending",
    error: null,
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: job.to,
      subject: job.subject,
      text: job.body,
    });

    emailJobs.set(jobId, {
      ...job,
      status: "sent",
      messageId: info.messageId,
      sentAt: new Date().toISOString(),
      error: null,
    });

    return true;
  } catch (error) {
    emailJobs.set(jobId, {
      ...job,
      status: "failed",
      error: getErrorMessage(error),
    });

    console.error("Email sending failed:", error);
    return false;
  } finally {
    emailTimers.delete(jobId);
  }
}

// Schedule Email
function scheduleEmail(jobId, scheduledAt) {
  const delay = new Date(scheduledAt).getTime() - Date.now();

  const timer = setTimeout(() => {
    sendEmail(jobId);
  }, delay);

  emailTimers.set(jobId, timer);
}

// 1. Single Email Scheduling
router.post("/schedule", (req, res) => {
  const { email, subject, body, scheduledAt } = req.body;

  if (!email || !subject || !body || !scheduledAt) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  const delay = new Date(scheduledAt).getTime() - Date.now();

  if (isNaN(delay) || delay <= 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide a future scheduled time",
    });
  }

  const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  emailJobs.set(jobId, {
    status: "scheduled",
    to: email,
    subject,
    body,
    scheduledAt,
  });

  scheduleEmail(jobId, scheduledAt);

  return res.status(200).json({
    success: true,
    message: "Email scheduled successfully!",
    jobId,
    scheduledAt,
  });
});

// 2. Multiple Email Scheduling
router.post("/schedule-multiple", (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide an emails array",
    });
  }

  for (const email of emails) {
    const { to, subject, body, scheduledAt } = email;

    if (!to || !subject || !body || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "All email fields are required",
      });
    }

    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid email addresses",
      });
    }

    const delay = new Date(scheduledAt).getTime() - Date.now();

    if (isNaN(delay) || delay <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide future scheduled times",
      });
    }
  }

  const jobs = [];

  emails.forEach((email) => {
    const { to, subject, body, scheduledAt } = email;

    const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    emailJobs.set(jobId, {
      status: "scheduled",
      to,
      subject,
      body,
      scheduledAt,
    });

    scheduleEmail(jobId, scheduledAt);

    jobs.push({ jobId, to, scheduledAt });
  });

  return res.status(200).json({
    success: true,
    message: "Multiple emails scheduled successfully!",
    jobs,
  });
});

// 3. Reschedule Email
router.patch("/reschedule/:jobId", (req, res) => {
  const { jobId } = req.params;
  const { scheduledAt } = req.body;

  const job = emailJobs.get(jobId);

  if (!job || job.status !== "scheduled") {
    return res.status(404).json({
      success: false,
      message: "Scheduled email not found",
    });
  }

  const delay = new Date(scheduledAt).getTime() - Date.now();

  if (!scheduledAt || isNaN(delay) || delay <= 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide a future scheduled time",
    });
  }

  const oldTimer = emailTimers.get(jobId);

  if (oldTimer) {
    clearTimeout(oldTimer);
  }

  emailJobs.set(jobId, {
    ...job,
    scheduledAt,
  });

  scheduleEmail(jobId, scheduledAt);

  return res.status(200).json({
    success: true,
    message: "Email rescheduled successfully!",
    jobId,
    scheduledAt,
  });
});

// 4. Cancel Email
router.delete("/cancel/:jobId", (req, res) => {
  const { jobId } = req.params;

  const timer = emailTimers.get(jobId);
  const job = emailJobs.get(jobId);

  if (!job || job.status !== "scheduled" || !timer) {
    return res.status(404).json({
      success: false,
      message: "Scheduled email not found or already sent",
    });
  }

  clearTimeout(timer);
  emailTimers.delete(jobId);

  emailJobs.set(jobId, {
    ...job,
    status: "cancelled",
  });

  return res.status(200).json({
    success: true,
    message: "Email cancelled successfully",
    jobId,
  });
});

// 5. Retry Failed Email
router.post("/retry/:jobId", async (req, res) => {
  const { jobId } = req.params;

  const job = emailJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Email job not found",
    });
  }

  if (job.status !== "failed") {
    return res.status(400).json({
      success: false,
      message: "Only failed emails can be retried",
    });
  }

  const success = await sendEmail(jobId);
  const updatedJob = emailJobs.get(jobId);

  if (!success) {
    return res.status(500).json({
      success: false,
      message: "Retry failed. Please try again later.",
      data: updatedJob,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Email sent successfully after retry!",
    data: updatedJob,
  });
});

// 6. All Emails Status
router.get("/status", (req, res) => {
  const jobs = Array.from(emailJobs.entries()).map(
    ([jobId, data]) => ({
      jobId,
      ...data,
    })
  );

  return res.status(200).json({
    success: true,
    total: jobs.length,
    jobs,
  });
});

// 7. Individual Email Status
router.get("/status/:jobId", (req, res) => {
  const { jobId } = req.params;

  const job = emailJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Email job not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: job,
  });
});

export default router;

