let sessionD = null;
document.addEventListener('DOMContentLoaded', () => {
  sessionD = requireAuth();
  if (!sessionD) return;
  document.getElementById('m-fecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('m-moneda').value = sessionD.moneda || 'USD';
  renderTabla();
});
function guardarMovimiento(e) {
  e.preventDefault();
  const err = document.getElementById('mov-error');
  err.style.display = 'none';
  const fecha    = document.getElementById('m-fecha').value;
  const tipo     = document.getElementById('m-tipo').value;
  const valor    = parseFloat(document.getElementById('m-valor').value);
  const moneda   = document.getElementById('m-moneda').value;
  const concepto = document.getElementById('m-concepto').value.trim();
  const obs      = document.getElementById('m-obs').value.trim();
  if (!fecha || !concepto || isNaN(valor) || valor <= 0) {
    err.textContent = 'Complete todos los campos correctamente.';
    err.style.display = 'block'; return;
  }
  saveMovimiento({ id: Date.now(), usuario_id: sessionD.id, fecha, concepto, tipo, valor, moneda, observaciones: obs, fecha_creacion: new Date().toISOString() });
  document.getElementById('m-concepto').value = '';
  document.getElementById('m-valor').value = '';
  document.getElementById('m-obs').value = '';
  renderTabla();
}
function renderTabla() {
  const tbody = document.getElementById('tabla-diario-body');
  const movs  = getMovimientos(sessionD.id).sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.id-a.id);
  if (!movs.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty-row">Sin movimientos registrados</td></tr>'; return; }
  tbody.innerHTML = '';
  movs.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fmtDate(m.fecha)}</td><td>${m.concepto}</td><td><span class="badge badge-${m.tipo}">${m.tipo}</span></td><td><strong>${fmtMoney(m.valor,m.moneda)}</strong></td><td>${m.moneda}</td><td><button class="btn-delete" onclick="eliminar(${m.id})">Eliminar</button></td>`;
    tbody.appendChild(tr);
  });
}
function eliminar(id) { if (!confirm('¿Eliminar este movimiento?')) return; deleteMovimiento(id); renderTabla(); }
