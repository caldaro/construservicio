import { addPart, calculateTotal, numericValue, updateMoney } from './calculator.js';
import { setupSignature } from './signature.js';
import { downloadPDF } from './pdf-engine.js';
import { HISTORY_KEY, loadHistory, saveOrder, whatsapp } from './whatsapp-bridge.js';
import { BRAND_LOGO_DATA } from './branding-data.js';

// Edit this local allow-list when authorizing another technician.
const AUTH_USERS = { richard: { pin: '3144', technician: 'Richard Chávez' } };
const SESSION_KEY = 'construservicio.auth.session';
export const DEFAULT_TECHNICIAN = 'Richard Chávez';
const form = document.querySelector('#order-form');
const appShell = document.querySelector('#app-shell');
const loginScreen = document.querySelector('#login-screen');
const loginForm = document.querySelector('#login-form');
const loginError = document.querySelector('#login-error');
const downloadButton = document.querySelector('#download-pdf');
const whatsappButton = document.querySelector('#send-whatsapp');
let savedOrder = null;
let activeUsername = null;

const nextNumber = () => `CS-OS-${String(Number(localStorage.getItem('construservicio.sequence') || 0) + 1).padStart(3, '0')}`;
const setBrandLogos = () => { document.querySelector('#brand-logo').src = BRAND_LOGO_DATA; document.querySelector('#login-logo').src = BRAND_LOGO_DATA; };
const setEmissionActions = enabled => { downloadButton.disabled = !enabled; whatsappButton.disabled = !enabled; };

function unlock(username) {
  const user = AUTH_USERS[username];
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username, technician: user.technician, at: Date.now() }));
  activeUsername = username; loginScreen.hidden = true; appShell.hidden = false; form.elements.technician.value = user.technician || DEFAULT_TECHNICIAN; setBrandLogos();
}

loginForm.addEventListener('submit', event => {
  event.preventDefault(); const username = loginForm.elements.username.value.trim().toLowerCase(); const pin = loginForm.elements.pin.value.trim(); const user = AUTH_USERS[username];
  if (!user || user.pin !== pin) { loginError.textContent = 'Usuario o PIN no válido.'; return; }
  loginError.textContent = ''; unlock(username);
});
document.querySelector('#logout').addEventListener('click', () => { localStorage.removeItem(SESSION_KEY); activeUsername = null; savedOrder = null; setEmissionActions(false); appShell.hidden = true; loginScreen.hidden = false; loginForm.reset(); });

function collect() {
  const data = Object.fromEntries(new FormData(form).entries());
  data.services = [...form.querySelectorAll('[name="service"]:checked')].map(input => input.value);
  data.partRows = [...form.querySelectorAll('#parts-body tr')].map(row => ({ qty: row.querySelector('[name="partQty"]').value, description: row.querySelector('[name="partDescription"]').value, reference: row.querySelector('[name="partReference"]').value, unit: numericValue(row.querySelector('[name="partUnit"]').value), total: numericValue(row.querySelector('.row-total').textContent) }));
  ['diagnosis', 'labor', 'parts', 'transport', 'other'].forEach(key => { data[key] = numericValue(data[key]); });
  data.total = calculateTotal(form); data.signature = signature.toDataURL(); data.id = `${data.number}-${Date.now()}`; return data;
}

function validateOrder() {
  if (!form.reportValidity()) return false;
  const hasEconomicValue = ['diagnosis', 'labor', 'parts', 'transport', 'other'].some(key => numericValue(form.elements[key].value) > 0);
  if (!hasEconomicValue) { window.alert('Registra al menos un valor económico mayor que cero.'); return false; }
  if (!signature.toDataURL()) { window.alert('La firma del cliente es obligatoria para emitir la orden.'); return false; }
  return true;
}

function renderHistory() {
  const container = document.querySelector('#history-list'); const orders = loadHistory();
  container.innerHTML = orders.length ? orders.map(order => `<div class="history-item"><div><strong>${order.number}</strong><small>${order.date} · ${order.clientName || 'Sin cliente'} · $ ${order.total.toLocaleString('es-CO')}</small></div><div><button class="button secondary" data-pdf="${order.id}">PDF</button><button class="button secondary" data-wa="${order.id}">WhatsApp</button></div></div>`).join('') : '<p class="muted">Aún no hay órdenes emitidas.</p>';
  container.querySelectorAll('[data-pdf]').forEach(button => { button.onclick = () => downloadPDF(orders.find(order => order.id === button.dataset.pdf)); });
  container.querySelectorAll('[data-wa]').forEach(button => { button.onclick = () => whatsapp(orders.find(order => order.id === button.dataset.wa)); });
}

function downloadText(filename, content, type) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function csvCell(value) { return `"${String(value ?? '').replace(/"/g, '""')}"`; }
function exportBackup() {
  const orders = loadHistory(); const stamp = new Date().toISOString().slice(0, 10); const payload = { version: 1, exportedAt: new Date().toISOString(), sequence: Number(localStorage.getItem('construservicio.sequence') || 0), orders };
  downloadText(`construservicio-respaldo-${stamp}.json`, JSON.stringify(payload, null, 2), 'application/json');
  const headers = ['number', 'date', 'clientName', 'clientPhone', 'clientCity', 'equipmentType', 'technician', 'total']; const rows = [headers, ...orders.map(order => headers.map(header => order[header]))].map(row => row.map(csvCell).join(',')); downloadText(`construservicio-ordenes-${stamp}.csv`, `\ufeff${rows.join('\r\n')}`, 'text/csv;charset=utf-8');
}
function restoreBackup(file) {
  const reader = new FileReader(); reader.onload = () => { try { const backup = JSON.parse(reader.result); if (!Array.isArray(backup.orders)) throw new Error('El archivo no contiene órdenes válidas.'); const orders = backup.orders.filter(order => order?.number).slice(0, 50); const highest = orders.reduce((max, order) => Math.max(max, Number(String(order.number).match(/\d+$/)?.[0] || 0)), 0); const sequence = Math.max(Number(backup.sequence) || 0, highest); localStorage.setItem(HISTORY_KEY, JSON.stringify(orders)); localStorage.setItem('construservicio.sequence', String(sequence)); savedOrder = null; setEmissionActions(false); form.elements.number.value = nextNumber(); renderHistory(); window.alert(`Respaldo restaurado. Próxima orden: ${nextNumber()}`); } catch (error) { window.alert(`No se pudo restaurar el respaldo: ${error.message}`); } }; reader.readAsText(file);
}
function overrideSequence() { const user = AUTH_USERS[activeUsername]; if (!user || window.prompt('Ingresa tu PIN para ajustar el consecutivo:') !== user.pin) { window.alert('PIN no válido.'); return; } const value = window.prompt('Próximo número (ejemplo: CS-OS-025):', nextNumber()); const match = String(value || '').trim().match(/(?:CS-OS-)?(\d+)$/i); if (!match) { window.alert('Usa un formato como CS-OS-025.'); return; } const next = Number(match[1]); if (next < 1) { window.alert('El consecutivo debe ser mayor que cero.'); return; } localStorage.setItem('construservicio.sequence', String(next - 1)); form.elements.number.value = nextNumber(); savedOrder = null; setEmissionActions(false); window.alert(`Próximo consecutivo configurado: ${nextNumber()}`); }

const signature = setupSignature(document.querySelector('#signature'), document.querySelector('#clear-signature'));
form.elements.number.value = nextNumber(); form.elements.date.value = new Date().toISOString().slice(0, 10); addPart(form); setEmissionActions(false); setBrandLogos();
form.addEventListener('input', event => { if (savedOrder) { savedOrder = null; setEmissionActions(false); } if (event.target.classList.contains('money') || event.target.name === 'warranty') updateMoney(form); });
document.querySelector('#add-part').onclick = () => addPart(form);
downloadButton.onclick = () => { if (savedOrder) downloadPDF(savedOrder); };
whatsappButton.onclick = () => { if (savedOrder) whatsapp(savedOrder); };
document.querySelector('#refresh-history').onclick = renderHistory;
document.querySelector('#export-backup').onclick = exportBackup;
document.querySelector('#restore-backup').onclick = () => document.querySelector('#backup-file').click();
document.querySelector('#backup-file').addEventListener('change', event => { if (event.target.files[0]) restoreBackup(event.target.files[0]); event.target.value = ''; });
document.querySelector('#sequence-override').onclick = overrideSequence;
form.addEventListener('submit', event => { event.preventDefault(); if (!validateOrder()) return; const order = collect(); saveOrder(order); localStorage.setItem('construservicio.sequence', String(Number(order.number.match(/\d+$/)?.[0] || 0))); savedOrder = order; setEmissionActions(true); renderHistory(); form.elements.number.value = nextNumber(); window.alert(`Orden ${order.number} guardada y emitida.`); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
const session = (() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } })();
if (session?.username && AUTH_USERS[session.username]) unlock(session.username); else { loginScreen.hidden = false; appShell.hidden = true; }
updateMoney(form); renderHistory();
