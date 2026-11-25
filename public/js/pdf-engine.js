import { formatCOP, numericValue } from './calculator.js';

const OWNER = 'Richard Chávez';
const PHONE = '3144733375';
const EMAIL = 'construserviciolimitada@gmail.com';
const COLORS = { navy: [16, 42, 67], teal: [44, 165, 141], pale: [235, 242, 246], line: [170, 185, 195], ink: [25, 38, 48] };

export function createPDF(order) {
  if (!window.jspdf?.jsPDF) throw new Error('La librería PDF local no está disponible.');
  const doc = new window.jspdf.jsPDF({ format: 'letter', unit: 'mm' });
  const pageWidth = 215.9; const pageHeight = 279.4; const margin = 11; const contentWidth = pageWidth - margin * 2;
  const responsible = order.technician || OWNER; let y = 0;
  const text = value => String(value || '-');
  const money = value => `$ ${formatCOP(value)}`;
  const lines = (value, width, size = 7, max = 3) => { doc.setFontSize(size); return doc.splitTextToSize(text(value), width).slice(0, max); };
  const footer = () => { doc.setDrawColor(...COLORS.line); doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9); doc.setFontSize(6.5); doc.setTextColor(...COLORS.ink); doc.text('ConstruServicio Ltda. | Soacha, Colombia', margin, pageHeight - 5); doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 5, { align: 'right' }); };
  const page = () => { if (doc.getNumberOfPages() > 1) footer(); doc.addPage(); y = 14; doc.setFontSize(8); doc.setTextColor(...COLORS.navy); doc.text('CONSTRUSERVICIO | ORDEN DE SERVICIO', margin, y); y += 7; };
  const ensure = height => { if (y + height > pageHeight - 15) page(); };
  const box = (title, x, top, width, height) => { doc.setDrawColor(...COLORS.line); doc.setLineWidth(.35); doc.setFillColor(255, 255, 255); doc.rect(x, top, width, height, 'FD'); doc.setFillColor(...COLORS.pale); doc.rect(x, top, width, 7, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.2); doc.setTextColor(...COLORS.navy); doc.text(title, x + 3, top + 4.8); doc.setFont('helvetica', 'normal'); return top + 10; };
  const field = (label, value, x, top, width, maxLines = 1) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(6.2); doc.setTextColor(...COLORS.ink); doc.text(label, x, top); doc.setFont('helvetica', 'normal'); const values = lines(value, width, 7, maxLines); doc.text(values, x, top + 3.6, { lineHeightFactor: 1.05 }); };
  const serviceTypes = ['Diagnóstico', 'Reparación', 'Instalación', 'Mantenimiento', 'Otro'];
  const selectedServices = order.services || [];

  doc.setFillColor(...COLORS.navy); doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text('CONSTRUSERVICIO', margin, 10);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.3); doc.text('SERVICIO TÉCNICO Y REPARACIÓN DE ELECTRODOMÉSTICOS', margin, 15);
  doc.setFontSize(7); doc.text(`WhatsApp: ${PHONE}`, margin, 21); doc.text(`Correo: ${EMAIL}`, margin, 26); doc.text(`Responsable / Propietario: ${OWNER}`, margin, 31);
  doc.setFillColor(255, 255, 255); doc.roundedRect(139, 5, 65, 24, 1.5, 1.5, 'F'); doc.setTextColor(...COLORS.navy); doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.text('ORDEN DE SERVICIO No.', 142, 11); doc.setFontSize(12); doc.text(text(order.number), 142, 17); doc.setFontSize(7); doc.text('FECHA', 142, 23); doc.setFont('helvetica', 'normal'); doc.text(text(order.date), 155, 23);
  y = 38;

  doc.setDrawColor(...COLORS.line); doc.rect(margin, y, contentWidth, 12); doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...COLORS.navy); doc.text('TIPO DE SERVICIO', margin + 3, y + 4.5); doc.setFont('helvetica', 'normal');
  serviceTypes.forEach((type, index) => { const x = margin + 38 + index * 30.5; const checked = selectedServices.includes(type); doc.rect(x, y + 2.5, 3.2, 3.2); if (checked) doc.text('X', x + .7, y + 5.3); doc.text(type, x + 5, y + 5.3); });
  y += 16;

  let top = box('DATOS DEL CLIENTE', margin, y, contentWidth, 31);
  const col = (contentWidth - 8) / 3;
  field('NOMBRE / RAZÓN SOCIAL', order.clientName, margin + 3, top, col); field('DOCUMENTO / NIT', order.clientDocument, margin + 5 + col, top, col); field('TELÉFONO', order.clientPhone, margin + 7 + col * 2, top, col);
  field('DIRECCIÓN', order.clientAddress, margin + 3, top + 10, col); field('CIUDAD / BARRIO', order.clientCity, margin + 5 + col, top + 10, col); field('CORREO ELECTRÓNICO', order.clientEmail, margin + 7 + col * 2, top + 10, col);
  y += 35;

  top = box('DATOS DEL ELECTRODOMÉSTICO', margin, y, contentWidth, 29);
  const equipmentCol = (contentWidth - 10) / 4;
  field('TIPO DE EQUIPO', order.equipmentType, margin + 3, top, equipmentCol); field('MARCA', order.equipmentBrand, margin + 5 + equipmentCol, top, equipmentCol); field('MODELO', order.equipmentModel, margin + 7 + equipmentCol * 2, top, equipmentCol); field('SERIAL', order.equipmentSerial, margin + 9 + equipmentCol * 3, top, equipmentCol);
  field('ACCESORIOS / OBSERVACIONES DEL EQUIPO', order.equipmentNotes, margin + 3, top + 11, contentWidth - 6, 2); y += 33;

  top = box('DESCRIPCIÓN DEL SERVICIO', margin, y, contentWidth, 38); const descriptionGap = 6; const descriptionWidth = (contentWidth - descriptionGap - 6) / 2;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.4); doc.setTextColor(...COLORS.ink); doc.text('DESCRIPCIÓN DE LA FALLA / REPORTE DEL CLIENTE', margin + 3, top); doc.text('SERVICIO REALIZADO / TRABAJO EFECTUADO', margin + 3 + descriptionWidth + descriptionGap, top); doc.setFont('helvetica', 'normal');
  doc.setDrawColor(...COLORS.line); doc.rect(margin + 3, top + 2, descriptionWidth, 23); doc.rect(margin + 3 + descriptionWidth + descriptionGap, top + 2, descriptionWidth, 23);
  doc.setFontSize(7); doc.text(lines(order.failure, descriptionWidth - 5, 7, 6), margin + 5, top + 7, { lineHeightFactor: 1.15 }); doc.text(lines(order.work, descriptionWidth - 5, 7, 6), margin + 5 + descriptionWidth + descriptionGap, top + 7, { lineHeightFactor: 1.15 }); y += 42;

  ensure(45); top = box('REPUESTOS Y MATERIALES UTILIZADOS', margin, y, contentWidth, 8); const widths = [17, 70, 38, 31, 34]; const headers = ['CANT', 'DESCRIPCIÓN', 'REFERENCIA', 'V. UNIT.', 'V. TOTAL']; let x = margin;
  doc.setFillColor(...COLORS.navy); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.4); headers.forEach((header, i) => { doc.rect(x, top, widths[i], 7, 'F'); doc.text(header, x + 2, top + 4.6); x += widths[i]; });
  let rowY = top + 7; const parts = order.partRows || (Array.isArray(order.parts) ? order.parts : []); const rowHeight = 8;
  parts.forEach(part => { if (rowY + rowHeight > pageHeight - 48) { y = rowY; page(); rowY = y; } x = margin; const values = [part.qty, part.description, part.reference, money(part.unit), money(part.total)]; values.forEach((value, i) => { doc.setDrawColor(...COLORS.line); doc.setTextColor(...COLORS.ink); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.rect(x, rowY, widths[i], rowHeight); doc.text(lines(value, widths[i] - 4, 6.8, 2), x + 2, rowY + 3.2, { lineHeightFactor: 1.05 }); x += widths[i]; }); rowY += rowHeight; });
  if (!parts.length) { x = margin; widths.forEach(width => { doc.setDrawColor(...COLORS.line); doc.rect(x, rowY, width, rowHeight); x += width; }); doc.setFontSize(6.8); doc.text('Sin repuestos registrados', margin + 2, rowY + 5); rowY += rowHeight; }
  y = rowY + 4; const observationsHeight = 20; top = box('OBSERVACIONES / RECOMENDACIONES', margin, y, contentWidth, observationsHeight); doc.setTextColor(...COLORS.ink); doc.setFontSize(7); doc.text(lines(order.observations, contentWidth - 8, 7, 3), margin + 3, top + 4, { lineHeightFactor: 1.15 }); y += observationsHeight + 5;

  ensure(48); const financeWidth = 92; const financeX = pageWidth - margin - financeWidth; top = box('LIQUIDACIÓN FINANCIERA (COP)', financeX, y, financeWidth, 46); const financial = [['DIAGNÓSTICO', order.diagnosis], ['MANO DE OBRA', order.labor], ['REPUESTOS', order.parts], ['DESPLAZAMIENTO', order.transport], ['OTROS', order.other]]; financial.forEach(item => { doc.setDrawColor(...COLORS.line); doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.rect(financeX + 2, top, financeWidth - 4, 5.5); doc.text(item[0], financeX + 4, top + 3.8); doc.text(money(item[1]), financeX + financeWidth - 5, top + 3.8, { align: 'right' }); top += 5.5; }); doc.setFillColor(...COLORS.teal); doc.setDrawColor(...COLORS.teal); doc.rect(financeX + 2, top, financeWidth - 4, 7, 'FD'); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.text('TOTAL A PAGAR', financeX + 4, top + 4.7); doc.text(money(order.total), financeX + financeWidth - 5, top + 4.7, { align: 'right' });
  y += 52; ensure(39); top = box('CIERRE, GARANTÍA Y FIRMA', margin, y, contentWidth, 39); doc.setTextColor(...COLORS.ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.text('TÉCNICO RESPONSABLE', margin + 3, top); doc.text('NOMBRE CLIENTE', margin + 76, top); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2); doc.text(responsible, margin + 3, top + 5); doc.text(text(order.signerName), margin + 76, top + 5); doc.setDrawColor(...COLORS.line); doc.rect(margin + 137, top - 1, 51, 25); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.text('FIRMA DEL CLIENTE', margin + 140, top + 4); if (order.signature) doc.addImage(order.signature, 'PNG', margin + 140, top + 7, 45, 15);
  const warranty = order.warranty || 30; doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.text('GARANTÍA DEL SERVICIO', margin + 3, top + 15); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); const legal = `Este servicio cuenta con garantía de ${warranty} días a partir de la fecha. No cubre daños por mal uso, voltaje inadecuado o intervenciones externas.`; doc.text(lines(legal, 127, 6.8, 3), margin + 3, top + 19, { lineHeightFactor: 1.1 });
  footer();
  return doc;
}

export function previewPDF(order) {
  const doc = createPDF(order); const modal = document.createElement('div'); modal.className = 'pdf-modal';
  modal.innerHTML = `<div class="pdf-modal-card"><div class="pdf-modal-actions"><strong>Vista previa ${order.number}</strong><button type="button" class="button secondary pdf-print">Imprimir</button><button type="button" class="button secondary pdf-close">Cerrar</button></div><iframe title="Vista previa del PDF"></iframe></div>`;
  document.body.append(modal); modal.querySelector('iframe').src = doc.output('datauristring'); modal.querySelector('.pdf-close').onclick = () => modal.remove(); modal.querySelector('.pdf-print').onclick = () => modal.querySelector('iframe').contentWindow.print();
}

export function downloadPDF(order) { try { createPDF(order).save(`${order.number}.pdf`); } catch (error) { previewPDF(order); } }
