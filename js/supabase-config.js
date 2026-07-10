// ================================================================
// R.I.E. Smart Finance — Focus Bank International
// Configuración Supabase
// ================================================================

const SUPABASE_URL = 'https://yiaurkpnaqofloukcyfe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gOxNRHcb0y8FA2Gcon2nNg_4TUbfDXL';

// Cargar Supabase desde CDN
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── AUTENTICACIÓN ─────────────────────────────────────────────
async function registrarUsuario(datos) {
  const { nombres, apellidos, correo, password, pais, moneda, idioma } = datos;

  // 1. Crear cuenta en Supabase Auth
  const { data: authData, error: authError } = await db.auth.signUp({
    email: correo,
    password: password,
    options: {
      data: { nombres, apellidos, pais, moneda, idioma }
    }
  });

  if (authError) throw authError;

  // 2. Insertar en tabla usuarios
  const { error: dbError } = await db
    .from('usuarios')
    .insert([{
      id: authData.user.id,
      nombres, apellidos, correo, pais, moneda, idioma,
      rol: 'usuario'
    }]);

  if (dbError) throw dbError;
  return authData;
}

async function iniciarSesion(correo, password) {
  const { data, error } = await db.auth.signInWithPassword({ email: correo, password });
  if (error) throw error;
  return data;
}

async function cerrarSesion() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

async function obtenerSesion() {
  const { data: { session } } = await db.auth.getSession();
  return session;
}

async function obtenerUsuario() {
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db.from('usuarios').select('*').eq('id', user.id).single();
  return data;
}

// ── MOVIMIENTOS ───────────────────────────────────────────────
async function crearMovimiento(datos) {
  const { data: { user } } = await db.auth.getUser();
  const { data, error } = await db.from('libro_diario').insert([{
    ...datos, usuario_id: user.id
  }]).select();
  if (error) throw error;
  return data;
}

async function obtenerMovimientos() {
  const { data: { user } } = await db.auth.getUser();
  const { data, error } = await db
    .from('libro_diario')
    .select('*')
    .eq('usuario_id', user.id)
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
  const { data: { user } } = await db.auth.getUser();

  const { data: prestamo, error: pError } = await db
    .from('prestamos')
    .insert([{ ...datos, usuario_id: user.id }])
    .select()
    .single();

  if (pError) throw pError;

  const cuotasConId = cuotas.map(c => ({ ...c, prestamo_id: prestamo.id }));
  const { error: cError } = await db.from('cuotas').insert(cuotasConId);
  if (cError) throw cError;

  return prestamo;
}

async function obtenerPrestamos() {
  const { data: { user } } = await db.auth.getUser();
  const { data, error } = await db
    .from('prestamos')
    .select('*')
    .eq('usuario_id', user.id)
    .order('fecha_creacion', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function obtenerCuotas(prestamoId) {
  const { data, error } = await db
    .from('cuotas')
    .select('*')
    .eq('prestamo_id', prestamoId)
    .order('numero_cuota', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function pagarCuota(id, fechaPago, mora) {
  const { error } = await db
    .from('cuotas')
    .update({ pagada: true, fecha_pago: fechaPago, mora })
    .eq('id', id);
  if (error) throw error;
}

async function actualizarEstadoPrestamo(id, estado) {
  const { error } = await db
    .from('prestamos')
    .update({ estado })
    .eq('id', id);
  if (error) throw error;
}

// ── RECUPERAR CONTRASEÑA ──────────────────────────────────────
async function recuperarPassword(correo) {
  const { error } = await db.auth.resetPasswordForEmail(correo, {
    redirectTo: 'https://focusbankinternational.github.io/rie-smart-finance/reset-password.html'
  });
  if (error) throw error;
}

// ── UTILIDADES ────────────────────────────────────────────────
function fmtMoney(val, moneda) {
  const sym = {USD:'$', EUR:'€', GBP:'£', CNY:'¥'}[moneda] || '$';
  return sym + parseFloat(val||0).toFixed(2);
}

function fmtDate(s) {
  if (!s) return '—';
  const [y,m,d] = s.split('-');
  return `${d}/${m}/${y}`;
}

function round2(n) { return Math.round(n * 100) / 100; }

function calcularMora(cuotaTotal, tasaMoraMensual, diasRetraso) {
  if (diasRetraso <= 0) return 0;
  return round2(cuotaTotal * (tasaMoraMensual / 100 / 30) * diasRetraso);
}

function diasEntreFechas(desde, hasta) {
  return Math.max(0, Math.floor((new Date(hasta) - new Date(desde)) / 86400000));
}

function amortizacionFrances(monto, tasaAnual, plazo, fechaInicio) {
  const tm = tasaAnual / 100 / 12;
  const cuota = tm === 0 ? monto/plazo : monto*(tm*Math.pow(1+tm,plazo))/(Math.pow(1+tm,plazo)-1);
  const tabla = [];
  let saldo = monto;
  let fecha = new Date(fechaInicio);
  for (let i = 1; i <= plazo; i++) {
    fecha = new Date(fecha);
    fecha.setMonth(fecha.getMonth() + 1);
    const interes = round2(saldo * tm);
    const capital = round2(cuota - interes);
    saldo = round2(Math.max(saldo - capital, 0));
    tabla.push({ numero_cuota: i, fecha_vencimiento: fecha.toISOString().split('T')[0], capital, interes, cuota_total: round2(cuota), saldo_restante: saldo });
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
    const cuota = round2(capitalFijo + interes);
    saldo = round2(Math.max(saldo - capitalFijo, 0));
    tabla.push({ numero_cuota: i, fecha_vencimiento: fecha.toISOString().split('T')[0], capital: capitalFijo, interes, cuota_total: cuota, saldo_restante: saldo });
  }
  return tabla;
}
