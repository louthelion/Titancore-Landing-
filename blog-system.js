(function () {
  "use strict";

  const staticPosts = [
    { slug:"blog-building-with-order.html", title:"Building With Order Creates Better Business Direction", category:"Company Direction", date:"2026-06-08", icon:"BO", summary:"Clear priorities and ownership help a growing company turn daily activity into steady, understandable progress." },
    { slug:"blog-small-updates-matter.html", title:"Why Small Business Updates Matter Over Time", category:"Business Growth", date:"2026-06-10", icon:"SU", summary:"Consistent updates build a visible record of learning, momentum, and responsible business growth." },
    { slug:"blog-weekly-reflection-structure.html", title:"Weekly Reflection: Structure Helps a Company Stay Focused", category:"Leadership Reflection", date:"2026-06-12", icon:"WR", summary:"A short weekly review helps leaders protect priorities, resolve unfinished work, and begin the next week clearly." },
    { slug:"blog-clear-message.html", title:"Why a Clear Message Matters on a Company Website", category:"Company Update", date:"2026-06-05", icon:"CM", summary:"A focused website message helps visitors understand the company, its purpose, and the right next step." },
    { slug:"blog-organized-growth.html", title:"Organized Growth Starts With Small Steps", category:"Business Insight", date:"2026-06-03", icon:"OG", summary:"Small operating improvements create the discipline and confidence needed for responsible expansion." },
    { slug:"blog-building-public-trust.html", title:"Building Public Trust One Page at a Time", category:"Market Awareness", date:"2026-06-01", icon:"PT", summary:"Accurate, consistent public information gives customers and partners more reasons to trust a growing company." }
  ];

  let liveWeeklyPost = null;

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function startOfWeek(date) {
    const value = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = value.getDay();
    const distance = day === 0 ? 6 : day - 1;
    value.setDate(value.getDate() - distance);
    return value;
  }

  function formatDate(dateString, options) {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", options || { month:"long", day:"numeric", year:"numeric" });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function(char){
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"})[char];
    });
  }

  function allPublishedPosts(now) {
    const today = localDateKey(now || new Date());
    const items = staticPosts.filter((post) => post.date <= today);
    if (liveWeeklyPost && liveWeeklyPost.date <= today) items.push(liveWeeklyPost);
    return items.sort((a, b) => b.date.localeCompare(a.date));
  }

  function publishedPosts(now) {
    return allPublishedPosts(now);
  }

  function card(post, featured) {
    const label = post.live ? "Open Weekly Brief" : "Read Post";
    const liveNote = post.live ? '<div class="blog-card-meta">Automatically refreshed from current public business-news sources.</div>' : "";
    return `<article class="${featured ? "blog-feature-card metal" : "blog-card"}">
      <div class="blog-card-icon" aria-hidden="true">${escapeHtml(post.icon)}</div>
      <div class="blog-card-content">
        <div class="category">${escapeHtml(post.category)}</div>
        <h3>${escapeHtml(post.title)}</h3>
        <div class="blog-card-meta"><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time></div>
        <p>${escapeHtml(post.summary)}</p>
        ${liveNote}
        <a class="btn" href="${escapeHtml(post.slug)}">${label} <span class="arrow">›</span></a>
      </div>
    </article>`;
  }

  function renderHomepage() {
    const target = document.getElementById("homepageBlogFeed");
    if (!target) return;
    const published = allPublishedPosts(new Date()).slice(0, 3);
    target.innerHTML = published.length ? published.map((post) => `<article class="home-blog-note">
      <div class="home-blog-note-top"><span>${escapeHtml(post.category)}</span><time datetime="${escapeHtml(post.date)}">${formatDate(post.date, { month:"short", day:"numeric", year:"numeric" })}</time></div>
      <h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.summary)}</p><a href="${escapeHtml(post.slug)}">${post.live ? "Open Weekly Brief" : "Read Post"} <span>›</span></a>
    </article>`).join("") : "<p>No blog notes are available yet.</p>";
  }

  function renderLibrary() {
    const latestTarget = document.getElementById("latestBlogPost");
    if (!latestTarget) return;
    const published = allPublishedPosts(new Date());
    const recentTarget = document.getElementById("recentBlogPosts");
    const archiveTarget = document.getElementById("blogArchive");
    if (!published.length) return;
    latestTarget.innerHTML = card(published[0], true);
    if (recentTarget) recentTarget.innerHTML = published.slice(1, 4).map((post) => card(post, false)).join("") || '<p class="blog-empty">More blog notes will appear here as they are published.</p>';
    if (!archiveTarget) return;
    const months = published.reduce((groups, post) => {
      const label = formatDate(post.date, { month:"long", year:"numeric" });
      (groups[label] ||= []).push(post);
      return groups;
    }, {});
    archiveTarget.innerHTML = Object.entries(months).map(([month, monthPosts]) => `<section class="archive-month metal"><h3>${month}</h3><div class="archive-links">${monthPosts.map((post) => `<a class="archive-link" href="${escapeHtml(post.slug)}"><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time><strong>${escapeHtml(post.title)}</strong><span>${post.live ? "Open Weekly Brief" : "Read Post"} ›</span></a>`).join("")}</div></section>`).join("");
  }

  function rerender() {
    renderHomepage();
    renderLibrary();
  }

  async function loadWeeklyPulse() {
    const weekStart = startOfWeek(new Date());
    const weekKey = localDateKey(weekStart);
    const endpoint = `/.netlify/functions/market-news?small=1&mode=morning&day=${encodeURIComponent(weekKey)}`;
    let summary = "This week’s TitanCore business pulse reviews current global business, markets, energy, real estate, and economic signals from public news sources.";

    try {
      const response = await fetch(endpoint, { headers: { "Accept":"application/json" } });
      if (!response.ok) throw new Error("weekly feed unavailable");
      const data = await response.json();
      if (data && data.ok && Array.isArray(data.sections)) {
        const headlines = data.sections
          .map((section) => section && section.items && section.items[0] ? section.items[0].title : "")
          .filter(Boolean)
          .slice(0, 3);
        if (headlines.length) summary = `This week’s public business pulse is tracking: ${headlines.join(" • ")}`;
      }
    } catch (error) {
      console.warn("TitanCore weekly blog pulse is waiting for the live news feed.", error);
    }

    liveWeeklyPost = {
      slug:"news-media.html#liveNews",
      title:`TitanCore Weekly Business Pulse — Week of ${formatDate(weekKey, { month:"long", day:"numeric", year:"numeric" })}`,
      category:"Weekly Business Pulse",
      date:weekKey,
      icon:"WP",
      summary,
      live:true
    };
    rerender();
  }

  function setupBlogMenu() {
    if (!document.body.classList.contains("blog-site")) return;
    const panel = document.getElementById("menuPanel");
    const open = document.getElementById("openMenu");
    const close = document.getElementById("closeMenu");
    if (!panel || !open || !close) return;
    const show = () => { panel.classList.add("open"); open.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; close.focus(); };
    const hide = () => { panel.classList.remove("open"); open.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; open.focus(); };
    open.addEventListener("click", show); close.addEventListener("click", hide);
    panel.addEventListener("click", (event) => { if (event.target === panel) hide(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && panel.classList.contains("open")) hide(); });
  }

  window.TitanCoreBlog = { posts:staticPosts, publishedPosts };
  document.addEventListener("DOMContentLoaded", function () {
    setupBlogMenu();
    rerender();
    loadWeeklyPulse();
  });
})();
