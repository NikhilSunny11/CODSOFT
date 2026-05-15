const nodemailer = require('nodemailer');

/**
 * Create a reusable SMTP transporter.
 * Falls back gracefully if SMTP credentials are missing.
 */
const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      '⚠️  Email not configured — SMTP_HOST, SMTP_USER, or SMTP_PASS missing in .env'
    );
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10) || 587,
    secure: parseInt(SMTP_PORT, 10) === 465, // true for port 465, false for 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

/**
 * Send an email. Silently logs a warning and returns false if email is not configured.
 *
 * @param {Object} options
 * @param {string} options.to      - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html    - HTML body
 * @param {string} [options.text]  - Plain-text fallback (auto-generated from html if omitted)
 * @returns {Promise<boolean>}     - true if sent, false otherwise
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;

    const info = await transporter.sendMail({
      from: `"JobBoard" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // strip HTML tags for plain-text fallback
    });

    console.log(`📧 Email sent to ${to} — Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return false;
  }
};

// ─── Email Template Helpers ─────────────────────────────────────────────────

/**
 * Notify the employer when a candidate applies for their job.
 */
const sendNewApplicationEmail = async ({ employerEmail, employerName, candidateName, jobTitle }) => {
  return sendEmail({
    to: employerEmail,
    subject: `📋 New Application: ${candidateName} applied for "${jobTitle}"`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Application Received 🎉</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #334155;">Hi <strong>${employerName}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">
            <strong>${candidateName}</strong> has just applied for your job listing:
          </p>
          <div style="background: #ffffff; border-left: 4px solid #6366f1; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0; font-size: 20px; color: #1e293b;">${jobTitle}</h2>
          </div>
          <p style="font-size: 16px; color: #334155;">
            Log in to your <strong>Employer Dashboard</strong> to review the application and download the resume.
          </p>
          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.CLIENT_URL || 'https://codsoft-rho-nine.vercel.app'}employer/dashboard"
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
              View Application →
            </a>
          </div>
        </div>
        <div style="background: #e2e8f0; padding: 16px; text-align: center; font-size: 13px; color: #64748b;">
          You received this email because you have an active job listing on JobBoard.
        </div>
      </div>
    `,
  });
};

/**
 * Notify the candidate when their application status changes.
 */
const sendStatusUpdateEmail = async ({ candidateEmail, candidateName, jobTitle, company, newStatus }) => {
  const statusConfig = {
    reviewed: {
      emoji: '👀',
      color: '#f59e0b',
      heading: 'Application Under Review',
      message: `Your application for <strong>"${jobTitle}"</strong> at <strong>${company}</strong> is now being reviewed by the hiring team.`,
      cta: 'Keep an eye on your dashboard for further updates!',
    },
    accepted: {
      emoji: '🎉',
      color: '#10b981',
      heading: 'Congratulations! Application Accepted',
      message: `Great news! Your application for <strong>"${jobTitle}"</strong> at <strong>${company}</strong> has been <strong style="color: #10b981;">accepted</strong>.`,
      cta: 'The employer may reach out to you soon. Check your email for next steps!',
    },
    rejected: {
      emoji: '😔',
      color: '#ef4444',
      heading: 'Application Update',
      message: `We're sorry to inform you that your application for <strong>"${jobTitle}"</strong> at <strong>${company}</strong> was not selected to move forward at this time.`,
      cta: "Don't give up! There are many more opportunities waiting for you on JobBoard.",
    },
  };

  const config = statusConfig[newStatus];
  if (!config) return false; // Don't email for 'pending' status

  return sendEmail({
    to: candidateEmail,
    subject: `${config.emoji} ${config.heading} — "${jobTitle}"`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, ${config.color}, ${config.color}cc); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${config.heading} ${config.emoji}</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #334155;">Hi <strong>${candidateName}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">${config.message}</p>
          <div style="background: #ffffff; border-left: 4px solid ${config.color}; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 15px; color: #475569;">
              <strong>Position:</strong> ${jobTitle}<br/>
              <strong>Company:</strong> ${company}<br/>
              <strong>Status:</strong> <span style="color: ${config.color}; font-weight: 700; text-transform: uppercase;">${newStatus}</span>
            </p>
          </div>
          <p style="font-size: 16px; color: #334155;">${config.cta}</p>
          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.CLIENT_URL || 'https://codsoft-rho-nine.vercel.app'}/candidate/dashboard"
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
              View My Applications →
            </a>
          </div>
        </div>
        <div style="background: #e2e8f0; padding: 16px; text-align: center; font-size: 13px; color: #64748b;">
          You received this email because you applied for a job on JobBoard.
        </div>
      </div>
    `,
  });
};

/**
 * Send a welcome email after registration.
 */
const sendWelcomeEmail = async ({ email, name, role }) => {
  const roleMessage =
    role === 'employer'
      ? 'Start posting jobs and find the best talent for your team.'
      : 'Browse thousands of job listings and find your dream role.';

  return sendEmail({
    to: email,
    subject: `🎉 Welcome to JobBoard, ${name}!`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to JobBoard! 🚀</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #334155;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">
            Your account has been created successfully as a <strong style="text-transform: capitalize;">${role}</strong>.
          </p>
          <p style="font-size: 16px; color: #334155;">${roleMessage}</p>
          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.CLIENT_URL || 'https://codsoft-rho-nine.vercel.app'}"
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
              Get Started →
            </a>
          </div>
        </div>
        <div style="background: #e2e8f0; padding: 16px; text-align: center; font-size: 13px; color: #64748b;">
          You received this email because you created an account on JobBoard.
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendNewApplicationEmail,
  sendStatusUpdateEmail,
  sendWelcomeEmail,
};
