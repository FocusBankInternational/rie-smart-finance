let sessionR = null;
document.addEventListener('DOMContentLoaded', () => {
  sessionR = requireAuth();
  if (!sessionR) return;
  document.getElementById('filtro-mes').value = new Date().toISOString().substring(0,7);
});
function actualizarFiltros() {
  const tipo = document.getElementById('tipo-reporte').value;
  document.getElementById('filtro-fecha-div').style.display = tipo==='anual'?'none':'';
  document.getElementById('filtro-anio-div').style.display  = tipo==='anual'?'':'none';
  if (tipo==='diario') document.getElementById('filtro-mes').type='date';
  else if (tipo!=='anual') document.getElementById('filtro-mes').type='month';
}
function generarReporte() {
  const tipo = document.getElementById('tipo-reporte').value;
  const movs = getMovimientos(sessionR.id);
  const mon  = sessionR.moneda || 'USD';
  let filtrados=[], titulo='';
  const hoy = new Date().toISOString().split('T')[0];
  if (tipo==='diario') { const f=document.getElementById('filtro-mes').value; filtrados=movs.filter(m=>m.fecha===f); titulo='Reporte Diario — '+fmtDate(f); }
  else if (tipo==='mensual') { const mes=document.getElementById('filtro-mes').value; filtrados=movs.filter(m=>m.fecha.startsWith(mes)); titulo='Reporte Mensual — '+mes; }
  else if (tipo==='anual') { const a=document.getElementById('filtro-anio').value; filtrados=movs.filter(m=>m.fecha.startsWith(a)); titulo='Reporte Anual — '+a; }
  else { filtrados=movs; titulo='Reporte Semanal'; }
  filtrados.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  let ingresos=0, gastos=0;
  filtrados.forEach(m=>{const v=parseFloat(m.valor); if(m.tipo==='ingreso') ingresos+=v; else gastos+=v;});
  document.getElementById('reporte-titulo').textContent = titulo;
  document.getElementById('rep-ingresos').textContent = fmtMoney(ingresos,mon);
  document.getElementById('rep-gastos').textContent   = fmtMoney(gastos,mon);
  document.getElementById('rep-saldo').textContent    = fmtMoney(ingresos-gastos,mon);
  const tbody = document.getElementById('reporte-body');
  tbody.innerHTML = filtrados.length ? filtrados.map(m=>`<tr><td>${fmtDate(m.fecha)}</td><td>${m.concepto}</td><td><span class="badge badge-${m.tipo}">${m.tipo}</span></td><td><strong>${fmtMoney(m.valor,m.moneda)}</strong></td><td>${m.moneda}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-row">Sin movimientos en este período</td></tr>';
  document.getElementById('reporte-resultado').style.display='';
  window._reporteData={titulo,filtrados};
}
function exportarCSV() {
  if (!window._reporteData) return;
  const {titulo,filtrados}=window._reporteData;
  let csv='Fecha,Concepto,Tipo,Valor,Moneda\n';
  filtrados.forEach(m=>csv+=`"${m.fecha}","${m.concepto}","${m.tipo}","${m.valor}","${m.moneda}"\n`);
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=titulo.replace(/\s+/g,'_')+'.csv'; a.click();
}
