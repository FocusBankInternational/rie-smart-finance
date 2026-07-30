// ================================================================
// R.I.E. Smart Finance — supabase-config.js
// Versión corregida — manejo de sesión nula
// ================================================================

const SUPABASE_URL = 'https://yiaurkpnaqofloukcyfe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gOxNRHcb0y8FA2Gcon2nNg_4TUbfDXL';

const { createClient } = supabase;

const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession:      true,
    autoRefreshToken:    true,
    detectSessionInUrl:  true,
    storage:             localStorage
  }
});

// ── SESIÓN ────────────────────────────────────────────────────
async function obtenerSesion() {
  try {
    const { data } = await db.auth.getSession();
    return data.session || null;
  } catch(e) { return null; }
}

async function obtenerUsuarioAuth() {
  try {
    const { data: { user } } = await db.auth.getUser();
    return user || null;
  } catch(e) { return null; }
}

async function obtenerUsuario() {
  const user = await obtenerUsuarioAuth();
  if (!user) return null;
  try {
    const { data } = await db.from('usuarios').select('*').eq('id', user.id).single();
    if (data) return data;
  } catch(e) {}
  // Fallback con datos del auth
  return {
    id:       user.id,
    nombres:  user.user_metadata?.nombres || user.email.split('@')[0],
    apellidos: user.user_metadata?.apellidos || '',
    moneda:   'USD',
    idioma:   'es',
    rol:      'usuario'
  };
}

async function cerrarSesion() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

async function requireAuth() {
  const session = await obtenerSesion();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  const usuario = await obtenerUsuario();
  if (!usuario) {
    window.location.href = 'index.html';
    return null;
  }
  const el = document.getElementById('user-display');
  if (el) el.textContent = (usuario.nombres||'') + ' ' + (usuario.apellidos||'');
  return usuario;
}

// ── AUTH ──────────────────────────────────────────────────────
async function iniciarSesion(correo, password) {
  const { data, error } = await db.auth.signInWithPassword({ email: correo, password });
  if (error) throw error;
  return data;
}

async function registrarUsuario(datos) {
  const { nombres, apellidos, correo, password, pais, moneda, idioma } = datos;
  const { data: authData, error } = await db.auth.signUp({
    email: correo, password,
    options: { data: { nombres, apellidos } }
  });
  if (error) throw error;
  if (authData.user) {
    await db.from('usuarios').insert([{
      id: authData.user.id,
      nombres, apellidos, correo,
      pais: pais || 'EC',
      moneda: moneda || 'USD',
      idioma: idioma || 'es',
      rol: 'usuario'
    }]).catch(e => console.warn('Usuario ya existe:', e.message));
  }
  return authData;
}

async function recuperarPassword(correo) {
  const { error } = await db.auth.resetPasswordForEmail(correo, {
    redirectTo: 'https://focusbankinternational.github.io/rie-smart-finance/dashboard.html'
  });
  if (error) throw error;
}

// ── MOVIMIENTOS ───────────────────────────────────────────────
async function crearMovimiento(datos) {
  const user = await obtenerUsuarioAuth();
  if (!user) throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
  const { data, error } = await db.from('libro_diario')
    .insert([{ ...datos, usuario_id: user.id }]).select();
  if (error) throw error;
  return data;
}

async function obtenerMovimientos() {
  const user = await obtenerUsuarioAuth();
  if (!user) return [];
  const { data, error } = await db.from('libro_diario')
    .select('*').eq('usuario_id', user.id)
    .order('fecha', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function eliminarMovimiento(id) {
  const { error } = await db.from('libro_diario').delete().eq('id', id);
  if (error) throw error;
}

// ── PRÉSTAMOS ─────────────────────────────────────────────────
async function crearPrestamo(datos, cuotas) {
  const user = await obtenerUsuarioAuth();
  if (!user) throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');

  const { data: prestamo, error } = await db.from('prestamos')
    .insert([{ ...datos, usuario_id: user.id }])
    .select().single();
  if (error) throw error;
  if (!prestamo) throw new Error('No se pudo crear el préstamo.');

  const cuotasConId = cuotas.map(c => ({ ...c, prestamo_id: prestamo.id }));
  const { error: cError } = await db.from('cuotas').insert(cuotasConId);
  if (cError) throw cError;

  return prestamo;
}

async function obtenerPrestamos() {
  const user = await obtenerUsuarioAuth();
  if (!user) return [];
  const { data, error } = await db.from('prestamos')
    .select('*').eq('usuario_id', user.id)
    .order('fecha_creacion', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function obtenerCuotas(prestamoId) {
  const { data, error } = await db.from('cuotas')
    .select('*').eq('prestamo_id', prestamoId)
    .order('numero_cuota', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function pagarCuota(id, fechaPago, mora) {
  const { error } = await db.from('cuotas')
    .update({ pagada: true, fecha_pago: fechaPago, mora }).eq('id', id);
  if (error) throw error;
}

async function actualizarEstadoPrestamo(id, estado) {
  const { error } = await db.from('prestamos').update({ estado }).eq('id', id);
  if (error) throw error;
}

async function eliminarPrestamo(id) {
  await db.from('cuotas').delete().eq('prestamo_id', id);
  const { error } = await db.from('prestamos').delete().eq('id', id);
  if (error) throw error;
}

// ── CÁLCULOS ──────────────────────────────────────────────────
function round2(n) { return Math.round(n * 100) / 100; }

function amortizacionFrances(monto, tasaAnual, plazo, fechaInicio) {
  const tm = tasaAnual / 100 / 12;
  const cuota = tm === 0
    ? monto / plazo
    : monto * (tm * Math.pow(1+tm, plazo)) / (Math.pow(1+tm, plazo) - 1);
  const tabla = [];
  let saldo = monto;
  let fecha = new Date(fechaInicio);
  for (let i = 1; i <= plazo; i++) {
    fecha = new Date(fecha);
    fecha.setMonth(fecha.getMonth() + 1);
    const interes = round2(saldo * tm);
    const capital = round2(cuota - interes);
    saldo = round2(Math.max(saldo - capital, 0));
    tabla.push({
      numero_cuota:      i,
      fecha_vencimiento: fecha.toISOString().split('T')[0],
      capital, interes,
      cuota_total:       round2(cuota),
      saldo_restante:    saldo
    });
  }
  return tabla;
}

function amortizacionAleman(monto, tasaAnual, plazo, fechaInicio) {
  const tm = tasaAnual / 100 / 12;
  const capitalFijo = round2(monto / plazo);
  const tabla = [];
  let saldo = monto;
  let fecha = new Date(fechaInicio);
  for (let i = 1; i <= plazo; i++) {
    fecha = new Date(fecha);
    fecha.setMonth(fecha.getMonth() + 1);
    const interes = round2(saldo * tm);
    saldo = round2(Math.max(saldo - capitalFijo, 0));
    tabla.push({
      numero_cuota:      i,
      fecha_vencimiento: fecha.toISOString().split('T')[0],
      capital:           capitalFijo,
      interes,
      cuota_total:       round2(capitalFijo + interes),
      saldo_restante:    saldo
    });
  }
  return tabla;
}

function calcularMora(cuotaTotal, tasaMoraMensual, diasRetraso) {
  if (diasRetraso <= 0) return 0;
  return round2(cuotaTotal * (tasaMoraMensual / 100 / 30) * diasRetraso);
}

function diasEntreFechas(desde, hasta) {
  return Math.max(0, Math.floor((new Date(hasta) - new Date(desde)) / 86400000));
}

// ── FORMATO ───────────────────────────────────────────────────
function fmtMoney(val, moneda) {
  const sym = { USD:'$', EUR:'€', GBP:'£', CNY:'¥' }[moneda] || '$';
  return sym + parseFloat(val || 0).toFixed(2);
}

function fmtDate(s) {
  if (!s) return '—';
  const parts = s.split('T')[0].split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function toggleForm(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
}
