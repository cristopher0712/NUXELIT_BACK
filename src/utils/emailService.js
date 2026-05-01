const nodemailer = require('nodemailer');
const logger = require('./logger');

const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  if (!config.host || !config.auth.user || !config.auth.pass) {
    logger.warn('[EmailService] Configuración SMTP incompleta. Los correos no se enviarán.');
    return null;
  }

  return nodemailer.createTransport(config);
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

