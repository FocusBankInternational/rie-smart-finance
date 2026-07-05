document.addEventListener('DOMContentLoaded', () => {
  const session = requireAuth();
  if (!session) return;
  const movs = getMovimientos(session.id);
  const today = new Date().toISOString().split('T')[0];
  const [curY, curM] = today.split('-');
  let ingHoy=0, gasHoy=0, ingMes=0, gasMes=0;
  movs.forEach(m => {
    const v = parseFloat(m.valor);
    const [y,mo] = m.fecha.split('-');
    if (m.fecha === today) { if(m.tipo==='ingreso') ingHoy+=v; else gasHoy+=v; }
    if (y===curY && mo===curM) { if(m.tipo==='ingreso') ingMes+=v; else gasMes+=v; }
  });
  const mon = session.moneda || 'USD';
  document.getElementById('ingresos-hoy').textContent = fmtMoney(ingHoy, mon);
  document.getElementById('gastos-hoy').textContent   = fmtMoney(gasHoy, mon);
  document.getElementById('saldo-hoy').textContent    = fmtMoney(ingHoy-gasHoy, mon);
  document.getElementById('ingresos-mes').textContent = fmtMoney(ingMes, mon);
  document.getElementById('gastos-mes').textContent   = fmtMoney(gasMes, mon);
  document.getElementById('saldo-mes').textContent    = fmtMoney(ingMes-gasMes, mon);
  const tbody = document.getElementById('movimientos-body');
  const last5 = [...movs].sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.id-a.id).slice(0,5);
  if (!last5.length) return;
  tbody.innerHTML = '';
  last5.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fmtDate(m.fecha)}</td><td>${m.concepto}</td><td><span class="badge badge-${m.tipo}">${m.tipo}</span></td><td><strong>${fmtMoney(m.valor,m.moneda)}</strong></td>`;
    tbody.appendChild(tr);
  });
});
