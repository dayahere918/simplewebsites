/**
 * Theme Toggle Component
 * Dark/Light mode with persistence via localStorage
 */

function initThemeToggle() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'dark'); // default dark
  applyTheme(theme);
  createToggleButton();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  updateToggleIcon(next);
}

function createToggleButton() {
  if (document.getElementById('theme-toggle')) return;
  const btn = document.createElement('button');
  btn.id = 'theme-toggle';
  btn.setAttribute('aria-label', 'Toggle dark/light theme');
  btn.onclick = toggleTheme;
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  document.body.appendChild(btn);

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #theme-toggle {
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      width: 48px; height: 48px; border-radius: 50%;
      border: 2px solid var(--color-border);
      background: var(--color-bg-card);
      color: var(--color-text);
      font-size: 1.4rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }
    #theme-toggle:hover {
      transform: scale(1.1) rotate(15deg);
      box-shadow: var(--shadow-glow);
      border-color: var(--color-primary);
    }
  `;
  document.head.appendChild(style);
}

function updateToggleIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}

// Auto-init on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initThemeToggle, applyTheme, toggleTheme, createToggleButton, updateToggleIcon };
}
