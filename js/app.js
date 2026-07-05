/* ================================================================
   R.I.E. Smart Finance — app.js
   Autenticación, almacenamiento y utilidades globales
   MVP 1.0
   ================================================================ */

const KEY_USERS        = 'rie_users';
const KEY_SESSION      = 'rie_session';
const KEY_MOVIMIENTOS  = 'rie_movimientos';
const KEY_PRESTAMOS    = 'rie_prestamos';
const KEY_CUOTAS       = 'rie_cuotas';

// ── AUTH ─────────────────────────────────────────────────────
function getUsers()         { return JSON.parse(localStorage.getItem(KEY_USERS) || '[]'); }
function saveUsers(u)       { localStorage.setItem(KEY_USERS, JSON.stringify(u)); }
function getSession()       { return JSON.parse(localStorage.getItem(KEY_SESSION) || 'null'); }
function saveSession(u)     { localStorage.setItem(KEY_SESSION, JSON.stringify(u)); }
function clearSession()     { localStorage.removeItem(KEY_SESSION); }
function logout()           { clearSession(); window.location.href = 'index.html'; }

function requireAuth() {
  const s = getSession();
  if (!s) { window.location.href = 'index.html'; return null; }
  const el = document.getElementById('user-display');
  if (el) el.textContent = s.nombres + ' ' + s.apellidos;
  return s;
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
  return 'h' + Math.abs(h).toString(16);
}

function handleRegister(e) {
  e.preventDefault();
  const err = document.getElementById('register-error');
  const ok  = document.getElementById('register-ok');
  err.style.display = 'none'; ok.style.display = 'none';

  const nombres   = document.getElementById('nombres').value.trim();
  const apellidos = document.getElementById('apellidos').value.trim();
  const correo    = document.getElementById('correo').value.trim().toLowerCase();
  const password  = document.getElementById('password').value;
  const password2 = document.getElementById('password2').value;
  const pais      = document.getElementById('pais').value;
  const moneda    = document.getElementById('moneda').value;

  if (password.length < 8) { err.textContent = 'La contraseña debe tener al menos 8 caracteres.'; err.style.display='block'; return; }
  if (password !== password2) { err.textContent = 'Las contraseñas no coinciden.'; err.style.display='block'; return; }

  const users = getUsers();
  if (users.find(u => u.correo === correo)) { err.textContent = 'Ya existe una cuenta con ese correo.'; err.style.display='block'; return; }

  const user = { id: Date.now(), nombres, apellidos, correo, password_hash: simpleHash(password), pais, moneda, idioma: localStorage.getItem('rie_lang')||'es', rol: users.length===0?'admin':'usuario', activo: true, fecha_registro: new Date().toISOString() };
  users.push(user); saveUsers(users);
  ok.textContent = '¡Cuenta creada! Redirigiendo...'; ok.style.display='block';
  setTimeout(() => { window.location.href = 'index.html'; }, 1400);
}

function handleLogin(e) {
  e.preventDefault();
  const err    = document.getElementById('login-error');
  err.style.display = 'none';
  const correo = document.getElementById('correo').value.trim().toLowerCase();
  const pwd    = document.getElementById('password').value;
  const user   = getUsers().find(u => u.correo===correo && u.password_hash===simpleHash(pwd));
  if (!user || !user.activo) { err.textContent = 'Correo o contraseña incorrectos.'; err.style.display='block'; return; }
  saveSession(user);
  window.location.href = 'dashboard.html';
}

// ── MOVIMIENTOS ───────────────────────────────────────────────
function getMovimientos(uid) {
  return JSON.parse(localStorage.getItem(KEY_MOVIMIENTOS)||'[]').filter(m=>m.usuario_id===uid);
}
function saveMovimiento(m) {
  const all = JSON.parse(localStorage.getItem(KEY_MOVIMIENTOS)||'[]');
  all.push(m); localStorage.setItem(KEY_MOVIMIENTOS, JSON.stringify(all));
}
function deleteMovimiento(id) {
  const all = JSON.parse(localStorage.getItem(KEY_MOVIMIENTOS)||'[]').filter(m=>m.id!==id);
  localStorage.setItem(KEY_MOVIMIENTOS, JSON.stringify(all));
}

// ── PRÉSTAMOS ─────────────────────────────────────────────────
function getPrestamos(uid) {
  return JSON.parse(localStorage.getItem(KEY_PRESTAMOS)||'[]').filter(p=>p.usuario_id===uid);
}
function getAllPrestamos() {
  return JSON.parse(localStorage.getItem(KEY_PRESTAMOS)||'[]');
}
function savePrestamo(p) {
  const all = getAllPrestamos(); all.push(p);
  localStorage.setItem(KEY_PRESTAMOS, JSON.stringify(all));
}
function updatePrestamo(id, changes) {
  const all = getAllPrestamos().map(p => p.id===id ? {...p,...changes} : p);
  localStorage.setItem(KEY_PRESTAMOS, JSON.stringify(all));
}
function deletePrestamo(id) {
  const all = getAllPrestamos().filter(p=>p.id!==id);
  localStorage.setItem(KEY_PRESTAMOS, JSON.stringify(all));
  deleteAllCuotas(id);
}

// ── CUOTAS ────────────────────────────────────────────────────
function getCuotas(prestamoId) {
  return JSON.parse(localStorage.getItem(KEY_CUOTAS)||'[]').filter(c=>c.prestamo_id===prestamoId);
}
function getAllCuotas() {
  return JSON.parse(localStorage.getItem(KEY_CUOTAS)||'[]');
}
function saveCuotas(cuotas) {
  const all = getAllCuotas();
  cuotas.forEach(c => all.push(c));
  localStorage.setItem(KEY_CUOTAS, JSON.stringify(all));
}
function updateCuota(id, changes) {
  const all = getAllCuotas().map(c => c.id===id ? {...c,...changes} : c);
  localStorage.setItem(KEY_CUOTAS, JSON.stringify(all));
}
function deleteAllCuotas(prestamoId) {
  const all = getAllCuotas().filter(c=>c.prestamo_id!==prestamoId);
  localStorage.setItem(KEY_CUOTAS, JSON.stringify(all));
}

// ── AMORTIZACIÓN ──────────────────────────────────────────────
/**
 * Genera tabla de amortización sistema francés (cuota fija)
 */
function amortizacionFrances(monto, tasaAnual, plazoMeses, fechaInicio) {
  const tasaMensual = tasaAnual / 100 / 12;
  let cuotaFija;
  if (tasaMensual === 0) {
    cuotaFija = monto / plazoMeses;
  } else {
    cuotaFija = monto * (tasaMensual * Math.pow(1+tasaMensual, plazoMeses)) / (Math.pow(1+tasaMensual, plazoMeses) - 1);
  }

  const tabla = [];
  let saldo = monto;
  let fecha = new Date(fechaInicio);

  for (let i = 1; i <= plazoMeses; i++) {
    fecha.setMonth(fecha.getMonth() + 1);
    const interes  = saldo * tasaMensual;
    const capital  = cuotaFija - interes;
    saldo -= capital;
    tabla.push({
      numero:   i,
      fecha:    fecha.toISOString().split('T')[0],
      capital:  round2(capital),
      interes:  round2(interes),
      cuota:    round2(cuotaFija),
      saldo:    round2(Math.max(saldo, 0))
    });
  }
  return tabla;
}

/**
 * Genera tabla de amortización sistema alemán (capital fijo)
 */
function amortizacionAleman(monto, tasaAnual, plazoMeses, fechaInicio) {
  const tasaMensual = tasaAnual / 100 / 12;
  const capitalFijo = monto / plazoMeses;
  const tabla = [];
  let saldo = monto;
  let fecha = new Date(fechaInicio);

  for (let i = 1; i <= plazoMeses; i++) {
    fecha.setMonth(fecha.getMonth() + 1);
    const interes = saldo * tasaMensual;
    const cuota   = capitalFijo + interes;
    saldo -= capitalFijo;
    tabla.push({
      numero:   i,
      fecha:    fecha.toISOString().split('T')[0],
      capital:  round2(capitalFijo),
      interes:  round2(interes),
      cuota:    round2(cuota),
      saldo:    round2(Math.max(saldo, 0))
    });
  }
  return tabla;
}

function round2(n) { return Math.round(n * 100) / 100; }

// ── MORA ──────────────────────────────────────────────────────
function calcularMora(cuotaTotal, tasaMoraMensual, diasRetraso) {
  if (diasRetraso <= 0) return 0;
  const tasaDiaria = tasaMoraMensual / 100 / 30;
  return round2(cuotaTotal * tasaDiaria * diasRetraso);
}

function diasEntreFechas(fechaDesde, fechaHasta) {
  const d1 = new Date(fechaDesde);
  const d2 = new Date(fechaHasta);
  return Math.max(0, Math.floor((d2 - d1) / (1000*60*60*24)));
}

// ── FORMATO ───────────────────────────────────────────────────
function fmtMoney(val, moneda) {
  const sym = {USD:'$', EUR:'€', GBP:'£', CNY:'¥'}[moneda] || '$';
  return sym + parseFloat(val||0).toFixed(2);
}

function fmtDate(s) {
  if (!s) return '—';
  const [y,m,d] = s.split('-');
  return `${d}/${m}/${y}`;
}

// ── UI HELPERS ────────────────────────────────────────────────
function toggleForm(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display === 'none' ? '' : 'none';
}
