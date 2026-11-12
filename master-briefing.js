/*
 * TitanCore Master Briefing — renderer (added 2026-11-12).
 *
 * Renders window.TITANCORE_MASTER_BRIEFING (master-briefing-data.js) into
 * every [data-master-briefing] container on the page. Briefings are built
 * with textContent only: the renderer creates NO anchors at all, so a
 * reader can never be bounced off the page by a news item. The source of
 * each briefing is printed as plain text ("Source: ...") at the end of
 * the item — a referral by name, never a link.
 *
 * Optional desk filter: buttons with [data-desk-filter] re-render the
 * containers showing only that desk ("all" shows everything).
 */
(function () {
  "use strict";

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderInto(container, deskFilter) {
    var items = (window.TITANCORE_MASTER_BRIEFING || []).filter(function (item) {
      return !deskFilter || deskFilter === "all" || item.desk === deskFilter;
    });

    container.textContent = "";

    if (!items.length) {
      container.appendChild(el("p", null, "No briefings on this desk yet — the full briefing is below."));
      return;
    }

    items.forEach(function (item) {
      var article = el("article", "briefing-item");
      article.style.marginBottom = "28px";

      var meta = el("div", "label", item.desk + " · " + item.dateLabel);
      article.appendChild(meta);

      article.appendChild(el("h3", null, item.headline));

      if (item.image && item.image.src) {
        var figure = el("figure", "briefing-figure");
        figure.style.margin = "0 0 14px";
        var img = document.createElement("img");
        img.src = item.image.src;
        img.alt = item.image.alt || "";
        img.loading = "lazy";
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        figure.appendChild(img);
        if (item.image.credit) {
          figure.appendChild(el("figcaption", "small", item.image.credit));
        }
        article.appendChild(figure);
      }

      (item.paragraphs || []).forEach(function (paragraph) {
        article.appendChild(el("p", null, paragraph));
      });

      article.appendChild(el("p", "small briefing-source", "Source: " + item.source));
      container.appendChild(article);
    });
  }

  function renderAll(deskFilter) {
    var containers = document.querySelectorAll("[data-master-briefing]");
    Array.prototype.forEach.call(containers, function (container) {
      renderInto(container, deskFilter);
    });
  }

  function wireFilters() {
    var buttons = document.querySelectorAll("[data-desk-filter]");
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", function () {
        Array.prototype.forEach.call(buttons, function (other) {
          other.setAttribute("aria-pressed", String(other === button));
        });
        renderAll(button.getAttribute("data-desk-filter") || "all");
      });
    });
  }

  function init() {
    renderAll("all");
    wireFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
