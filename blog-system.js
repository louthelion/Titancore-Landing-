(function () {
  "use strict";

  const posts = [
    {
      slug: "blog-building-with-order.html",
      title: "Building With Order Creates Better Business Direction",
      category: "Company Direction",
      date: "2026-06-08",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=85",
      summary: "A clear operating order helps a growing company protect its direction, assign responsibility, and make steady progress without turning every new idea into confusion."
    },
    {
      slug: "blog-why-small-updates-matter.html",
      title: "Why Small Business Updates Matter Over Time",
      category: "Business Growth",
      date: "2026-06-10",
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85",
      summary: "Small, consistent updates can improve trust, preserve momentum, and show that a business is learning from its work instead of waiting for one dramatic announcement."
    },
    {
      slug: "blog-weekly-reflection-structure.html",
      title: "Weekly Reflection: Structure Helps a Company Stay Focused",
      category: "Leadership Reflection",
      date: "2026-06-12",
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85",
      summary: "A weekly review of priorities, responsibilities, and unfinished work gives leaders a practical way to protect focus before the next week begins."
    }
  ];

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function publishedPosts(now) {
    const today = localDateKey(now || new Date());
    return posts
      .filter((post) => post.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function formatDate(dateString, options) {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", options || {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function card(post, featured) {
    return `
      <article class="${featured ? "blog-feature-card" : "blog-card"} metal">
        <div class="blog-card-image" style="background-image:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.28)),url('${post.image}')" role="img" aria-label="Professional business setting"></div>
        <div class="blog-card-content">
          <div class="category">${post.category}</div>
          <h3>${post.title}</h3>
          <div class="blog-card-meta"><time datetime="${post.date}">${formatDate(post.date)}</time></div>
          <p>${post.summary}</p>
          <a class="btn" href="${post.slug}">Read Post <span class="arrow">›</span></a>
        </div>
      </article>`;
  }

  function renderHomepage() {
    const preview = document.getElementById("latestBlogPreview");
    const published = publishedPosts(new Date());
    if (!preview || !published.length) return;

    const latest = published[0];
    const category = document.getElementById("latestBlogCategory");
    const title = document.getElementById("latestBlogTitle");
    const date = document.getElementById("latestBlogDate");
    const summary = document.getElementById("latestBlogSummary");
    const link = document.getElementById("latestBlogLink");

    if (category) category.textContent = latest.category;
    if (title) title.textContent = latest.title;
    if (date) {
      date.dateTime = latest.date;
      date.textContent = formatDate(latest.date);
    }
    if (summary) summary.textContent = latest.summary;
    if (link) link.href = latest.slug;
    preview.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,.94) 0%, rgba(0,0,0,.78) 48%, rgba(0,0,0,.38) 100%), linear-gradient(180deg, transparent 36%, rgba(0,0,0,.78) 100%), url('${latest.image}')`;
  }

  function renderLibrary() {
    const latestTarget = document.getElementById("latestBlogPost");
    if (!latestTarget) return;

    const published = publishedPosts(new Date());
    const recentTarget = document.getElementById("recentBlogPosts");
    const archiveTarget = document.getElementById("blogArchive");

    if (!published.length) {
      latestTarget.innerHTML = '<p class="blog-empty">The first TitanCore Blog post will appear here on its scheduled publishing date.</p>';
      if (recentTarget) recentTarget.innerHTML = '<p class="blog-empty">No recent posts are available yet.</p>';
      if (archiveTarget) archiveTarget.innerHTML = '<p class="blog-empty">Published posts will remain available here by month.</p>';
      return;
    }

    latestTarget.innerHTML = card(published[0], true);

    const recent = published.slice(1, 4);
    if (recentTarget) {
      recentTarget.innerHTML = recent.length
        ? recent.map((post) => card(post, false)).join("")
        : '<p class="blog-empty">The Monday post begins this week’s blog. New posts publish Wednesday and Friday and will appear here after release.</p>';
    }

    if (archiveTarget) {
      const months = published.reduce((groups, post) => {
        const label = formatDate(post.date, { month: "long", year: "numeric" });
        (groups[label] ||= []).push(post);
        return groups;
      }, {});

      archiveTarget.innerHTML = Object.entries(months).map(([month, monthPosts]) => `
        <section class="archive-month metal">
          <h3>${month}</h3>
          <div class="archive-links">
            ${monthPosts.map((post) => `
              <a class="archive-link" href="${post.slug}">
                <time datetime="${post.date}">${formatDate(post.date)}</time>
                <strong>${post.title}</strong>
                <span>Read Post ›</span>
              </a>`).join("")}
          </div>
        </section>`).join("");
    }
  }

  window.TitanCoreBlog = { posts, publishedPosts };
  document.addEventListener("DOMContentLoaded", function () {
    renderHomepage();
    renderLibrary();
  });
})();
