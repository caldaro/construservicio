import { TEMPLATE_PDF_BASE64 } from './template-data.js';
import { formatCOP } from './calculator.js';

const OWNER = 'Richard Chávez';
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const BLACK = PDFLib.rgb(0.05, 0.08, 0.1);
const GREEN = PDFLib.rgb(0.35, 0.66, 0.09);

const clean = value => String(value || '').trim();
const money = value => `$ ${formatCOP(value)}`;
const checked = (order, service) => (order.services || []).includes(service);

function wrap(font, value, size, width) {
  const lines = []; const paragraphs = (clean(value) || '-').split(/\r?\n/);
  paragraphs.forEach(paragraph => { let line = ''; paragraph.split(/\s+/).forEach(word => { const candidate = line ? `${line} ${word}` : word; if (line && font.widthOfTextAtSize(candidate, size) > width) { lines.push(line); line = word; } else line = candidate; }); if (line) lines.push(line); });
  return lines;
}

function drawWrapped(page, font, value, x, y, width, size = 8, lineHeight = 10, maxLines = 5) {
  const lines = wrap(font, value, size, width).slice(0, maxLines);
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * lineHeight, size, font, color: BLACK }));
}

function drawGrid(page, font) {
  const step = 28.3465;
  for (let x = 0; x <= PAGE_WIDTH; x += step) {
    page.drawLine({ start: { x, y: 0 }, end: { x, y: PAGE_HEIGHT }, thickness: .2, color: PDFLib.rgb(.75, .75, .75), opacity: .35 });
    page.drawText(`${Math.round(x / step)}0`, { x: x + 1, y: PAGE_HEIGHT - 10, size: 5, font, color: PDFLib.rgb(.3, .3, .3) });
  }
  for (let y = 0; y <= PAGE_HEIGHT; y += step) {
    page.drawLine({ start: { x: 0, y }, end: { x: PAGE_WIDTH, y }, thickness: .2, color: PDFLib.rgb(.75, .75, .75), opacity: .35 });
    page.drawText(`${Math.round(y / step)}0`, { x: 1, y: y + 1, size: 5, font, color: PDFLib.rgb(.3, .3, .3) });
  }
}

function stampOrder(page, fonts, order) {
  const { regular, bold } = fonts;
  const responsible = clean(order.technician) || OWNER;
  const text = (value, x, y, size = 8, font = regular, color = BLACK) => page.drawText(clean(value), { x, y, size, font, color });
  const field = (label, value, x, y, width, size = 7.5) => { text(value, x, y, size); return label; };

  // Header fields. The original art is 612 x 792 pt and all coordinates use its lower-left origin.
  text(order.number?.replace(/^CS-OS-/, '') || 'XXX', 474, 738, 9, bold, GREEN);
  const dateParts = clean(order.date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const [year, month, day] = dateParts ? dateParts.slice(1) : ['', '', ''];
  text(day, 454, 711, 8, bold); text(month, 482, 711, 8, bold); text(year, 510, 711, 8, bold);
  const services = [
    { name: 'Diagnóstico', x: 420, y: 649 }, { name: 'Reparación', x: 484, y: 649 }, { name: 'Instalación', x: 546, y: 649 },
    { name: 'Mantenimiento', x: 420, y: 631 }, { name: 'Otro', x: 497, y: 631 }
  ];
  services.forEach(service => { if (checked(order, service.name)) text('X', service.x, service.y, 9, bold, GREEN); });
  if (checked(order, 'Otro')) text(order.serviceOther, 530, 631, 7.5);

  // Client block.
  field('Nombre / Razón Social', order.clientName, 106, 594, 190); field('Dirección', order.clientAddress, 405, 594, 170);
  field('Documento / NIT', order.clientDocument, 93, 575, 190); field('Ciudad / Barrio', order.clientCity, 405, 575, 170);
  field('Teléfono', order.clientPhone, 93, 556, 180); field('Correo electrónico', order.clientEmail, 405, 556, 170);

  // Appliance block.
  field('Tipo de equipo', order.equipmentType, 14, 514, 150); field('Marca', order.equipmentBrand, 182, 514, 135); field('Modelo', order.equipmentModel, 326, 514, 150); field('Serial', order.equipmentSerial, 485, 514, 110);
  drawWrapped(page, regular, order.equipmentNotes, 190, 496, 380, 7.5, 11, 3);

  // Two service description columns.
  drawWrapped(page, regular, order.failure, 13, 396, 295, 7.5, 19, 3);
  drawWrapped(page, regular, order.work, 326, 398, 270, 7.5, 19, 3);

  // Parts table. The template has four empty rows; additional rows are kept inside the same table area.
  const columns = [{ x: 11, width: 37 }, { x: 48, width: 148 }, { x: 196, width: 82 }, { x: 278, width: 65 }, { x: 343, width: 63 }];
  (order.partRows || []).slice(0, 4).forEach((part, index) => { const rowY = 294 - index * 24; const values = [part.qty, part.description, part.reference, money(part.unit), money(part.total)]; values.forEach((value, column) => drawWrapped(page, regular, value, columns[column].x + 2, rowY, columns[column].width - 4, 7, 9, 2)); });

  // Observations / recommendations.
  drawWrapped(page, regular, order.observations, 42, 206, 300, 8, 24, 3);

  // Financial block on the right side.
  const financial = [['DIAGNÓSTICO', order.diagnosis, 303], ['MANO DE OBRA', order.labor, 286], ['REPUESTOS', order.parts, 267], ['DESPLAZAMIENTO', order.transport, 248], ['OTROS', order.other, 229]];
  financial.forEach(([label, value, y]) => text(money(value), 492, y, 8, bold));
  text(money(order.total), 497, 188, 10, bold, GREEN);

  // Closing fields and the captured signature.
  text(responsible, 230, 104, 8); text(order.signerName, 230, 84, 8);
  const warranty = order.warranty || 30; text(String(warranty), 527, 150, 8, bold, GREEN);
  if (order.signature) page.drawImage(order.signature, { x: 120, y: 48, width: 95, height: 38 });
}

export async function createPDF(order) {
  if (!window.PDFLib?.PDFDocument) throw new Error('La librería pdf-lib local no está disponible.');
  const pdf = await window.PDFLib.PDFDocument.load(TEMPLATE_PDF_BASE64);
  while (pdf.getPageCount() > 1) pdf.removePage(pdf.getPageCount() - 1);
  const page = pdf.getPages()[0]; const regular = await pdf.embedFont(window.PDFLib.StandardFonts.Helvetica); const bold = await pdf.embedFont(window.PDFLib.StandardFonts.HelveticaBold);
  const signature = order.signature ? await pdf.embedPng(order.signature) : null;
  const fonts = { regular, bold }; stampOrder(page, fonts, { ...order, signature });
  if (new URLSearchParams(window.location.search).get('debug') === 'grid') drawGrid(page, regular);
  return pdf;
}

async function pdfBytes(order) { const pdf = await createPDF(order); return pdf.save(); }

export async function previewPDF(order) {
  try {
    const bytes = await pdfBytes(order); const blob = new Blob([bytes], { type: 'application/pdf' }); const modal = document.createElement('div'); modal.className = 'pdf-modal';
    modal.innerHTML = `<div class="pdf-modal-card"><div class="pdf-modal-actions"><strong>Vista previa ${order.number}</strong><button type="button" class="button secondary pdf-print">Imprimir PDF</button><button type="button" class="button secondary pdf-close">Cerrar</button></div><iframe title="Vista previa del PDF"></iframe></div>`;
    document.body.append(modal); const frame = modal.querySelector('iframe'); frame.src = URL.createObjectURL(blob); modal.querySelector('.pdf-close').onclick = () => { URL.revokeObjectURL(frame.src); modal.remove(); }; modal.querySelector('.pdf-print').onclick = () => { try { frame.focus(); frame.contentWindow.print(); } catch (error) { window.print(); } };
  } catch (error) {
    window.alert(`No fue posible preparar el PDF: ${error.message || error}`);
  }
}

export async function downloadPDF(order) {
  try { const bytes = await pdfBytes(order); const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })); const link = document.createElement('a'); link.href = url; link.download = `${order.number}.pdf`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (error) { await previewPDF(order); }
}
