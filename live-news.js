(function () {
  "use strict";

  const REFRESH_MS = 15 * 60 * 1000;
  let timer = null;

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#039;", '"':"&quot;" })[char];
    });
  }

  function safeUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.origin);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : "#";
    } catch (_) {
      return "#";
    }
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
    return date.toLocaleString("en-US", {
      month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit"
    });
  }

  function ensureTarget() {
    let target = document.getElementById("globalNewsList");
    if (target) {
      if (!document.getElementById("liveNews")) {
        const anchor = document.createElement("span");
        anchor.id = "liveNews";
        anchor.setAttribute("aria-hidden", "true");
        anchor.style.position = "relative";
        anchor.style.top = "-110px";
        target.parentNode.insertBefore(anchor, target);
      }
      return { target, variant:"news-item" };
    }

    const isGlobalPage = /global news/i.test(document.title || "");
    const contact = document.querySelector("section.contact");
    if (!isGlobalPage || !contact) return null;

    const section = document.createElement("section");
    section.className = "section";
    section.id = "liveNews";
    section.innerHTML = `<div class="wrap">
      <div class="eyebrow">Live Business Wire</div>
      <h2>Current Global <span>Headlines.</span></h2>
      <p id="liveNewsStatus">Loading current public business headlines…</p>
      <div class="grid" id="globalNewsList"></div>
    </div>`;
    contact.parentNode.insertBefore(section, contact);
    target = document.getElementById("globalNewsList");
    return { target, variant:"card" };
  }

  function flattenSections(sections) {
    const priority = ["global", "business", "realestate", "oil", "crypto"];
    const map = new Map((sections || []).map(section => [section.key, section]));
    const rows = [];
    priority.forEach(function (key) {
      const section = map.get(key);
      if (!section || !Array.isArray(section.items)) return;
      section.items.slice(0, key === "global" ? 2 : 1).forEach(function (item) {
        rows.push({
          desk: section.label || key,
          title: item.title || "Business headline",
          link: item.link || "#",
          source: item.source || "Public News Source",
          pubDate: item.pubDate || "",
          summary: item.summary || ""
        });
      });
    });
    return rows.slice(0, 6);
  }

  function render(targetInfo, rows, updatedAt) {
    const target = targetInfo.target;
    const isCard = targetInfo.variant === "card";
    const status = document.getElementById("liveNewsStatus");
    if (status) {
      status.textContent = `Live public business headlines. Updated ${formatUpdated(updatedAt)}. This page checks for new headlines every 15 minutes.`;
    }

    const statusBlock = isCard ? "" : `<div class="news-item"><b>Live TitanCore Business Wire</b><p>Updated ${escapeHtml(formatUpdated(updatedAt))} • checks for new headlines every 15 minutes.</p></div>`;

    const cards = rows.map(function (item) {
      const url = safeUrl(item.link);
      const metaParts = [item.desk, item.source];
      if (item.pubDate) {
        const parsed = new Date(item.pubDate);
        if (!Number.isNaN(parsed.getTime())) metaParts.push(parsed.toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" }));
      }
      const meta = metaParts.filter(Boolean).join(" • ");
      const summary = item.summary ? `<p>${escapeHtml(item.summary).slice(0, 500)}</p>` : `<p>${escapeHtml(meta)}</p>`;

      if (isCard) {
        return `<article class="card"><div class="label">${escapeHtml(meta)}</div><h3><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>${summary}<a class="btn" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open Source ›</a></article>`;
      }

      return `<div class="news-item"><b><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></b><p>${escapeHtml(meta)}</p></div>`;
    }).join("");

    target.innerHTML = statusBlock + cards;
  }

  async function loadNews() {
    const targetInfo = ensureTarget();
    if (!targetInfo) return;

    const now = new Date();
    const endpoint = `/.netlify/functions/market-news?day=${encodeURIComponent(dateKey(now))}&mode=${encodeURIComponent(currentMode(now))}`;

    try {
      const response = await fetch(endpoint, { headers:{ "Accept":"application/json" }, cache:"no-store" });
      if (!response.ok) throw new Error("News feed request failed");
      const data = await response.json();
      if (!data || !data.ok) throw new Error(data && data.error ? data.error : "News feed unavailable");
      const rows = flattenSections(data.sections);
      if (!rows.length) throw new Error("No current headlines returned");
      render(targetInfo, rows, data.updatedAt);
    } catch (error) {
      console.warn("TitanCore live news is waiting for the public feed.", error);
      const status = document.getElementById("liveNewsStatus");
      if (status) status.textContent = "Current headlines are temporarily refreshing. Please check again shortly.";
    }
  }

  function start() {
    loadNews();
    if (timer) clearInterval(timer);
    timer = setInterval(loadNews, REFRESH_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
