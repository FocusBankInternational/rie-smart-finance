/* R.I.E. Smart Finance — i18n.js */
let currentLang = localStorage.getItem('rie_lang') || 'es';
function setLang(l) { currentLang=l; localStorage.setItem('rie_lang',l); applyTranslations(); document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',(l==='zh'&&b.textContent.includes('中'))||(l!=='zh'&&b.textContent.trim().toLowerCase()===l))); }
function t(k) { return (TRANSLATIONS[currentLang]&&TRANSLATIONS[currentLang][k])||k; }
function applyTranslations() { document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.getAttribute('data-i18n'))); }
document.addEventListener('DOMContentLoaded',applyTranslations);
const TRANSLATIONS={es:{},en:{},zh:{}};
