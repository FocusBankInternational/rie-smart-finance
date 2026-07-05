/* ================================================================
   R.I.E. Smart Finance — prestamos.js
   Módulo completo de Préstamos
   ================================================================ */

let sessionP = null;

document.addEventListener('DOMContentLoaded', () => {
  sessionP = requireAuth();
  if (!sessionP) return;

  // Fecha de inicio por defecto = hoy
  document.getElementById('p-fecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('p-moneda').value = sessionP.moneda || 'USD';

  // Ocultar formulario por defecto
  document.getElementById('form-prestamo').style.display = 'none';

  renderPrestamos();
  actualizarStats();
});

// ── CREAR PRÉSTAMO ────────────────────────────────────────────
function crearPrestamo(e) {
  e.preventDefault();
  const err = document.getElementById('prest-error');
  err.style.display = 'none';

  const beneficiario = document.getElementById('p-beneficiario').value.trim();
  const monto        = parseFloat(document.getElementById('p-monto').value);
  const tasa         = parseFloat(document.getElementById('p-tasa').value);
  const plazo        = parseInt(document.getElementById('p-plazo').value);
  const fechaInicio  = document.getElementById('p-fecha').value;
  const sistema      = document.getElementById('p-sistema').value;
  const moneda       = document.getElementById('p-moneda').value;
  const tasaMora     = parseFloat(document.getElementById('p-mora').value) || 1.5;
  const obs          = document.getElementById('p-obs').value.trim();

  if (!beneficiario || isNaN(monto) || monto <= 0) {
    err.textContent = 'Complete correctamente todos los campos requeridos.';
    err.style.display = 'block'; return;
  }
  if (isNaN(tasa) || tasa < 0) {
    err.textContent = 'La tasa de interés debe ser un número mayor o igual a 0.';
    err.style.display = 'block'; return;
  }
  if (!plazo || plazo < 1 || plazo > 360) {
    err.textContent = 'El plazo debe estar entre 1 y 360 meses.';
    err.style.display = 'block'; return;
  }

  const prestamo = {
    id:           Date.now(),
    usuario_id:   sessionP.id,
    beneficiario, monto, tasa_anual: tasa,
    plazo_meses:  plazo, sistema_amort: sistema,
    moneda, tasa_mora: tasaMora,
    fecha_inicio: fechaInicio,
    estado:       'activo',
    observaciones: obs,
    fecha_creacion: new Date().toISOString()
  };

  // Generar tabla de amortización
  const tabla = sistema === 'frances'
    ? amortizacionFrances(monto, tasa, plazo, fechaInicio)
    : amortizacionAleman(monto, tasa, plazo, fechaInicio);

  // Crear cuotas
  const cuotas = tabla.map(row => ({
    id:              Date.now() + row.numero,
    prestamo_id:     prestamo.id,
    numero_cuota:    row.numero,
    fecha_vencimiento: row.fecha,
    capital:         row.capital,
    interes:         row.interes,
    cuota_total:     row.cuota,
    saldo_restante:  row.saldo,
    pagada:          false,
    fecha_pago:      null,
    mora:            0
  }));

  savePrestamo(prestamo);
  saveCuotas(cuotas);

  // Reset form
  document.getElementById('p-beneficiario').value = '';
  document.getElementById('p-monto').value = '';
  document.getElementById('p-tasa').value = '';
  document.getElementById('p-plazo').value = '';
  document.getElementById('p-obs').value = '';
  document.getElementById('preview-box').style.display = 'none';

  renderPrestamos();
  actualizarStats();

  alert(`✅ Préstamo registrado con éxito.\n${plazo} cuotas generadas para ${beneficiario}.`);
}

// ── PREVIEW AMORTIZACIÓN ─────────────────────────────────────
function previewAmortizacion() {
  const monto       = parseFloat(document.getElementById('p-monto').value);
  const tasa        = parseFloat(document.getElementById('p-tasa').value);
  const plazo       = parseInt(document.getElementById('p-plazo').value);
  const fechaInicio = document.getElementById('p-fecha').value;
  const sistema     = document.getElementById('p-sistema').value;
  const moneda      = document.getElementById('p-moneda').value;
  const err         = document.getElementById('prest-error');
  err.style.display = 'none';

  if (!monto || !plazo || isNaN(tasa) || !fechaInicio) {
    err.textContent = 'Complete monto, tasa, plazo y fecha para ver la vista previa.';
    err.style.display = 'block'; return;
  }

  const tabla = sistema === 'frances'
    ? amortizacionFrances(monto, tasa, plazo, fechaInicio)
    : amortizacionAleman(monto, tasa, plazo, fechaInicio);

  const totalPagar    = tabla.reduce((s, r) => s + r.cuota, 0);
  const totalIntereses = tabla.reduce((s, r) => s + r.interes, 0);

  document.getElementById('prev-cuota').textContent    = sistema==='frances' ? fmtMoney(tabla[0].cuota, moneda) : 'Variable';
  document.getElementById('prev-total').textContent    = fmtMoney(totalPagar, moneda);
  document.getElementById('prev-intereses').textContent = fmtMoney(totalIntereses, moneda);

  const tbl = document.getElementById('tabla-preview');
  tbl.innerHTML = `
    <thead><tr>
      <th>#</th><th>Vencimiento</th><th>Capital</th>
      <th>Interés</th><th>Cuota Total</th><th>Saldo</th>
    </tr></thead>
    <tbody>
      ${tabla.slice(0,24).map((r,i) => `
        <tr>
          <td>${r.numero}</td>
          <td>${fmtDate(r.fecha)}</td>
          <td>${fmtMoney(r.capital, moneda)}</td>
          <td>${fmtMoney(r.interes, moneda)}</td>
          <td><strong>${fmtMoney(r.cuota, moneda)}</strong></td>
          <td>${fmtMoney(r.saldo, moneda)}</td>
        </tr>
      `).join('')}
      ${tabla.length > 24 ? `<tr><td colspan="6" class="empty-row">... y ${tabla.length-24} cuotas más</td></tr>` : ''}
    </tbody>`;

  document.getElementById('preview-box').style.display = '';
}

// ── RENDER LISTA DE PRÉSTAMOS ─────────────────────────────────
function renderPrestamos() {
  const filtro = document.getElementById('filtro-estado')?.value || 'todos';
  let prestamos = getPrestamos(sessionP.id);

  // Actualizar estados por mora
  prestamos = prestamos.map(p => {
    if (p.estado === 'activo') {
      const hoy = new Date().toISOString().split('T')[0];
      const cuotas = getCuotas(p.id);
      const tieneVencidas = cuotas.some(c => !c.pagada && c.fecha_vencimiento < hoy);
      if (tieneVencidas) {
        updatePrestamo(p.id, { estado: 'mora' });
        return { ...p, estado: 'mora' };
      }
    }
    return p;
  });

  if (filtro !== 'todos') prestamos = prestamos.filter(p => p.estado === filtro);

  const tbody = document.getElementById('tabla-prestamos-body');
  if (!prestamos.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-row">Sin préstamos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  prestamos.sort((a,b) => b.id - a.id).forEach(p => {
    const cuotas       = getCuotas(p.id);
    const pendientes   = cuotas.filter(c => !c.pagada);
    const porCobrar    = pendientes.reduce((s,c) => s + c.cuota_total, 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.beneficiario}</strong></td>
      <td>${fmtMoney(p.monto, p.moneda)}</td>
      <td>${p.tasa_anual}% anual</td>
      <td>${p.plazo_meses} meses</td>
      <td style="text-transform:capitalize">${p.sistema_amort}</td>
      <td>${fmtDate(p.fecha_inicio)}</td>
      <td><span class="badge badge-${p.estado}">${p.estado.toUpperCase()}</span></td>
      <td><strong>${fmtMoney(porCobrar, p.moneda)}</strong></td>
      <td style="white-space:nowrap">
        <a href="cobros.html?p=${p.id}" class="btn-ver">Ver Cuotas</a>
        &nbsp;
        <button class="btn-delete" onclick="eliminarPrestamo(${p.id})">Eliminar</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ── ELIMINAR PRÉSTAMO ─────────────────────────────────────────
function eliminarPrestamo(id) {
  const cuotas    = getCuotas(id);
  const pagadas   = cuotas.filter(c => c.pagada).length;
  if (pagadas > 0) {
    if (!confirm(`Este préstamo tiene ${pagadas} cuota(s) ya pagada(s). ¿Desea eliminarlo de todas formas?`)) return;
  } else {
    if (!confirm('¿Eliminar este préstamo y todas sus cuotas?')) return;
  }
  deletePrestamo(id);
  renderPrestamos();
  actualizarStats();
}

// ── ESTADÍSTICAS ──────────────────────────────────────────────
function actualizarStats() {
  const prestamos = getPrestamos(sessionP.id);
  const activos   = prestamos.filter(p => p.estado === 'activo').length;
  const mora      = prestamos.filter(p => p.estado === 'mora').length;
  const cancel    = prestamos.filter(p => p.estado === 'cancelado').length;
  const capital   = prestamos.reduce((s,p) => s + p.monto, 0);

  let porCobrar = 0;
  prestamos.forEach(p => {
    getCuotas(p.id).filter(c=>!c.pagada).forEach(c => porCobrar += c.cuota_total);
  });

  const mon = sessionP.moneda || 'USD';
  document.getElementById('stat-total').textContent      = prestamos.length;
  document.getElementById('stat-activos').textContent    = activos;
  document.getElementById('stat-mora').textContent       = mora;
  document.getElementById('stat-capital').textContent    = fmtMoney(capital, mon);
  document.getElementById('stat-por-cobrar').textContent = fmtMoney(porCobrar, mon);
  document.getElementById('stat-cancelados').textContent = cancel;
}
