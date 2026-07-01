const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const LOGS_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Nodemailer transport setup
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Send an email notification. Falls back to logging in development.
 */
exports.sendEmailNotification = async (to, subject, htmlContent) => {
  const logEntry = `[${new Date().toISOString()}] To: ${to} | Subject: ${subject}\nContent:\n${htmlContent}\n----------------------------------------\n`;
  fs.appendFileSync(path.join(LOGS_DIR, 'email_logs.txt'), logEntry);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"EventStaff Nepal" <noreply@eventstaffnepal.com>',
        to,
        subject,
        html: htmlContent
      });
      console.log(`[SMTP] Email sent to ${to}: "${subject}"`);
    } catch (error) {
      console.error(`[SMTP] Failed to send email to ${to}:`, error);
    }
  } else {
    console.log(`[SANDBOX EMAIL] Logged email to ${to}: "${subject}" (Check server/logs/email_logs.txt)`);
  }
};

/**
 * Send an SMS notification. Logs to a file in development/sandbox.
 */
exports.sendSMSNotification = async (phoneNumber, body) => {
  const logEntry = `[${new Date().toISOString()}] Phone: ${phoneNumber}\nMessage: ${body}\n----------------------------------------\n`;
  fs.appendFileSync(path.join(LOGS_DIR, 'sms_logs.txt'), logEntry);

  // If real Twilio credentials exist in the environment, we could use them.
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      console.log(`[Twilio] SMS sent to ${phoneNumber}`);
    } catch (error) {
      console.error(`[Twilio] Failed to send SMS to ${phoneNumber}:`, error);
    }
  } else {
    console.log(`[SANDBOX SMS] Logged SMS to ${phoneNumber}: "${body}" (Check server/logs/sms_logs.txt)`);
  }
};
