export function setupSignature(canvas, clearButton) {
  const ctx = canvas.getContext('2d'); let drawing = false; let hasInk = false;
  ctx.strokeStyle = '#102a43'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const point = event => { const rect = canvas.getBoundingClientRect(); const touch = event.touches?.[0] || event; return { x: (touch.clientX - rect.left) * canvas.width / rect.width, y: (touch.clientY - rect.top) * canvas.height / rect.height }; };
  const start = event => { event.preventDefault(); drawing = true; const p = point(event); ctx.beginPath(); ctx.moveTo(p.x,p.y); };
  const move = event => { if (!drawing) return; event.preventDefault(); const p = point(event); ctx.lineTo(p.x,p.y); ctx.stroke(); hasInk = true; };
  const end = () => { drawing = false; };
  ['mousedown','touchstart'].forEach(type => canvas.addEventListener(type,start,{passive:false})); ['mousemove','touchmove'].forEach(type => canvas.addEventListener(type,move,{passive:false})); ['mouseup','mouseleave','touchend'].forEach(type => canvas.addEventListener(type,end));
  clearButton.addEventListener('click', () => { ctx.clearRect(0,0,canvas.width,canvas.height); hasInk = false; });
  return { toDataURL: () => hasInk ? canvas.toDataURL('image/png') : '' };
}
