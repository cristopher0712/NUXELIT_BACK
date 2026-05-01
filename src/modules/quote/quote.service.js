const Quote = require('./quote.model');
const { getPaginationData } = require('../../utils/pagination');
const { sendEmail } = require('../../utils/emailService');
const { renderTemplate } = require('../../utils/templateService');
const logger = require('../../utils/logger');

const generateQuoteNumber = async () => {
  const year = new Date().getFullYear();
  // Find latest quote of the current year
  const latestQuote = await Quote.findOne({ quoteNumber: { $regex: `^QT-${year}-` } }).sort({ createdAt: -1 });

  let sequence = 1;
  if (latestQuote) {
    const lastParts = latestQuote.quoteNumber.split('-');
    sequence = parseInt(lastParts[2], 10) + 1;
  }

  const paddedSequence = sequence.toString().padStart(4, '0');
  return `QT-${year}-${paddedSequence}`;
};

/**
 * Sends the quotation notification email to all configured recipients.
 * Runs async — a SMTP failure is logged but never blocks the API response.
 */
const sendQuoteNotificationEmail = async (quote) => {
  logger.info(`[QuoteService] Iniciando proceso de notificación para cotización: ${quote.quoteNumber}`);
  try {
    // Recipients: comma-separated list from env, fallback to NOTIFICATION_EMAIL
    const rawRecipients = process.env.QUOTE_NOTIFICATION_EMAILS || process.env.NOTIFICATION_EMAIL || '';
    const recipients = rawRecipients
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    logger.debug(`[QuoteService] Destinatarios configurados: ${recipients.join(', ')}`);

    if (recipients.length === 0) {
      logger.warn('[QuoteService] No se encontraron destinatarios configurados — omitiendo envío de correo.');
      return;
    }

    const statusLabels = {
      pending: 'Pendiente',
      reviewing: 'En revisión',
      quoted: 'Cotizado',
      accepted: 'Aceptado',
      rejected: 'Rechazado'
    };

    // Build the data map that matches the {{placeholders}} in cotizacion.html
    const templateData = {
      quoteNumber: quote.quoteNumber,
      serviceType: quote.serviceType || 'No especificado',
      projectDescription: quote.projectDescription || 'Sin descripción',
      budget: quote.budget || 'No definido',
      timeline: quote.timeline || 'No definido',
      statusLabel: statusLabels[quote.status] || quote.status,
      adminQuoteUrl: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/admin/quotes/${quote._id}`,
      client: {
        name: quote.client?.name || 'N/A',
        email: quote.client?.email || 'N/A',
        phone: quote.client?.phone || 'N/A',
        company: quote.client?.company || 'N/A'
      }
    };

    logger.debug('[QuoteService] Datos del template preparados:', templateData);

    const html = renderTemplate('cotizacion.html', templateData);
    logger.debug('[QuoteService] Template HTML renderizado exitosamente.');

    const result = await sendEmail({
      to: recipients.join(', '),
      subject: `Nueva cotización ${quote.quoteNumber} — ${quote.client?.name || 'Cliente'}`,
      text: `Se recibió una nueva solicitud de cotización (${quote.quoteNumber}) de ${quote.client?.name}. Revisa el panel de administración.`,
      html
    });

    if (result) {
      logger.info(`[QuoteService] Correo de notificación enviado exitosamente a: ${recipients.join(', ')}`);
    } else {
      logger.error('[QuoteService] El servicio de correo falló al enviar la notificación.');
    }
  } catch (error) {
    logger.error(`[QuoteService] Error crítico al procesar la notificación por correo: ${error.message}`);
    logger.error(error.stack);
  }
};

const createQuote = async (quoteData) => {
  const dataToSave = {
    serviceType: quoteData.serviceType,
    projectDescription: quoteData.projectDescription,
    budget: quoteData.budget,
    timeline: quoteData.timeline,
    client: {
      name: quoteData.client?.name,
      email: quoteData.client?.email,
      phone: quoteData.client?.phone,
      company: quoteData.client?.company
    }
  };

  dataToSave.quoteNumber = await generateQuoteNumber();

  const quote = await Quote.create(dataToSave);
  logger.info(`[QuoteService] Cotización guardada en BD: ${quote.quoteNumber}`);

  // Fire-and-forget: enviar correo de notificación a los desarrolladores
  sendQuoteNotificationEmail(quote);

  return {
    quoteNumber: quote.quoteNumber,
    message: 'Tu solicitud de cotización ha sido recibida. Te enviaremos una propuesta en menos de 24 horas.'
  };
};

const getQuotes = async (query, pagination) => {
  const { page, limit, skip } = pagination;
  const filter = {};
  
  if (query.status) filter.status = query.status;
  if (query.serviceType) filter.serviceType = query.serviceType;

  const sort = {};
  if (query.sortBy) {
    sort[query.sortBy] = query.order === 'asc' ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }

  const quotes = await Quote.find(filter).sort(sort).skip(skip).limit(limit);
  const total = await Quote.countDocuments(filter);

  return {
    quotes,
    pagination: getPaginationData(total, page, limit)
  };
};

const getQuoteById = async (id) => {
  const quote = await Quote.findById(id);
  if (!quote) {
    throw new Error('Cotización no encontrada');
  }
  return quote;
};

const updateQuote = async (id, updateData) => {
  const quote = await Quote.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!quote) {
    throw new Error('Cotización no encontrada');
  }
  return quote;
};

const deleteQuote = async (id) => {
  const quote = await Quote.findByIdAndDelete(id);
  if (!quote) {
    throw new Error('Cotización no encontrada');
  }
  return;
};

module.exports = {
  createQuote,
  getQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote
};
