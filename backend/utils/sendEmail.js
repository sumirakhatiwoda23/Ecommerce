import nodemailer from 'nodemailer';

// Build the transporter once and reuse it across requests instead of
// opening a brand-new SMTP connection (TLS handshake + auth) on every
// single email — that reconnect was adding several seconds to every
// register/OTP request. Pooling keeps a small set of connections warm.
let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // App Password
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ email, subject, message }) => {
  try {
    const mailOptions = {
      from: `"ShopNest Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: message,
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`Email successfully sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error.message}`);
  }
};

export default sendEmail;
