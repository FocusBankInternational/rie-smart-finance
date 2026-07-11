// ================================================================
// R.I.E. Smart Finance — i18n.js
// Traducciones: Español, English, 中文
// ================================================================

const TRANSLATIONS = {
  es: {
    email: "Correo electrónico", password: "Contraseña", login_btn: "Iniciar Sesión",
    no_account: "¿No tienes cuenta?", register_link: "Regístrate aquí",
    have_account: "¿Ya tienes cuenta?", login_link: "Inicia sesión",
    nombres: "Nombres", apellidos: "Apellidos", confirm_password: "Confirmar Contraseña",
    pais: "País", moneda: "Moneda preferida", register_btn: "Crear Cuenta",
    forgot_password: "¿Olvidaste tu contraseña?", send_recovery: "Enviar correo de recuperación",
    nav_dashboard: "Dashboard", nav_diario: "Libro Diario", nav_prestamos: "Préstamos",
    nav_cobros: "Cobros", nav_reportes: "Reportes", logout: "Cerrar Sesión",
    ingresos_hoy: "Ingresos Hoy", gastos_hoy: "Gastos Hoy", saldo_hoy: "Saldo Hoy",
    ingresos_mes: "Ingresos del Mes", gastos_mes: "Gastos del Mes", saldo_mes: "Saldo del Mes",
    ultimos_movimientos: "Últimos Movimientos", ver_todos: "Ver todos",
    col_fecha: "Fecha", col_concepto: "Concepto", col_tipo: "Tipo", col_valor: "Valor",
    sin_movimientos: "Sin movimientos registrados", nuevo_movimiento: "Nuevo Movimiento",
    ingreso: "Ingreso", gasto: "Gasto", observaciones: "Observaciones",
    guardar: "Guardar Movimiento", historial: "Historial de Movimientos", acciones: "Acciones",
    generar_reporte: "Generar Reporte", tipo_reporte: "Tipo de Reporte",
    generar: "Generar", exportar_csv: "Exportar CSV",
    nuevo_prestamo: "Nuevo Préstamo", beneficiario: "Beneficiario (Deudor)",
    monto: "Monto del Préstamo", tasa: "Tasa de Interés Anual (%)",
    plazo: "Plazo (meses)", sistema_amort: "Sistema de Amortización",
    vista_previa: "Vista Previa", registrar_prestamo: "Registrar Préstamo",
    mis_prestamos: "Mis Préstamos", ver_cuotas: "Ver Cuotas",
    tabla_cuotas: "Tabla de Cuotas", registrar_pago: "Registrar Pago",
    cuota_num: "Cuota #", vencimiento: "Vencimiento", capital: "Capital",
    interes: "Interés", cuota_total: "Cuota Total", mora: "Mora", estado: "Estado",
    pendiente: "PENDIENTE", pagada: "PAGADA", vencida: "VENCIDA",
    activo: "ACTIVO", cancelado: "CANCELADO", en_mora: "EN MORA",
  },
  en: {
    email: "Email address", password: "Password", login_btn: "Sign In",
    no_account: "Don't have an account?", register_link: "Sign up here",
    have_account: "Already have an account?", login_link: "Sign in",
    nombres: "First Name", apellidos: "Last Name", confirm_password: "Confirm Password",
    pais: "Country", moneda: "Preferred Currency", register_btn: "Create Account",
    forgot_password: "Forgot your password?", send_recovery: "Send recovery email",
    nav_dashboard: "Dashboard", nav_diario: "Daily Journal", nav_prestamos: "Loans",
    nav_cobros: "Collections", nav_reportes: "Reports", logout: "Sign Out",
    ingresos_hoy: "Income Today", gastos_hoy: "Expenses Today", saldo_hoy: "Balance Today",
    ingresos_mes: "Monthly Income", gastos_mes: "Monthly Expenses", saldo_mes: "Monthly Balance",
    ultimos_movimientos: "Recent Transactions", ver_todos: "View all",
    col_fecha: "Date", col_concepto: "Description", col_tipo: "Type", col_valor: "Amount",
    sin_movimientos: "No transactions recorded", nuevo_movimiento: "New Transaction",
    ingreso: "Income", gasto: "Expense", observaciones: "Notes",
    guardar: "Save Transaction", historial: "Transaction History", acciones: "Actions",
    generar_reporte: "Generate Report", tipo_reporte: "Report Type",
    generar: "Generate", exportar_csv: "Export CSV",
    nuevo_prestamo: "New Loan", beneficiario: "Borrower",
    monto: "Loan Amount", tasa: "Annual Interest Rate (%)",
    plazo: "Term (months)", sistema_amort: "Amortization System",
    vista_previa: "Preview", registrar_prestamo: "Register Loan",
    mis_prestamos: "My Loans", ver_cuotas: "View Installments",
    tabla_cuotas: "Installment Table", registrar_pago: "Register Payment",
    cuota_num: "Installment #", vencimiento: "Due Date", capital: "Principal",
    interes: "Interest", cuota_total: "Total Payment", mora: "Late Fee", estado: "Status",
    pendiente: "PENDING", pagada: "PAID", vencida: "OVERDUE",
    activo: "ACTIVE", cancelado: "CANCELLED", en_mora: "OVERDUE",
  },
  zh: {
    email: "电子邮件", password: "密码", login_btn: "登录",
    no_account: "没有账户？", register_link: "在此注册",
    have_account: "已有账户？", login_link: "登录",
    nombres: "名字", apellidos: "姓氏", confirm_password: "确认密码",
    pais: "国家", moneda: "首选货币", register_btn: "创建账户",
    forgot_password: "忘记密码？", send_recovery: "发送恢复邮件",
    nav_dashboard: "仪表板", nav_diario: "日记账", nav_prestamos: "贷款",
    nav_cobros: "收款", nav_reportes: "报告", logout: "退出登录",
    ingresos_hoy: "今日收入", gastos_hoy: "今日支出", saldo_hoy: "今日余额",
    ingresos_mes: "本月收入", gastos_mes: "本月支出", saldo_mes: "本月余额",
    ultimos_movimientos: "最近交易", ver_todos: "查看全部",
    col_fecha: "日期", col_concepto: "说明", col_tipo: "类型", col_valor: "金额",
    sin_movimientos: "暂无交易记录", nuevo_movimiento: "新建交易",
    ingreso: "收入", gasto: "支出", observaciones: "备注",
    guardar: "保存交易", historial: "交易历史", acciones: "操作",
    generar_reporte: "生成报告", tipo_reporte: "报告类型",
    generar: "生成", exportar_csv: "导出 CSV",
    nuevo_prestamo: "新建贷款", beneficiario: "借款人",
    monto: "贷款金额", tasa: "年利率 (%)",
    plazo: "期限（月）", sistema_amort: "还款方式",
    vista_previa: "预览", registrar_prestamo: "登记贷款",
    mis_prestamos: "我的贷款", ver_cuotas: "查看分期",
    tabla_cuotas: "分期表", registrar_pago: "登记还款",
    cuota_num: "分期 #", vencimiento: "到期日", capital: "本金",
    interes: "利息", cuota_total: "总还款", mora: "滞纳金", estado: "状态",
    pendiente: "待还款", pagada: "已还款", vencida: "已逾期",
    activo: "进行中", cancelado: "已结清", en_mora: "逾期",
  }
};

let currentLang = localStorage.getItem('rie_lang') || 'es';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('rie_lang', lang);
  applyTranslations();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const txt = btn.textContent.trim();
    btn.classList.toggle('active',
      (lang === 'zh' && txt.includes('中')) ||
      (lang === 'en' && txt === 'EN') ||
      (lang === 'es' && txt === 'ES')
    );
  });
}

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS['es'][key] || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const txt = btn.textContent.trim();
    btn.classList.toggle('active',
      (currentLang === 'zh' && txt.includes('中')) ||
      (currentLang === 'en' && txt === 'EN') ||
      (currentLang === 'es' && txt === 'ES')
    );
  });
});
