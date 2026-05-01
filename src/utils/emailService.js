const nodemailer = require('nodemailer');
const logger = require('./logger');

const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Force IPv4 to avoid ENETUNREACH errors on IPv6-only or restricted environments
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  };

  if (!config.host || !config.auth.user || !config.auth.pass) {
    logger.warn('[EmailService] Configuración SMTP incompleta. Los correos no se enviarán.');
    return null;
  }

  // Option to prefer IPv4
  return nodemailer.createTransport({
    ...config,
    host: config.host,
    port: config.port,
    family: 4 // Force IPv4
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return null;
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Nuxelit'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text,
      html
    };

    logger.debug(`[EmailService] Intentando enviar correo a: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    logger.info(`[EmailService] Correo enviado exitosamente. ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`[EmailService] Error al enviar correo: ${error.message}`);
    logger.error(error.stack);
    return null;
  }
};

module.exports = {
  sendEmail
};

