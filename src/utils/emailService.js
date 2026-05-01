const nodemailer = require('nodemailer');
const logger = require('./logger');

const createTransporter = () => {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    logger.warn('[EmailService] Credenciales SMTP faltantes.');
    return null;
  }

  // Final robust config: Port 465 (Secure), Force IPv4
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: pass,
    },
    family: 4, // Force IPv4 to prevent ENETUNREACH on IPv6
    connectionTimeout: 15000, // 15s
    greetingTimeout: 15000,
    socketTimeout: 15000,
    debug: true,
    logger: true,
    tls: {
      rejectUnauthorized: false, // Avoid cert issues
      minVersion: 'TLSv1.2'
    }
  });
};


const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      logger.error('[EmailService] No se pudo crear el transporte — abortando envío.');
      return null;
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Nuxelit'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    };

    logger.info(`[EmailService] Intentando enviar correo a: ${to} (Vía Gmail Service)`);
    const info = await transporter.sendMail(mailOptions);
    logger.info(`[EmailService] Correo enviado exitosamente. ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`[EmailService] Error al enviar correo: ${error.message}`);
    // If we still see IPv6 addresses in the error, it's a network-level issue
    if (error.message.includes('ENETUNREACH')) {
      logger.error('[EmailService] El servidor no tiene acceso a internet o está bloqueando el puerto de salida.');
    }
    return null;
  }
};

module.exports = {
  sendEmail
};


