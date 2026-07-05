/* ================================================================
   R.I.E. Smart Finance — cobros.js
   Módulo completo de Cobros
   ================================================================ */

let sessionC     = null;
let cuotaActual  = null;   // cuota seleccionada para pagar
let prestamoActual = null; // préstamo actualmente seleccionado

document.addEventListener('DOMContentLoaded', () => {
  sessionC = requireAuth();
  if (!sessionC) return;

  cargarSelectorPrestamos();
  actualizarResumen();
  mostrarAlertas();

  // Si hay un ?p=ID en la URL, seleccionar ese préstamo
  const params = new URLSearchParams(window.location.search);
  const pid = params.get('p');
  if (pid) {
    setTimeout(() => {
      const sel = document.getElementById('sel-prestamo');
      if (sel) { sel.value = pid; cargarCuotas(); }
    }, 100);
  }
});

// ── SELECTOR ─────────────────────────────────────────────────
function cargarSelectorPrestamos() {
  const prestamos = getPrestamos(sessionC.id);
  const sel = document.getElementById('sel-prestamo');
  sel.innerHTML = '<option value="">— Seleccione un préstamo —</option>';
  prestamos.sort((a,b) => b.id - a.id).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.beneficiario} — ${fmtMoney(p.monto, p.moneda)} — ${p.estado.toUpperCase()}`;
    sel.appendChild(opt);
  });
}

// ── CARGAR CUOTAS ────────────────────────────────────────────
function cargarCuotas() {
  const pid = document.getElementById('sel-prestamo').value;
  if (!pid) {
    document.getElementById('info-prestamo').style.display = 'none';
    document.getElementById('sec-cuotas').style.display   = 'none';
    return;
  }

  const prestamos   = getPrestamos(sessionC.id);
  prestamoActual    = prestamos.find(p => p.id == pid);
  if (!prestamoActual) return;

  // Actualizar info del préstamo
  const cuotas  = getCuotas(pid);
  const pagadas = cuotas.filter(c => c.pagada).length;
  const pendientes = cuotas.filter(c => !c.pagada);
  const saldoPend = pendientes.reduce((s,c) => s + c.cuota_total, 0);

  document.getElementById('pi-beneficiario').textContent = prestamoActual.beneficiario;
  document.getElementById('pi-monto').textContent        = fmtMoney(prestamoActual.monto, prestamoActual.moneda);
  document.getElementById('pi-tasa').textContent         = prestamoActual.tasa_anual + '% anual';
  document.getElementById('pi-plazo').textContent        = prestamoActual.plazo_meses + ' meses';
  document.getElementById('pi-sistema').textContent      = prestamoActual.sistema_amort === 'frances' ? 'Francés' : 'Alemán';
  document.getElementById('pi-estado').innerHTML         = `<span class="badge badge-${prestamoActual.estado}">${prestamoActual.estado.toUpperCase()}</span>`;
  document.getElementById('pi-pagadas').textContent      = `${pagadas} / ${cuotas.length}`;
  document.getElementById('pi-saldo').textContent        = fmtMoney(saldoPend, prestamoActual.moneda);

  document.getElementById('info-prestamo').style.display = '';
  document.getElementById('sec-cuotas').style.display    = '';
  document.getElementById('titulo-cuotas').textContent   = `Tabla de Cuotas — ${prestamoActual.beneficiario}`;

  renderCuotas(pid);
}

// ── RENDER CUOTAS ─────────────────────────────────────────────
function renderCuotas(pid) {
  const filtro  = document.getElementById('filtro-cuotas')?.value || 'todas';
  const hoy     = new Date().toISOString().split('T')[0];
  let cuotas    = getCuotas(pid).sort((a,b) => a.numero_cuota - b.numero_cuota);

  if (filtro === 'pendientes') cuotas = cuotas.filter(c => !c.pagada && c.fecha_vencimiento >= hoy);
  if (filtro === 'vencidas')   cuotas = cuotas.filter(c => !c.pagada && c.fecha_vencimiento < hoy);
  if (filtro === 'pagadas')    cuotas = cuotas.filter(c => c.pagada);

  const tbody = document.getElementById('tabla-cuotas-body');
  tbody.innerHTML = '';

  if (!cuotas.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="empty-row">Sin cuotas en esta categoría</td></tr>`;
    return;
  }

  cuotas.forEach(c => {
    const esPagada   = c.pagada;
    const esVencida  = !esPagada && c.fecha_vencimiento < hoy;
    const diasAtraso = esVencida ? diasEntreFechas(c.fecha_vencimiento, hoy) : 0;
    const mora       = esPagada ? (c.mora||0) : calcularMora(c.cuota_total, prestamoActual.tasa_mora||1.5, diasAtraso);
    const totalMora  = round2(c.cuota_total + mora);

    let estado, badgeClass;
    if (esPagada)       { estado = 'PAGADA';    badgeClass = 'badge-pagada'; }
    else if (esVencida) { estado = 'VENCIDA';   badgeClass = 'badge-vencida'; }
    else                { estado = 'PENDIENTE'; badgeClass = 'badge-pendiente'; }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.numero_cuota}</strong></td>
      <td>${fmtDate(c.fecha_vencimiento)}${esVencida ? `<br><small class="mora-value">${diasAtraso} días atraso</small>` : ''}</td>
      <td>${fmtMoney(c.capital, prestamoActual.moneda)}</td>
      <td>${fmtMoney(c.interes, prestamoActual.moneda)}</td>
      <td><strong>${fmtMoney(c.cuota_total, prestamoActual.moneda)}</strong></td>
      <td class="${mora > 0 ? 'mora-value' : 'mora-zero'}">${mora > 0 ? fmtMoney(mora, prestamoActual.moneda) : '—'}</td>
      <td><strong>${fmtMoney(totalMora, prestamoActual.moneda)}</strong></td>
      <td><span class="badge ${badgeClass}">${estado}</span></td>
      <td>${esPagada ? fmtDate(c.fecha_pago) : '—'}</td>
      <td>${esPagada
        ? '<span style="color:#aaa;font-size:12px">✅ Cobrada</span>'
        : `<button class="btn-pagar" onclick="abrirModalPago(${c.id})">💵 Cobrar</button>`
      }</td>`;
    tbody.appendChild(tr);
  });
}

function filtrarCuotas() {
  if (prestamoActual) renderCuotas(prestamoActual.id);
}

// ── MODAL PAGO ────────────────────────────────────────────────
function abrirModalPago(cuotaId) {
  const cuotas = getCuotas(prestamoActual.id);
  cuotaActual  = cuotas.find(c => c.id === cuotaId);
  if (!cuotaActual) return;

  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('modal-fecha-pago').value = hoy;

  recalcularModal();

  document.getElementById('modal-info').innerHTML = `
    <strong>Cuota N° ${cuotaActual.numero_cuota}</strong><br>
    Beneficiario: ${prestamoActual.beneficiario}<br>
    Vencimiento: ${fmtDate(cuotaActual.fecha_vencimiento)}<br>
    Cuota base: <strong>${fmtMoney(cuotaActual.cuota_total, prestamoActual.moneda)}</strong>
  `;

  document.getElementById('modal-error').style.display = 'none';
  document.getElementById('modal-pago').style.display  = '';

  document.getElementById('modal-fecha-pago').addEventListener('change', recalcularModal);
}

function recalcularModal() {
  if (!cuotaActual) return;
  const fechaPago  = document.getElementById('modal-fecha-pago').value;
  const diasAtraso = diasEntreFechas(cuotaActual.fecha_vencimiento, fechaPago);
  const mora       = calcularMora(cuotaActual.cuota_total, prestamoActual.tasa_mora||1.5, diasAtraso);
  const total      = round2(cuotaActual.cuota_total + mora);

  document.getElementById('modal-mora-display').value  = mora > 0 ? fmtMoney(mora, prestamoActual.moneda) : 'Sin mora';
  document.getElementById('modal-total-display').value = fmtMoney(total, prestamoActual.moneda);
}

function cerrarModal() {
  document.getElementById('modal-pago').style.display = 'none';
  cuotaActual = null;
}

function confirmarPago() {
  const err       = document.getElementById('modal-error');
  const fechaPago = document.getElementById('modal-fecha-pago').value;
  err.style.display = 'none';

  if (!fechaPago) { err.textContent = 'Ingrese la fecha de pago.'; err.style.display='block'; return; }

  const diasAtraso = diasEntreFechas(cuotaActual.fecha_vencimiento, fechaPago);
  const mora       = calcularMora(cuotaActual.cuota_total, prestamoActual.tasa_mora||1.5, diasAtraso);

  // Actualizar cuota
  updateCuota(cuotaActual.id, { pagada: true, fecha_pago: fechaPago, mora });

  // Verificar si todas las cuotas están pagadas → cancelar préstamo
  const todasCuotas = getCuotas(prestamoActual.id);
  if (todasCuotas.every(c => c.pagada || c.id === cuotaActual.id)) {
    updatePrestamo(prestamoActual.id, { estado: 'cancelado' });
    prestamoActual.estado = 'cancelado';
    alert('🎉 ¡Todas las cuotas han sido pagadas! El préstamo ha sido marcado como CANCELADO.');
  }

  cerrarModal();
  actualizarResumen();
  mostrarAlertas();
  renderCuotas(prestamoActual.id);

  // Refrescar info del panel
  cargarCuotas();
  cargarSelectorPrestamos();
}

// ── RESUMEN ───────────────────────────────────────────────────
function actualizarResumen() {
  const hoy   = new Date().toISOString().split('T')[0];
  const [curY, curM] = hoy.split('-');

  const prestamos = getPrestamos(sessionC.id);
  const mon       = sessionC.moneda || 'USD';
  let vencidas=0, semana=0, pagadasMes=0, montoVencido=0, porCobrar=0, cobradoMes=0;

  const enSemana = new Date();
  enSemana.setDate(enSemana.getDate() + 7);
  const hoyPlus7 = enSemana.toISOString().split('T')[0];

  prestamos.forEach(p => {
    getCuotas(p.id).forEach(c => {
      if (!c.pagada) {
        if (c.fecha_vencimiento < hoy)  { vencidas++; montoVencido += c.cuota_total; }
        if (c.fecha_vencimiento >= hoy && c.fecha_vencimiento <= hoyPlus7) semana++;
        porCobrar += c.cuota_total;
      } else {
        if (c.fecha_pago && c.fecha_pago.startsWith(`${curY}-${curM}`)) {
          pagadasMes++;
          cobradoMes += c.cuota_total;
        }
      }
    });
  });

  document.getElementById('cob-vencidas').textContent      = vencidas;
  document.getElementById('cob-semana').textContent        = semana;
  document.getElementById('cob-pagadas').textContent       = pagadasMes;
  document.getElementById('cob-monto-vencido').textContent = fmtMoney(montoVencido, mon);
  document.getElementById('cob-por-cobrar').textContent    = fmtMoney(porCobrar, mon);
  document.getElementById('cob-cobrado-mes').textContent   = fmtMoney(cobradoMes, mon);
}

// ── ALERTAS ───────────────────────────────────────────────────
function mostrarAlertas() {
  const hoy    = new Date().toISOString().split('T')[0];
  const enSemana = new Date();
  enSemana.setDate(enSemana.getDate() + 7);
  const hoyPlus7 = enSemana.toISOString().split('T')[0];

  const alertas = [];
  getPrestamos(sessionC.id).forEach(p => {
    getCuotas(p.id).forEach(c => {
      if (!c.pagada) {
        const dias = diasEntreFechas(c.fecha_vencimiento, hoy);
        if (c.fecha_vencimiento < hoy)
          alertas.push(`<strong>${p.beneficiario}</strong> — Cuota #${c.numero_cuota} vencida hace ${dias} día(s) (${fmtDate(c.fecha_vencimiento)})`);
        else if (c.fecha_vencimiento <= hoyPlus7)
          alertas.push(`<strong>${p.beneficiario}</strong> — Cuota #${c.numero_cuota} vence el ${fmtDate(c.fecha_vencimiento)}`);
      }
    });
  });

  const box = document.getElementById('alertas-box');
  if (alertas.length) {
    document.getElementById('alertas-content').innerHTML = alertas.map(a=>`<div style="margin-bottom:4px">• ${a}</div>`).join('');
    box.style.display = '';
  } else {
    box.style.display = 'none';
  }
}

// ── EXPORTAR CARTERA CSV ──────────────────────────────────────
function exportarCartera() {
  const prestamos = getPrestamos(sessionC.id);
  let csv = 'Beneficiario,Monto,Tasa,Plazo,Sistema,Fecha Inicio,Estado,Cuotas Pagadas,Cuotas Pendientes,Por Cobrar,Moneda\n';

  prestamos.forEach(p => {
    const cuotas   = getCuotas(p.id);
    const pagadas  = cuotas.filter(c=>c.pagada).length;
    const pend     = cuotas.filter(c=>!c.pagada).length;
    const porCobr  = cuotas.filter(c=>!c.pagada).reduce((s,c)=>s+c.cuota_total,0);
    csv += `"${p.beneficiario}","${p.monto}","${p.tasa_anual}%","${p.plazo_meses}m","${p.sistema_amort}","${p.fecha_inicio}","${p.estado}","${pagadas}","${pend}","${porCobr.toFixed(2)}","${p.moneda}"\n`;
  });

  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'cartera_prestamos.csv'; a.click();
  URL.revokeObjectURL(url);
}
