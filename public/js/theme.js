/**
 * 全局主题管理器 — 所有页面共享
 * 读取 localStorage 中 Landing Page 存储的主题偏好并应用
 */
(function () {
  var STORAGE_KEY = 'fm-theme';
  var root = document.documentElement;

  function getPreferred() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  function toggle() {
    var current = root.getAttribute('data-theme') || getPreferred();
    apply(current === 'dark' ? 'light' : 'dark');
    return root.getAttribute('data-theme');
  }

  apply(getPreferred());

  window.__themeToggle = toggle;
  window.__themeApply = apply;
  window.__themeGet = function () { return root.getAttribute('data-theme') || getPreferred(); };
})();
