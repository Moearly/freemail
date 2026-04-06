/* ============================================
   FreeMail — Commercial-grade Landing Page JS
   ============================================ */

// ── i18n translations ──
const i18n = {
  en: {
    'nav.features': 'Features',
    'nav.howItWorks': 'How It Works',
    'nav.faq': 'FAQ',
    'nav.admin': 'Admin Login',
    'hero.badge': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Secure & Private Temporary Email',
    'hero.title': 'Your Privacy,<br>Our Priority',
    'hero.subtitle': 'Generate secure, disposable email addresses instantly. No registration required. Auto-extract verification codes with one click.',
    'generator.placeholder': 'Click "Generate" to create an email',
    'generator.expires': 'Expires in',
    'generator.10min': '10 Minutes',
    'generator.30min': '30 Minutes',
    'generator.1hour': '1 Hour',
    'generator.generate': 'Generate Email',
    'generator.randomName': 'Random Name',
    'inbox.title': 'Inbox',
    'inbox.waiting': 'Waiting for incoming emails...',
    'inbox.autoRefresh': 'Auto-refresh every 5 seconds',
    'inbox.emails': '{n} email(s)',
    'features.badge': 'WHY FREEMAIL',
    'features.title': 'Why Choose FreeMail?',
    'features.desc': 'Everything you need for secure, private temporary email — completely free.',
    'features.f1.title': 'No Sign-up Required',
    'features.f1.desc': 'Use temporary addresses with no account required. Works instantly — no personal data needed.',
    'features.f2.title': 'Auto-Extract Codes',
    'features.f2.desc': 'Automatically detect and highlight verification codes from emails. One-click copy to clipboard.',
    'features.f3.title': 'Completely Free',
    'features.f3.desc': 'No hidden fees, no limitations. Use as many addresses as you need, forever free.',
    'features.f4.title': 'Privacy First',
    'features.f4.desc': 'No personal data stored. All emails are automatically deleted after expiration.',
    'features.f5.title': 'Self-Destructing',
    'features.f5.desc': 'Your email address and all messages expire automatically. No trace left behind.',
    'features.f6.title': 'Multiple Domains',
    'features.f6.desc': 'Choose from multiple email domains for different use cases and better compatibility.',
    'howItWorks.badge': 'GETTING STARTED',
    'howItWorks.title': 'How It Works',
    'howItWorks.desc': "Get a disposable email in seconds — it's as easy as 1-2-3.",
    'howItWorks.s1.title': 'Generate an Email',
    'howItWorks.s1.desc': 'Click "Generate" and get a temporary email address instantly. No registration needed.',
    'howItWorks.s2.title': 'Use It Anywhere',
    'howItWorks.s2.desc': 'Copy the address and use it for sign-ups, verifications, or any one-off communication.',
    'howItWorks.s3.title': 'Receive & Read',
    'howItWorks.s3.desc': 'Emails appear in your inbox in real-time. Verification codes are auto-extracted for you.',
    'faq.badge': 'FAQ',
    'faq.title': 'Frequently Asked Questions',
    'faq.q1.q': 'What is a temporary email address?',
    'faq.q1.a': 'A temporary email address is a disposable email account that allows you to receive emails without revealing your personal email. Perfect for sign-ups, verifications, and avoiding spam.',
    'faq.q2.q': 'How long does a temporary email last?',
    'faq.q2.a': 'You can choose from 10 minutes, 30 minutes, or 1 hour. After expiration, the address and all messages are automatically deleted.',
    'faq.q3.q': 'Is this service completely free?',
    'faq.q3.a': 'Yes! FreeMail is 100% free to use. No registration required, no hidden fees, and no limitations on the number of emails you can receive.',
    'faq.q4.q': 'Can verification codes be auto-extracted?',
    'faq.q4.a': 'Yes! FreeMail automatically detects verification codes, OTP codes, and activation codes from incoming emails and highlights them for one-click copying.',
    'faq.q5.q': 'Is my data secure?',
    'faq.q5.a': "Absolutely. We don't store personal information. All emails are automatically deleted after expiration. Our service runs on Cloudflare's global edge network for maximum security and speed.",
    'faq.q6.q': 'Can I reply to emails?',
    'faq.q6.a': 'Currently, FreeMail is designed for receiving emails only. This helps prevent spam and maintain anonymity.',
    'footer.tagline': 'Secure, private, and always free.',
    'footer.rights': 'All rights reserved.',
    'footer.powered': 'Powered by Cloudflare Workers',
    'toast.generated': 'Email generated!',
    'toast.copied': 'Copied: {v}',
    'toast.codeCopied': 'Copied code: {v}',
    'toast.copyFailed': 'Copy failed',
    'toast.genFailed': 'Failed to generate email',
    'toast.loadFailed': 'Failed to load email',
    'toast.allCopied': 'Content copied!',
    'countdown.expired': 'Expired — Generate a new one',
    'countdown.expires': 'Expires in {t}',
    'modal.copyCode': 'Copy Code: {v}',
    'modal.copyAll': 'Copy All Text',
    'modal.noContent': 'No content',
    'modal.from': 'From: {v}',
    'modal.to': 'To: {v}',
    'modal.time': 'Time: {v}',
  },
  zh: {
    'nav.features': '功能特性',
    'nav.howItWorks': '使用方法',
    'nav.faq': '常见问题',
    'nav.admin': '管理后台',
    'hero.badge': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 安全私密的临时邮箱',
    'hero.title': '你的隐私，<br>我们守护',
    'hero.subtitle': '即时生成安全的一次性邮箱地址，无需注册。一键自动提取验证码。',
    'generator.placeholder': '点击「生成邮箱」创建一个临时邮箱',
    'generator.expires': '有效期',
    'generator.10min': '10 分钟',
    'generator.30min': '30 分钟',
    'generator.1hour': '1 小时',
    'generator.generate': '生成邮箱',
    'generator.randomName': '随机名字',
    'inbox.title': '收件箱',
    'inbox.waiting': '等待接收邮件...',
    'inbox.autoRefresh': '每 5 秒自动刷新',
    'inbox.emails': '{n} 封邮件',
    'features.badge': '为什么选择 FREEMAIL',
    'features.title': '为什么选择 FreeMail？',
    'features.desc': '安全、私密的临时邮箱所需的一切 —— 完全免费。',
    'features.f1.title': '无需注册',
    'features.f1.desc': '无需任何账号即可使用临时邮箱地址，即开即用，无需提供个人信息。',
    'features.f2.title': '自动提取验证码',
    'features.f2.desc': '自动检测并高亮邮件中的验证码，一键复制到剪贴板。',
    'features.f3.title': '完全免费',
    'features.f3.desc': '没有隐藏费用，没有使用限制。想用多少邮箱地址就用多少，永远免费。',
    'features.f4.title': '隐私至上',
    'features.f4.desc': '不存储任何个人数据。所有邮件在过期后自动删除。',
    'features.f5.title': '阅后即焚',
    'features.f5.desc': '邮箱地址和所有消息到期后自动销毁，不留任何痕迹。',
    'features.f6.title': '多域名选择',
    'features.f6.desc': '提供多个邮箱域名供选择，适用于不同场景，兼容性更强。',
    'howItWorks.badge': '快速上手',
    'howItWorks.title': '三步使用',
    'howItWorks.desc': '几秒钟即可获得一次性邮箱 —— 简单如 1-2-3。',
    'howItWorks.s1.title': '生成邮箱',
    'howItWorks.s1.desc': '点击「生成邮箱」即可立即获得临时邮箱地址，无需注册。',
    'howItWorks.s2.title': '随处使用',
    'howItWorks.s2.desc': '复制邮箱地址，用于网站注册、验证码接收或任何一次性通信。',
    'howItWorks.s3.title': '接收阅读',
    'howItWorks.s3.desc': '邮件实时显示在收件箱中，验证码自动提取，一键复制。',
    'faq.badge': '常见问题',
    'faq.title': '常见问题解答',
    'faq.q1.q': '什么是临时邮箱？',
    'faq.q1.a': '临时邮箱是一种一次性邮箱账号，允许你在不暴露真实邮箱的情况下接收邮件。非常适合用于网站注册、验证和避免垃圾邮件。',
    'faq.q2.q': '临时邮箱能用多久？',
    'faq.q2.a': '你可以选择 10 分钟、30 分钟或 1 小时的有效期。过期后，邮箱地址和所有消息将自动删除。',
    'faq.q3.q': '这项服务完全免费吗？',
    'faq.q3.a': '是的！FreeMail 100% 免费使用。无需注册，没有隐藏费用，接收邮件数量也没有限制。',
    'faq.q4.q': '可以自动提取验证码吗？',
    'faq.q4.a': '可以！FreeMail 会自动检测验证码、OTP 码和激活码，并高亮显示，一键即可复制。',
    'faq.q5.q': '我的数据安全吗？',
    'faq.q5.a': '绝对安全。我们不存储任何个人信息。所有邮件在过期后自动删除。我们的服务运行在 Cloudflare 全球边缘网络上，确保最高的安全性和速度。',
    'faq.q6.q': '可以回复邮件吗？',
    'faq.q6.a': '目前 FreeMail 仅支持接收邮件。这有助于防止垃圾邮件并保持匿名性。',
    'footer.tagline': '安全、私密、永远免费。',
    'footer.rights': '保留所有权利。',
    'footer.powered': '基于 Cloudflare Workers 构建',
    'toast.generated': '邮箱已生成！',
    'toast.copied': '已复制: {v}',
    'toast.codeCopied': '验证码已复制: {v}',
    'toast.copyFailed': '复制失败',
    'toast.genFailed': '生成邮箱失败',
    'toast.loadFailed': '加载邮件失败',
    'toast.allCopied': '内容已复制！',
    'countdown.expired': '已过期 — 请重新生成',
    'countdown.expires': '{t} 后过期',
    'modal.copyCode': '复制验证码: {v}',
    'modal.copyAll': '复制全文',
    'modal.noContent': '无内容',
    'modal.from': '发件人: {v}',
    'modal.to': '收件人: {v}',
    'modal.time': '时间: {v}',
  }
};

// ── State ──
const API_BASE = '';
let currentEmail = '';
let expiresAt = 0;
let expirationDuration = 0;
let refreshTimer = null;
let countdownTimer = null;
let currentLang = localStorage.getItem('fm-lang') || 'en';
let currentTheme = localStorage.getItem('fm-theme') || 'dark';

// ── DOM Helpers ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const $id = (id) => document.getElementById(id);

// ── DOM refs ──
const emailBox = $id('email-box');
const emailPlaceholder = $id('email-placeholder');
const emailAddress = $id('email-address');
const btnGenerate = $id('btn-generate');
const btnGenerateName = $id('btn-generate-name');
const btnCopy = $id('btn-copy');
const btnRefresh = $id('btn-refresh-inbox');
const btnRefresh2 = $id('btn-refresh-inbox2');
const domainSelect = $id('domain-select');
const timerSelect = $id('timer');
const inboxSection = $id('inbox-section');
const inboxList = $id('inbox-list');
const inboxCount = $id('inbox-count');
const countdown = $id('countdown');
const countdownBar = $id('countdown-bar');
const countdownText = $id('countdown-text');
const modal = $id('email-modal');
const modalSubject = $id('modal-subject');
const modalContent = $id('modal-content');
const modalClose = $id('modal-close');
const btnLang = $id('btn-lang');
const langLabel = $id('lang-label');
const btnTheme = $id('btn-theme');
const navHamburger = $id('nav-hamburger');
const mobileMenu = $id('mobile-menu');
const nav = $id('nav');
const toastContainer = $id('toast-container');

// ── i18n engine ──
function t(key, vars = {}) {
  let str = (i18n[currentLang] && i18n[currentLang][key]) || (i18n.en[key]) || key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

function applyI18n() {
  $$('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (el.tagName === 'OPTION') {
      el.textContent = translated;
    } else if (/<[a-z][\s\S]*>/i.test(translated)) {
      el.innerHTML = translated;
    } else {
      el.textContent = translated;
    }
  });
  langLabel.textContent = currentLang === 'en' ? 'EN' : '中';
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
}

function switchLang() {
  currentLang = currentLang === 'en' ? 'zh' : 'en';
  localStorage.setItem('fm-lang', currentLang);
  applyI18n();
}

// ── Theme engine ──
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('fm-theme', theme);
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// ── Name generation ──
const commonSyllables = [
  'al','an','ar','er','in','on','en','el','or','ir',
  'la','le','li','lo','lu','ra','re','ri','ro','ru',
  'na','ne','ni','no','nu','ma','me','mi','mo','mu',
  'ta','te','ti','to','tu','sa','se','si','so','su',
  'ca','ce','ci','co','cu','da','de','di','do','du'
];
const nameFragments = [
  'alex','max','sam','ben','tom','joe','leo','kai','ray','jay',
  'anna','emma','lily','lucy','ruby','zoe','eva','mia','ava','ivy'
];

function makeNaturalWord(targetLen) {
  let word = '';
  let attempts = 0;
  while (word.length < targetLen && attempts < 40) {
    attempts++;
    let syl;
    if (word.length === 0 && Math.random() < 0.3 && targetLen >= 4) {
      const f = nameFragments[Math.floor(Math.random() * nameFragments.length)];
      syl = f.length <= targetLen ? f : commonSyllables[Math.floor(Math.random() * commonSyllables.length)];
    } else {
      syl = commonSyllables[Math.floor(Math.random() * commonSyllables.length)];
    }
    if (word.length + syl.length <= targetLen) word += syl;
    else break;
  }
  return word.slice(0, targetLen).toLowerCase();
}

function generateRandomName(len = 10) {
  const l = Math.max(4, Math.min(20, len));
  if (l <= 10) return makeNaturalWord(l);
  const firstLen = Math.max(3, Math.floor((l - 1) * 0.4));
  const lastLen = Math.max(3, l - 1 - firstLen);
  return (makeNaturalWord(firstLen) + '.' + makeNaturalWord(lastLen)).toLowerCase();
}

// ── Toast ──
function showToast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.classList.add('removing');
    el.addEventListener('animationend', () => el.remove());
  }, 3000);
}

// ── Utilities ──
function formatTime(ts) {
  if (!ts) return '';
  try {
    const iso = ts.includes('T') ? ts : ts.replace(' ', 'T');
    const d = new Date(iso + (iso.endsWith('Z') ? '' : 'Z'));
    return d.toLocaleString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
      hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch { return ts; }
}

function extractCode(text) {
  if (!text) return '';
  const keywords = '(?:verification\\s+code|security\\s+code|code|otp|验证码|校验码)';
  let m = text.match(new RegExp(keywords + '[^0-9A-Za-z]{0,20}(?:is|:|：|为)?[^0-9A-Za-z]{0,10}(\\d{4,8})(?![0-9])', 'i'));
  if (m) return m[1];
  m = text.match(/(?<!\d)(\d{6})(?!\d)/);
  if (m) return m[1];
  return '';
}

function escHtml(s) {
  return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] || c));
}

// ── API ──
async function api(path, opts) {
  return fetch(API_BASE + path, opts);
}

// ── Domains ──
async function loadDomains() {
  try {
    const r = await api('/api/domains');
    if (!r.ok) throw new Error();
    const domains = await r.json();
    if (Array.isArray(domains) && domains.length) {
      domainSelect.innerHTML = domains.map((d, i) => `<option value="${i}">${d}</option>`).join('');
    }
  } catch {
    const meta = (document.querySelector('meta[name="mail-domains"]')?.getAttribute('content') || '').split(',').filter(Boolean);
    if (meta.length) domainSelect.innerHTML = meta.map((d, i) => `<option value="${i}">${d.trim()}</option>`).join('');
    else domainSelect.innerHTML = '<option value="0">mail.example.com</option>';
  }
}

// ── Email state ──
function setEmail(email, skipScroll) {
  currentEmail = email;
  emailPlaceholder.style.display = 'none';
  emailAddress.style.display = 'inline';
  emailAddress.textContent = email;
  emailBox.classList.add('has-email');
  btnCopy.disabled = false;
  btnRefresh.disabled = false;
  countdown.style.display = 'block';
  startCountdown();
  startAutoRefresh();
  refreshInbox();
  if (!skipScroll) {
    setTimeout(() => {
      inboxSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

// ── Generate email ──
async function generateEmail() {
  if (btnGenerate.disabled) return;
  btnGenerate.disabled = true;
  const origHTML = btnGenerate.innerHTML;
  btnGenerate.innerHTML = '<div class="spinner-sm"></div><span>' + (currentLang === 'zh' ? '生成中...' : 'Generating...') + '</span>';
  try {
    const domainIndex = Number(domainSelect.value || 0);
    const r = await api(`/api/generate?length=10&domainIndex=${domainIndex}`);
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(txt || 'Failed');
    }
    const data = await r.json();
    setEmail(data.email);
    const mins = Number(timerSelect.value || 60);
    expirationDuration = mins * 60000;
    expiresAt = Date.now() + expirationDuration;
    showToast(t('toast.generated'), 'success');
  } catch (e) {
    showToast(e.message || t('toast.genFailed'), 'error');
  } finally {
    btnGenerate.innerHTML = origHTML;
    btnGenerate.disabled = false;
  }
}

// ── Generate name email ──
async function generateNameEmail() {
  if (btnGenerateName.disabled) return;
  btnGenerateName.disabled = true;
  const origHTML = btnGenerateName.innerHTML;
  btnGenerateName.innerHTML = '<div class="spinner-sm"></div><span>' + (currentLang === 'zh' ? '生成中...' : 'Generating...') + '</span>';
  try {
    const localName = generateRandomName(10);
    const domainIndex = Number(domainSelect.value || 0);
    const r = await api('/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local: localName, domainIndex })
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(txt || 'Failed');
    }
    const data = await r.json();
    setEmail(data.email);
    const mins = Number(timerSelect.value || 60);
    expirationDuration = mins * 60000;
    expiresAt = Date.now() + expirationDuration;
    showToast(t('toast.generated'), 'success');
  } catch (e) {
    showToast(e.message || t('toast.genFailed'), 'error');
  } finally {
    btnGenerateName.innerHTML = origHTML;
    btnGenerateName.disabled = false;
  }
}

// ── Inbox ──
async function refreshInbox() {
  if (!currentEmail) return;
  try {
    const r = await api(`/api/emails?mailbox=${encodeURIComponent(currentEmail)}`);
    const emails = await r.json();
    if (!Array.isArray(emails)) return;

    inboxCount.textContent = emails.length;

    if (emails.length === 0) {
      inboxList.innerHTML = `
        <div class="inbox-empty">
          <div class="inbox-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
            </svg>
          </div>
          <p>${t('inbox.waiting')}</p>
          <p class="inbox-empty-hint">${t('inbox.autoRefresh')}</p>
        </div>`;
      return;
    }

    inboxList.innerHTML = emails.map(e => {
      const sender = escHtml(e.sender || 'Unknown');
      const subject = escHtml(e.subject || '(No subject)');
      const preview = escHtml((e.preview || '').slice(0, 80));
      const time = formatTime(e.received_at || e.created_at);
      const code = (e.verification_code || '').toString().trim() || extractCode(e.preview || '');
      return `
        <div class="email-item" onclick="window.__showEmail(${e.id})">
          <div class="email-item-header">
            <span class="email-item-sender">${sender}</span>
            <span class="email-item-time">${time}</span>
          </div>
          <div class="email-item-subject">${subject}</div>
          ${code ? `<div><span class="email-item-code" onclick="event.stopPropagation();window.__copyCode('${escHtml(code)}')" title="Click to copy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> ${escHtml(code)}</span></div>` : ''}
          ${!code && preview ? `<div class="email-item-preview">${preview}</div>` : ''}
        </div>`;
    }).join('');
  } catch { /* silent */ }
}

// ── Copy code ──
window.__copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code);
    showToast(t('toast.codeCopied', { v: code }), 'success');
  } catch { showToast(t('toast.copyFailed'), 'error'); }
};

// ── Show email detail ──
window.__showEmail = async (id) => {
  try {
    const r = await api(`/api/email/${id}`);
    const email = await r.json();
    modalSubject.textContent = email.subject || '(No subject)';
    const rawHtml = (email.html_content || '').toString();
    const rawText = (email.content || '').toString();
    const code = extractCode(`${email.subject || ''} ${(rawHtml || rawText).replace(/<[^>]+>/g, ' ')}`);
    const toLine = email.to_addrs || '';
    const timeLine = formatTime(email.received_at || email.created_at);

    let actionsHtml = `
      <div class="modal-actions">
        ${code ? `<button class="btn-icon" onclick="window.__copyCode('${escHtml(code)}')" style="width:auto;padding:8px 16px;gap:6px;font-size:13px;font-weight:600;display:flex;align-items:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> ${t('modal.copyCode', { v: escHtml(code) })}</button>` : ''}
        <button class="btn-icon" id="btn-copy-all" style="width:auto;padding:8px 16px;gap:6px;font-size:13px;font-weight:600;display:flex;align-items:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> ${t('modal.copyAll')}</button>
      </div>`;

    let contentHtml = '';
    if (rawHtml.trim()) {
      contentHtml = `<div class="modal-content-area"><iframe id="email-iframe" style="width:100%;border:0;min-height:400px;background:#fff;border-radius:0 0 var(--radius-sm) var(--radius-sm)"></iframe></div>`;
    } else if (rawText.trim()) {
      contentHtml = `<div class="modal-content-area"><pre style="padding:20px;white-space:pre-wrap;word-break:break-word;color:var(--text);font-size:14px;line-height:1.7">${escHtml(rawText)}</pre></div>`;
    } else {
      contentHtml = `<div style="text-align:center;padding:48px;color:var(--text-muted)">${t('modal.noContent')}</div>`;
    }

    modalContent.innerHTML = `
      <div class="modal-meta">
        <span>${t('modal.from', { v: escHtml(email.sender || '') })}</span>
        ${toLine ? `<span>${t('modal.to', { v: escHtml(toLine) })}</span>` : ''}
        ${timeLine ? `<span>${t('modal.time', { v: timeLine })}</span>` : ''}
      </div>
      ${actionsHtml}
      ${contentHtml}`;

    if (rawHtml.trim()) {
      const iframe = $id('email-iframe');
      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) { doc.open(); doc.write(rawHtml); doc.close(); }
        setTimeout(() => {
          try { iframe.style.height = Math.max(doc.body?.scrollHeight || 0, 400) + 'px'; } catch {}
        }, 200);
      }
    }

    $id('btn-copy-all')?.addEventListener('click', async () => {
      const text = (rawHtml || rawText).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      try {
        await navigator.clipboard.writeText(text);
        showToast(t('toast.allCopied'), 'success');
      } catch { showToast(t('toast.copyFailed'), 'error'); }
    });

    modal.classList.add('show');
  } catch { showToast(t('toast.loadFailed'), 'error'); }
};

// ── Auto-refresh ──
function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(refreshInbox, 5000);
}

function stopAutoRefresh() {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
}

// ── Countdown ──
function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    const remaining = Math.max(0, expiresAt - Date.now());
    if (remaining <= 0) {
      countdownText.textContent = t('countdown.expired');
      countdownBar.style.width = '0%';
      clearInterval(countdownTimer);
      stopAutoRefresh();
      return;
    }
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    countdownText.textContent = t('countdown.expires', { t: timeStr });
    if (expirationDuration > 0) {
      countdownBar.style.width = `${(remaining / expirationDuration) * 100}%`;
    }
  }, 1000);
}

// ── Copy email ──
async function copyEmail() {
  if (!currentEmail) return;
  try {
    await navigator.clipboard.writeText(currentEmail);
    btnCopy.classList.add('copied');
    showToast(t('toast.copied', { v: currentEmail }), 'success');
    setTimeout(() => btnCopy.classList.remove('copied'), 1500);
  } catch { showToast(t('toast.copyFailed'), 'error'); }
}

// ── Visibility change ──
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else if (currentEmail) startAutoRefresh();
});

// ── Nav scroll effect ──
let lastScrollY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 20);
  lastScrollY = y;
}, { passive: true });

// ── Mobile menu ──
function toggleMobileMenu() {
  navHamburger.classList.toggle('active');
  mobileMenu.classList.toggle('show');
  document.body.style.overflow = mobileMenu.classList.contains('show') ? 'hidden' : '';
}

function closeMobileMenu() {
  navHamburger.classList.remove('active');
  mobileMenu.classList.remove('show');
  document.body.style.overflow = '';
}

// ── Event listeners ──
btnGenerate.addEventListener('click', generateEmail);
btnGenerateName.addEventListener('click', generateNameEmail);
btnCopy.addEventListener('click', copyEmail);
btnRefresh.addEventListener('click', refreshInbox);
btnRefresh2?.addEventListener('click', refreshInbox);
btnLang.addEventListener('click', switchLang);
btnTheme.addEventListener('click', toggleTheme);
navHamburger.addEventListener('click', toggleMobileMenu);

modalClose.addEventListener('click', () => modal.classList.remove('show'));
modal.addEventListener('click', (e) => {
  if (!modal.querySelector('.modal').contains(e.target)) modal.classList.remove('show');
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modal.classList.remove('show');
    closeMobileMenu();
  }
});

mobileMenu.addEventListener('click', (e) => {
  if (e.target.classList.contains('mobile-menu-link')) closeMobileMenu();
});

// Smooth scroll for nav links
$$('.nav-link, .mobile-menu-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        closeMobileMenu();
      }
    }
  });
});

// ── Footer year ──
const fy = $id('footer-year');
if (fy) fy.textContent = new Date().getFullYear();

// ── Init ──
applyTheme(currentTheme);
applyI18n();

// Load domains then auto-generate email on page load
(async function autoGenerate() {
  await loadDomains();
  try {
    const domainIndex = Number(domainSelect.value || 0);
    const r = await api(`/api/generate?length=10&domainIndex=${domainIndex}`);
    if (!r.ok) return;
    const data = await r.json();
    if (data.email) {
      expiresAt = data.expires || (Date.now() + 3600000);
      expirationDuration = expiresAt - Date.now();
      setEmail(data.email, true);
    }
  } catch (_) {}
})();
