import { formatCOP, numericValue } from './calculator.js';
export function createPDF(order) {
  if (!window.jspdf?.jsPDF) throw new Error('La librería PDF local no está disponible.');
  const responsible = order.technician || 'Richard Chávez';
  const doc = new window.jspdf.jsPDF({ format: 'letter', unit: 'mm' }); const margin = 15; let y = 18;
  const line = (text, x = margin, size = 9) => { doc.setFontSize(size); doc.text(String(text || '-'), x, y); y += 5; };
  doc.setFillColor(16,42,67); doc.rect(0,0,216,28,'F'); doc.setTextColor(255,255,255); doc.setFontSize(16); doc.text('CONSTRUSERVICIO',margin,12); doc.setFontSize(9); doc.text('SERVICIO TECNICO Y REPARACION DE ELECTRODOMESTICOS',margin,19); doc.text('Richard Chávez | 3144733375',margin,25); doc.text(order.number,170,12); doc.text(order.date,170,19); doc.setTextColor(16,42,67); y = 38;
  doc.setFontSize(11); doc.text('ORDEN DE SERVICIO',margin,y); y += 8; doc.setDrawColor(180); doc.line(margin,y,201,y); y += 7;
  line(`Cliente: ${order.clientName} | Documento: ${order.clientDocument}`); line(`Telefono: ${order.clientPhone} | Ciudad/Barrio: ${order.clientCity}`); line(`Direccion: ${order.clientAddress}`); line(`Equipo: ${order.equipmentType} ${order.equipmentBrand} ${order.equipmentModel} | Serial: ${order.equipmentSerial}`); y += 3; doc.setFontSize(10); doc.text('DESCRIPCION DEL SERVICIO',margin,y); y += 6; line(`Reporte: ${order.failure}`,margin,9); line(`Trabajo: ${order.work}`,margin,9); y += 3;
  doc.text('REPUESTOS Y MATERIALES',margin,y); y += 6; doc.setFontSize(8); doc.text('Cant.   Descripcion                         Referencia                 Total',margin,y); y += 4; order.parts.forEach(part => { doc.text(`${part.qty}      ${String(part.description || '').slice(0,30)}                 ${String(part.reference || '').slice(0,18)}             $ ${formatCOP(part.total)}`,margin,y); y += 4; }); y += 4;
  doc.setDrawColor(16,42,67); doc.line(125,y,201,y); y += 6; doc.setFontSize(9); ['diagnosis','labor','parts','transport','other'].forEach(key => { doc.text(`${key === 'diagnosis' ? 'Diagnostico' : key === 'labor' ? 'Mano de obra' : key === 'parts' ? 'Repuestos' : key === 'transport' ? 'Desplazamiento' : 'Otros'}: $ ${formatCOP(order[key])}`,125,y); y += 5; }); doc.setFontSize(12); doc.text(`TOTAL A PAGAR: $ ${formatCOP(order.total)}`,125,y); y += 10;
  line(`Observaciones: ${order.observations}`,margin,9); line(`Garantia: ${order.warranty} dias. Este servicio cuenta con garantia de ${order.warranty} dias a partir de la fecha. No cubre danos por mal uso, voltaje inadecuado o intervenciones externas`,margin,8); y += 8; doc.text(`Responsable: ${responsible}`,margin,y); doc.text(`Cliente: ${order.signerName}`,110,y); y += 4; if (order.signature) doc.addImage(order.signature,'PNG',110,y,70,25);
  return doc;
}
export function previewPDF(order) {
  const doc = createPDF(order); const modal = document.createElement('div'); modal.className = 'pdf-modal';
  modal.innerHTML = `<div class="pdf-modal-card"><div class="pdf-modal-actions"><strong>Vista previa ${order.number}</strong><button type="button" class="button secondary pdf-print">Imprimir</button><button type="button" class="button secondary pdf-close">Cerrar</button></div><iframe title="Vista previa del PDF"></iframe></div>`;
  document.body.append(modal); modal.querySelector('iframe').src = doc.output('datauristring'); modal.querySelector('.pdf-close').onclick = () => modal.remove(); modal.querySelector('.pdf-print').onclick = () => modal.querySelector('iframe').contentWindow.print();
}
export function downloadPDF(order) { try { createPDF(order).save(`${order.number}.pdf`); } catch (error) { previewPDF(order); } }
