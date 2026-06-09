const navToggle = document.querySelector('.nav-toggle');
const vaultaraNav = document.getElementById('vaultaraNav');

if (navToggle && vaultaraNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = vaultaraNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    navToggle.textContent = isOpen ? '×' : '☰';
    document.body.classList.toggle('menu-open', isOpen);
  });

  vaultaraNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    vaultaraNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
    navToggle.textContent = '☰';
    document.body.classList.remove('menu-open');
  }));
}

const serviceSelect = document.getElementById('service');
if (serviceSelect) {
  const requestedService = new URLSearchParams(window.location.search).get('service');
  const matchingOption = [...serviceSelect.options].find((option) => option.value.toLowerCase().replaceAll('&', '').replace(/\s+/g, '-').replace(/-+/g, '-') === requestedService);
  if (matchingOption) serviceSelect.value = matchingOption.value;
}
