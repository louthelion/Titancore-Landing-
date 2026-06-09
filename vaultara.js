const navToggle = document.querySelector('.nav-toggle');
const vaultaraNav = document.getElementById('vaultaraNav');
if (navToggle && vaultaraNav) {
  navToggle.addEventListener('click', () => {
    const open = vaultaraNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navToggle.textContent = open ? '×' : '☰';
    document.body.classList.toggle('menu-open', open);
  });
  vaultaraNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    vaultaraNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.textContent = '☰';
    document.body.classList.remove('menu-open');
  }));
}
const params = new URLSearchParams(window.location.search);
for (const id of ['service', 'package']) {
  const select = document.getElementById(id);
  const requested = params.get(id);
  if (!select || !requested) continue;
  const normalized = requested.toLowerCase().replace(/[-_]+/g, ' ').trim();
  const option = [...select.options].find((item) => item.value.toLowerCase() === normalized || item.textContent.toLowerCase().startsWith(normalized));
  if (option) select.value = option.value;
}
