document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  if (!form) return;

  const thanksBox = document.querySelector(".thanks");
  if (thanksBox) {
    thanksBox.style.display = "none";
  }

  form.addEventListener("submit", function () {
    if (thanksBox) {
      setTimeout(() => {
        thanksBox.style.display = "block";
        thanksBox.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600);
    }
  });
});
