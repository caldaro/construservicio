const number = value => Number(String(value || '').replace(/\D/g, '')) || 0;
export const formatCOP = value => new Intl.NumberFormat('es-CO').format(number(value));
export function calculateTotal(form) {
  return ['diagnosis','labor','parts','transport','other'].reduce((sum, name) => sum + number(form.elements[name]?.value), 0);
}
export function updateMoney(form) {
  form.querySelectorAll('.money').forEach(input => { input.value = formatCOP(input.value); });
  const total = calculateTotal(form);
  document.querySelector('#grand-total').textContent = `TOTAL A PAGAR: $ ${formatCOP(total)}`;
  document.querySelector('#warranty-label').textContent = form.elements.warranty.value || '30';
}
export function updateParts(form) {
  let total = 0;
  form.querySelectorAll('#parts-body tr').forEach(row => {
    const amount = number(row.querySelector('[name="partQty"]').value) * number(row.querySelector('[name="partUnit"]').value);
    row.querySelector('.row-total').textContent = `$ ${formatCOP(amount)}`;
    total += amount;
  });
  form.elements.parts.value = formatCOP(total);
  updateMoney(form);
}
export function addPart(form, values = {}) {
  const row = document.createElement('tr');
  row.innerHTML = `<td><input name="partQty" type="number" min="0" step="any" inputmode="decimal" value="${values.qty || 1}"></td><td><input name="partDescription" value="${values.description || ''}"></td><td><input name="partReference" value="${values.reference || ''}"></td><td><input name="partUnit" class="money" inputmode="numeric" value="${values.unit || 0}"></td><td class="row-total">$ 0</td><td><button type="button" class="button secondary remove-part" aria-label="Eliminar repuesto">Eliminar</button></td>`;
  form.querySelector('#parts-body').append(row);
  row.addEventListener('input', () => updateParts(form));
  row.querySelector('.remove-part').addEventListener('click', () => { row.remove(); updateParts(form); });
  updateParts(form);
}
export const numericValue = number;
