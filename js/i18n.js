// ================================================================
// R.I.E. Smart Finance — i18n.js CORREGIDO
// El idioma se aplica ANTES de que la página termine de cargar
// ================================================================

const TRANSLATIONS = {
  es: {
    email: "Correo electrónico", password: "Contraseña",
    login_btn: "Iniciar Sesión", forgot_password: "¿Olvidaste tu contraseña?",
    send_recovery: "Enviar correo de recuperación",
    no_account: "¿No tienes cuenta?", register_link: "Regístrate aquí",
    have_account: "¿Ya tienes cuenta?", login_link: "Inicia sesión",
    nombres: "Nombres", apellidos: "Apellidos",
    confirm_password: "Confirmar Contraseña",
    pais: "País", moneda: "Moneda preferida", register_btn: "Crear Cuenta",
    nav_dashboard: "Dashboard", nav_diario: "Libro Diario",
    nav_prestamos: "Préstamos", nav_cobros: "Cobros",
    nav_reportes: "Reportes", logout: "Cerrar Sesión",
    ingresos_hoy: "Ingresos Hoy", gastos_hoy: "Gastos Hoy",
    saldo_hoy: "Saldo Hoy", ingresos_mes: "Ingresos del Mes",
    gastos_mes: "Gastos del Mes", saldo_mes: "Saldo del Mes",
    ultimos_movimientos: "Últimos Movimientos", ver_todos: "Ver todos",
    col_fecha: "Fecha", col_concepto: "Concepto",
    col_tipo: "Tipo", col_valor: "Valor",
    sin_movimientos: "Sin movimientos registrados",
    nuevo_movimiento: "Nuevo Movimiento",
    ingreso: "Ingreso", gasto: "Gasto",
    observaciones: "Observaciones", guardar: "Guardar Movimiento",
    historial: "Historial de Movimientos", acciones: "Acciones",
    generar_reporte: "Generar Reporte", tipo_reporte: "Tipo de Reporte",
    generar: "Generar", exportar_csv: "Exportar CSV",
    nuevo_prestamo: "Nuevo Préstamo", beneficiario: "Beneficiario",
    monto: "Monto", tasa: "Tasa Anual (%)", plazo: "Plazo (meses)",
    sistema_amort: "Sistema de Amortización",
    vista_previa: "Vista Previa", registrar_prestamo: "Registrar Préstamo",
    mis_prestamos: "Mis Préstamos", ver_cuotas: "Ver Cuotas",
    mostrar_ocultar: "Mostrar / Ocultar",
  },
  en: {
    email: "Email address", password: "Password",
    login_btn: "Sign In", forgot_password: "Forgot your password?",
    send_recovery: "Send recovery email",
    no_account: "Don't have an account?", register_link: "Sign up here",
    have_account: "Already have an account?", login_link: "Sign in",
    nombres: "First Name", apellidos: "Last Name",
    confirm_password: "Confirm Password",
    pais: "Country", moneda: "Preferred Currency", register_btn: "Create Account",
    nav_dashboard: "Dashboard", nav_diario: "Daily Journal",
    nav_prestamos: "Loans", nav_cobros: "Collections",
    nav_reportes: "Reports", logout: "Sign Out",
    ingresos_hoy: "Income Today", gastos_hoy: "Expenses Today",
    saldo_hoy: "Balance Today", ingresos_mes: "Monthly Income",
    gastos_mes: "Monthly Expenses", saldo_mes: "Monthly Balance",
    ultimos_movimientos: "Recent Transactions", ver_todos: "View all",
    col_fecha: "Date", col_concepto: "Description",
    col_tipo: "Type", col_valor: "Amount",
    sin_movimientos: "No transactions recorded",
    nuevo_movimiento: "New Transaction",
    ingreso: "Income", gasto: "Expense",
    observaciones: "Notes", guardar: "Save Transaction",
    historial: "Transaction History", acciones: "Actions",
    generar_reporte: "Generate Report", tipo_reporte: "Report Type",
    generar: "Generate", exportar_csv: "Export CSV",
    nuevo_prestamo: "New Loan", beneficiario: "Borrower",
    monto: "Amount", tasa: "Annual Rate (%)", plazo: "Term (months)",
    sistema_amort: "Amortization System",
    vista_previa: "Preview", registrar_prestamo: "Register Loan",
    mis_prestamos: "My Loans", ver_cuotas: "View Installments",
    mostrar_ocultar: "Show / Hide",
  },
  zh: {
    email: "电子邮件", password: "密码",
    login_btn: "登录", forgot_password: "忘记密码？",
    send_recovery: "发送恢复邮件",
    no_account: "没有账户？", register_link: "在此注册",
    have_account: "已有账户？", login_link: "登录",
    nombres: "名字", apellidos: "姓氏",
    confirm_password: "确认密码",
    pais: "国家", moneda: "首选货币", register_btn: "创建账户",
    nav_dashboard: "仪表板", nav_diario: "日记账",
    nav_prestamos: "贷款", nav_cobros: "收款",
    nav_reportes: "报告", logout: "退出登录",
    ingresos_hoy: "今日收入", gastos_hoy: "今日支出",
    saldo_hoy: "今日余额", ingresos_mes: "本月收入",
    gastos_mes: "本月支出", saldo_mes: "本月余额",
    ultimos_movimientos: "最近交易", ver_todos: "查看全部",
    col_fecha: "日期", col_concepto: "说明",
    col_tipo: "类型", col_valor: "金额",
    sin_movimientos: "暂无交易记录",
    nuevo_movimiento: "新建交易",
    ingreso: "收入", gasto: "支出",
    observaciones: "备注", guardar: "保存交易",
    historial: "交易历史", acciones: "操作",
    generar_reporte: "生成报告", tipo_reporte: "报告类型",
    generar: "生成", exportar_csv: "导出 CSV",
    nuevo_prestamo: "新建贷款", beneficiario: "借款人",
    monto: "金额", tasa: "年利率 (%)", plazo: "期限（月）",
    sistema_amort: "还款方式",
    vista_previa: "预览", registrar_prestamo: "登记贷款",
    mis_prestamos: "我的贷款", ver_cuotas: "查看分期",
    mostrar_ocultar: "显示 / 隐藏",
  }
};

// Leer idioma guardado o usar español por defecto
var currentLang = localStorage.getItem('rie_lang') || 'es';

function t(key) {
  var lang = TRANSLATIONS[currentLang] || TRANSLATIONS['es'];
  return lang[key] || TRANSLATIONS['es'][key] || key;
}

function applyTranslations() {
  // Traducir todos los elementos con data-i18n
  var elements = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < elements.length; i++) {
    var key = elements[i].getAttribute('data-i18n');
    elements[i].textContent = t(key);
  }
  // Actualizar botones de idioma
  var btns = document.querySelectorAll('.lang-btn');
  for (var j = 0; j < btns.length; j++) {
    var txt = btns[j].textContent.trim();
    var isActive = (currentLang === 'zh' && txt.indexOf('中') >= 0) ||
                   (currentLang === 'en' && txt === 'EN') ||
                   (currentLang === 'es' && txt === 'ES');
    if (isActive) {
      btns[j].classList.add('active');
    } else {
      btns[j].classList.remove('active');
    }
  }
  // Actualizar atributo lang del HTML
  document.documentElement.lang = currentLang;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('rie_lang', lang);
  applyTranslations();
}

// Aplicar traducciones inmediatamente cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyTranslations);
} else {
  applyTranslations();
}
