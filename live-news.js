/*
 * TitanCore Live News Wire — renderer (rewritten 2026-11-20).
 *
 * Fetches /.netlify/functions/market-news and renders each section as
 * ON-PAGE briefings: headline, the full summary text, the source named
 * in plain text, and the date. Fleet news rule (Luders, 2026-11-20):
 * the full story lives on this page and NO outbound link is ever
 * rendered from news content. This renderer therefore NEVER reads the
 * feed's `link` field — it is not copied into the DOM in any form —
 * and every item is built with textContent only, so a news item can
 * never become a door off the page. (The previous version rendered
 * each headline as an external link with an "Open Source" button;
 * that click-out behaviour is removed here and must not come back.)
 *
 * Targets, in order:
 *  1. A static wire root: an element with [data-live-wire] (used by
 *     news-media.html's #liveNews section). Inside it, the renderer
 *     fills [data-wire-status], [data-wire-sections] (every desk
 *     except Local) and [data-wire-local] (the Orlando / Central
 *     Florida lane) when those containers are present.
 *  2. A legacy #globalNewsList element, treated as a sections root.
 *  3. On the Global News page (no static root), a #liveNews section
 *     is created before the contact section, in that page's card
 *     style, with the same containers inside.
 *
 * Freshness: the function caches upstream for about 15 minutes and
 * this page re-fetches every 15 minutes, so the wire stays current
 * on its own — no editor pass is needed for this layer.
 */
(function () {
  "use strict";

  const REFRESH_MS = 15 * 60 * 1000;
  const LOCAL_KEY = "local";
  let timer = null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function currentMode(date) {
    const hour = date.getHours();
    if (hour >= 18) return "evening";
    if (hour >= 12) return "afternoon";
    return "morning";
  }

  function formatUpdated(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
    });
  }

  function formatPubDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
    });
  }

  /*
   * Google News titles arrive as "Headline - Source Name" and the RSS
   * summary usually repeats the headline plus the source name. Strip
   * those echoes so the page reads like a news page; the source is
   * still printed, in plain text, in the item's meta line.
   */
  function cleanHeadline(item) {
    let title = String(item.title || "").trim();
    const source = String(item.source || "").trim();
    if (source && title.endsWith(" - " + source)) {
      title = title.slice(0, title.length - source.length - 3).trim();
    }
    return title;
  }

  function cleanSummary(item, headline) {
    let summary = String(item.summary || "").trim();
    const source = String(item.source || "").trim();
    if (source && summary.endsWith(source)) {
      summary = summary.slice(0, summary.length - source.length).trim();
    }
    if (summary === headline) return "";
    return summary;
  }

  function buildItem(item, variant) {
    const headline = cleanHeadline(item) || "Business headline";
    const source = String(item.source || "Public News Source").trim();
    const when = formatPubDate(item.pubDate);
    const meta = when ? `Source: ${source} · ${when}` : `Source: ${source}`;
    const summary = cleanSummary(item, headline);

    if (variant === "card") {
      const card = el("article", "card");
      card.appendChild(el("div", "label", meta));
      card.appendChild(el("h3", null, headline));
      if (summary) card.appendChild(el("p", null, summary));
      return card;
    }

    const box = el("div", "news-item");
    box.appendChild(el("b", null, headline));
    if (summary) box.appendChild(el("p", null, summary));
    box.appendChild(el("p", "wire-meta", meta));
    return box;
  }

  function renderSections(container, sections, variant) {
    container.textContent = "";
    let rendered = 0;

    (sections || []).forEach(function (section) {
      const items = Array.isArray(section.items) ? section.items : [];
      if (!items.length) return;

      if (variant === "card") {
        const grid = el("div", "grid");
        items.forEach(function (item) {
          grid.appendChild(buildItem(item, variant));
          rendered++;
        });
        const label = el("div", "label", section.label || "News");
        const block = el("div", "wire-desk");
        block.appendChild(label);
        block.appendChild(grid);
        container.appendChild(block);
        return;
      }

      const block = el("div", "wire-desk");
      block.appendChild(el("div", "label", section.label || "News"));
      const line = el("div", "news-line");
      items.forEach(function (item) {
        line.appendChild(buildItem(item, variant));
        rendered++;
      });
      block.appendChild(line);
      container.appendChild(block);
    });

    return rendered;
  }

  function findRoots() {
    const roots = [];

    document.querySelectorAll("[data-live-wire]").forEach(function (root) {
      roots.push({
        root,
        variant: root.getAttribute("data-variant") || "news-item",
        status: root.querySelector("[data-wire-status]"),
        sections: root.querySelector("[data-wire-sections]"),
        local: root.querySelector("[data-wire-local]")
      });
    });
    if (roots.length) return roots;

    const legacy = document.getElementById("globalNewsList");
    if (legacy) {
      roots.push({
        root: legacy,
        variant: "news-item",
        status: document.getElementById("liveNewsStatus"),
        sections: legacy,
        local: null
      });
      return roots;
    }

    const isGlobalPage = /global news/i.test(document.title || "");
    const contact = document.querySelector("section.contact");
    if (!isGlobalPage || !contact) return roots;

    const section = document.createElement("section");
    section.className = "section";
    section.id = "liveNews";
    section.setAttribute("data-live-wire", "");
    section.setAttribute("data-variant", "card");

    const wrap = el("div", "wrap");
    wrap.appendChild(el("div", "eyebrow", "Live Business Wire"));
    const heading = el("h2", null, "Current Global ");
    const span = el("span", null, "Headlines.");
    heading.appendChild(span);
    wrap.appendChild(heading);
    const status = el("p", null, "Loading current public business headlines…");
    status.setAttribute("data-wire-status", "");
    wrap.appendChild(status);
    const sectionsBox = el("div", null);
    sectionsBox.setAttribute("data-wire-sections", "");
    wrap.appendChild(sectionsBox);
    const localTitle = el("h3", null, "Local — Orlando & Central Florida");
    wrap.appendChild(localTitle);
    const localBox = el("div", null);
    localBox.setAttribute("data-wire-local", "");
    wrap.appendChild(localBox);
    section.appendChild(wrap);

    contact.parentNode.insertBefore(section, contact);
    roots.push({
      root: section,
      variant: "card",
      status,
      sections: sectionsBox,
      local: localBox
    });
    return roots;
  }

  function renderAll(roots, data) {
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const globalSections = sections.filter(s => s && s.key !== LOCAL_KEY);
    const localSections = sections.filter(s => s && s.key === LOCAL_KEY);
    const updated = formatUpdated(data.updatedAt);
    let total = 0;

    roots.forEach(function (info) {
      if (info.sections) {
        total += renderSections(info.sections, globalSections, info.variant);
      }
      if (info.local) {
        total += renderSections(info.local, localSections, info.variant);
      }
      if (info.status) {
        info.status.textContent = updated
          ? `Live headlines, written out in full on this page with each source named in plain text. Updated ${updated}. This page checks for new headlines every 15 minutes.`
          : "Live headlines, written out in full on this page with each source named in plain text. This page checks for new headlines every 15 minutes.";
      }
    });

    return total;
  }

  function failAll(roots) {
    roots.forEach(function (info) {
      if (info.status) {
        info.status.textContent = "Live headlines are temporarily unavailable. Please check again shortly — the wire retries on its own every 15 minutes.";
      }
      [info.sections, info.local].forEach(function (box) {
        if (box && !box.children.length) {
          box.appendChild(el("p", null, "No headlines could be loaded right now."));
        }
      });
    });
  }

  async function loadNews() {
    const roots = findRoots();
    if (!roots.length) return;

    const now = new Date();
    const endpoint = `/.netlify/functions/market-news?day=${encodeURIComponent(dateKey(now))}&mode=${encodeURIComponent(currentMode(now))}`;

    try {
      const response = await fetch(endpoint, { headers: { "Accept": "application/json" }, cache: "no-store" });
      if (!response.ok) throw new Error("News feed request failed");
      const data = await response.json();
      if (!data || !data.ok) throw new Error(data && data.error ? data.error : "News feed unavailable");
      const total = renderAll(roots, data);
      if (!total) throw new Error("No current headlines returned");
    } catch (error) {
      console.warn("TitanCore live news wire could not load the public feed.", error);
      failAll(roots);
    }
  }

  function start() {
    loadNews();
    if (timer) clearInterval(timer);
    timer = setInterval(loadNews, REFRESH_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
