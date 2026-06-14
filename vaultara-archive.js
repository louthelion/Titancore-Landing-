document.addEventListener("DOMContentLoaded", () => {
  const search = document.querySelector("[data-archive-search]");
  const category = document.querySelector("[data-archive-category]");
  const cards = [...document.querySelectorAll("[data-archive-card]")];
  const empty = document.querySelector("[data-archive-empty]");
  if (!search || !category || !cards.length) return;
  function filterArchive() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const show = card.textContent.toLowerCase().includes(query) &&
        (category.value === "all" || card.dataset.category === category.value);
      card.classList.toggle("hidden", !show);
      if (show) visible += 1;
    });
    if (empty) empty.style.display = visible ? "none" : "block";
  }
  search.addEventListener("input", filterArchive);
  category.addEventListener("change", filterArchive);
});
