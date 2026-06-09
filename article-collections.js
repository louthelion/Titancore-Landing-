(function () {
  "use strict";

  const collections = [
    {
      startDate: "2026-05-11",
      theme: "Market Awareness Beyond the Headlines",
      imageClass: "market-awareness",
      articles: [
        { category: "Market Awareness", title: "Market Awareness Is More Than Watching Headlines", file: "article-market-awareness.html", summary: "A detailed framework for researching customers, competitors, costs, sectors, and economic conditions without overreacting to daily headlines." },
        { category: "Customer Research", title: "How Customer Signals Reveal Real Market Demand", file: "article-customer-signals.html", summary: "Learn how inquiries, behavior, retention, and recurring customer problems can reveal demand more clearly than broad attention metrics." },
        { category: "Competitive Intelligence", title: "A Practical System for Responsible Competitor Research", file: "article-competitor-research.html", summary: "Build an ethical, repeatable process for comparing positioning, offers, customer experience, and visible market moves." },
        { category: "Economic Awareness", title: "How Economic Signals Shape Better Business Planning", file: "article-economic-signals.html", summary: "Connect rates, employment, costs, confidence, and sector conditions to practical planning without pretending to predict the future." }
      ]
    },
    {
      startDate: "2026-05-18",
      theme: "Leadership Creates Direction Before Expansion",
      imageClass: "leadership",
      articles: [
        { category: "Leadership", title: "Leadership Creates Direction Before Expansion", file: "article-leadership.html", summary: "A practical guide to defining purpose, decision rights, priorities, and review systems before a company adds more complexity." },
        { category: "Decision Leadership", title: "Why Clear Decision Rights Strengthen Leadership", file: "article-decision-rights.html", summary: "See how explicit authority, escalation paths, and documented decisions reduce delay while preserving accountability." },
        { category: "Leadership Communication", title: "How Leadership Communication Turns Direction Into Action", file: "article-leadership-communication.html", summary: "Translate strategy into consistent priorities, operating language, and feedback loops that teams can use every day." },
        { category: "Expansion Readiness", title: "The Leadership Checklist for Responsible Expansion", file: "article-expansion-readiness.html", summary: "Evaluate ownership, capacity, controls, customer impact, and financial resilience before opening a new growth lane." }
      ]
    },
    {
      startDate: "2026-05-25",
      theme: "Financial Awareness Through Organized Information",
      imageClass: "financial",
      articles: [
        { category: "Financial Awareness", title: "Financial Awareness Starts With Organized Information", file: "article-financial-awareness.html", summary: "A structured guide to turning accurate records, reporting rhythms, and financial context into better operating decisions." },
        { category: "Cash Flow", title: "How to Read Cash Flow as an Operating Signal", file: "article-cash-flow-signal.html", summary: "Understand how timing, working capital, commitments, and cash movement reveal pressure and opportunity inside daily operations." },
        { category: "Business Reporting", title: "Building a Financial Reporting Rhythm Leaders Can Use", file: "article-reporting-rhythm.html", summary: "Create a practical reporting cadence that connects reliable numbers with ownership, review, explanation, and action." },
        { category: "Financial Records", title: "Why Clean Financial Records Protect Future Growth", file: "article-clean-financial-records.html", summary: "Learn why consistent classifications, source documents, reconciliations, and access controls matter before growth increases complexity." }
      ]
    },
    {
      startDate: "2026-06-01",
      theme: "Clear Business Lanes Support Responsible Growth",
      imageClass: "growth",
      articles: [
        { category: "Company Growth", title: "Growth Works Better With Clear Business Lanes", file: "article-company-growth.html", summary: "A practical research guide to organizing services, audiences, ownership, and operating capacity into clear business lanes that support responsible growth." },
        { category: "Business Ownership", title: "How Clear Ownership Keeps Growth Accountable", file: "article-growth-ownership.html", summary: "Define who owns outcomes, standards, resources, and escalation so expanding work does not become unassigned work." },
        { category: "Capacity Planning", title: "Why Capacity Planning Must Come Before Expansion", file: "article-capacity-before-expansion.html", summary: "Compare demand with people, systems, time, service limits, and financial resilience before committing to a larger operating footprint." },
        { category: "Operating Systems", title: "Better Handoffs Make Business Growth More Reliable", file: "article-reliable-handoffs.html", summary: "Design clear transfers of information and responsibility so customers receive consistent service as teams and business lanes expand." }
      ]
    },
    {
      startDate: "2026-06-08",
      theme: "Business Structure Creates Long-Term Power",
      imageClass: "structure",
      articles: [
        { category: "Business Structure", title: "How Business Structure Creates Long-Term Power", file: "article-business-structure.html", summary: "Learn how clear ownership, responsibilities, information, and decision paths help a company grow with order and earn long-term trust." },
        { category: "Company Growth", title: "Why Clear Business Lanes Help Companies Grow", file: "article-clear-business-lanes.html", summary: "See how defined companies, departments, services, and customer paths reduce confusion and make expansion easier to manage." },
        { category: "Business Systems", title: "How Organized Information Builds Trust and Better Decisions", file: "article-organized-information.html", summary: "Discover why clear records, purposeful web pages, accountable workflows, and organized reporting support confident decisions and future growth." },
        { category: "Business Systems", title: "Why Strong Systems Protect Long-Term Company Growth", file: "article-strong-systems-growth.html", summary: "Understand how repeatable workflows, controls, review cycles, and durable operating knowledge protect a growing company from avoidable disorder." }
      ]
    }
  ];

  collections.forEach((collection) => {
    if (!collection.theme || !collection.startDate || collection.articles.length < 4) {
      throw new Error(`Weekly article collection ${collection.startDate || "without a date"} must include a theme, start date, and at least four articles.`);
    }
  });

  const parseLocalDate = (value) => new Date(value + "T00:00:00");
  const formatDate = (value) => parseLocalDate(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const getCurrentCollection = (today = new Date()) => collections.filter((collection) => parseLocalDate(collection.startDate) <= today).at(-1) || null;

  window.TitanCoreArticles = { collections, getCurrentCollection, formatDate };

  function articleCard(article, collection) {
    const date = formatDate(collection.startDate);
    return `<article class="article-card metal">
      <div class="article-card-image image-${collection.imageClass}" role="img" aria-label="${article.category} article image"></div>
      <div class="article-card-content">
        <div class="category">${article.category}</div>
        <h3>${article.title}</h3>
        <div class="article-meta"><time datetime="${collection.startDate}">${date}</time><span>Weekly Article</span></div>
        <p>${article.summary}</p>
        <div class="btn-row"><a class="btn" href="${article.file}">Read Article <span class="arrow">›</span></a></div>
      </div>
    </article>`;
  }

  function renderArchive() {
    const currentRoot = document.getElementById("currentArticleCollection");
    const archiveRoot = document.getElementById("pastArticleCollections");
    if (!currentRoot || !archiveRoot) return;
    const current = getCurrentCollection();
    if (!current) {
      currentRoot.innerHTML = "<p>No weekly collection has started yet.</p>";
      return;
    }
    currentRoot.innerHTML = `<div class="collection-heading"><div><div class="eyebrow">Week of ${formatDate(current.startDate)}</div><h2 id="currentCollectionTitle">This Week’s Article Collection</h2></div><p>${current.theme}</p></div><div class="article-grid">${current.articles.map((article) => articleCard(article, current)).join("")}</div>`;
    const past = collections.filter((collection) => parseLocalDate(collection.startDate) < parseLocalDate(current.startDate)).reverse();
    archiveRoot.innerHTML = past.map((collection) => `<section class="archive-week" aria-labelledby="week-${collection.startDate}"><div class="collection-heading compact"><div><div class="eyebrow">Week of ${formatDate(collection.startDate)}</div><h3 id="week-${collection.startDate}">${collection.theme}</h3></div><p>Four-part weekly article collection</p></div><div class="article-grid archive-grid">${collection.articles.map((article) => articleCard(article, collection)).join("")}</div></section>`).join("");
  }

  function renderHomepagePreview() {
    const root = document.getElementById("weeklyArticlePreview");
    if (!root) return;
    const current = getCurrentCollection();
    if (!current) return;
    const main = current.articles[0];
    root.querySelector(".eyebrow").textContent = current.theme;
    root.querySelector("h2").textContent = main.title;
    root.querySelector(".homepage-article-meta span:first-child").textContent = formatDate(current.startDate);
    root.querySelector("p").textContent = main.summary;
    root.querySelector("a.btn.primary").href = main.file;
  }

  renderArchive();
  renderHomepagePreview();
})();
