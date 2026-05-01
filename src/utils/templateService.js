const fs = require('fs');
const path = require('path');

/**
 * Reads an HTML template from /src/templates and replaces
 * all {{key}} / {{nested.key}} placeholders with the
 * corresponding values from the data object.
 *
 * @param {string} templateName - File name inside src/templates (e.g. 'cotizacion.html')
 * @param {object} data         - Key-value map used for replacements
 * @returns {string} The rendered HTML string
 */
const renderTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, '..', 'templates', templateName);
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Replace {{key}} and {{nested.key}} placeholders
  html = html.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, key) => {
    const value = key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : ''), data);
    return value ?? '';
  });

  return html;
};

module.exports = { renderTemplate };
