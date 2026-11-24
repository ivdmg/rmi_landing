const colorPreference = matchMedia('(prefers-color-scheme: dark)');
const root = document.documentElement;
let selectedTheme;

try {
  selectedTheme = localStorage.getItem('rmi-theme');
} catch {
  // The toggle still works when browser storage is restricted.
}

function renderTheme() {
  const theme = selectedTheme ?? (colorPreference.matches ? 'dark' : 'light');
  root.dataset.theme = theme;
  document.querySelector('.theme')?.setAttribute('aria-pressed', String(theme === 'dark'));
}

renderTheme();
colorPreference.addEventListener('change', renderTheme);
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.theme');
  button.hidden = false;
  renderTheme();

  button.addEventListener('click', () => {
    selectedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    renderTheme();
    try {
      localStorage.setItem('rmi-theme', selectedTheme);
    } catch {
      // Keep the selection for this page visit.
    }
  });
});
