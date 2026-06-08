const openMenu = document.getElementById("openMenu");
const closeMenu = document.getElementById("closeMenu");
const menuPanel = document.getElementById("menuPanel");
let lastFocus = null;

function openDialog() {
  if (!menuPanel || !openMenu) return;
  lastFocus = document.activeElement;
  menuPanel.classList.add("open");
  document.body.style.overflow = "hidden";
  openMenu.setAttribute("aria-expanded", "true");
  menuPanel.querySelector("a, button")?.focus();
}

function closeDialog() {
  if (!menuPanel || !openMenu) return;
  menuPanel.classList.remove("open");
  document.body.style.overflow = "";
  openMenu.setAttribute("aria-expanded", "false");
  lastFocus?.focus();
}

openMenu?.addEventListener("click", openDialog);
closeMenu?.addEventListener("click", closeDialog);
menuPanel?.addEventListener("click", (event) => {
  if (event.target === menuPanel) closeDialog();
});
menuPanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeDialog));
document.addEventListener("keydown", (event) => {
  if (!menuPanel?.classList.contains("open")) return;
  if (event.key === "Escape") closeDialog();
  if (event.key !== "Tab") return;
  const items = menuPanel.querySelectorAll("a, button");
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
