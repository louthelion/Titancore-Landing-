(function () {
  "use strict";

  const DAY_MS = 86400000;
  const STORAGE_KEY = "titancore-media-archive-v2";
  const ANCHOR_DATE = "2026-06-06";

  const dailyHomepageVideos = [
    {
      dayNumber: 0,
      title: "Market Video of the Day",
      subject: "Understanding Stock Market Movement",
      description: "A public business video about stocks, companies, and the market signals shaping financial decisions.",
      category: "Market & Stock",
      videoId: "98qfFzqDKR8",
      sourceUrl: "https://www.youtube.com/watch?v=98qfFzqDKR8",
      archiveId: "homepage-market-video"
    },
    {
      dayNumber: 1,
      title: "Global Markets Video of the Day",
      subject: "Reading Global Market Signals",
      description: "A daily public briefing on global positioning, investor sentiment, and changing business conditions.",
      category: "Global Markets",
      videoId: "EulhKrrfMnw",
      sourceUrl: "https://www.youtube.com/watch?v=EulhKrrfMnw",
      archiveId: "homepage-global-markets-video"
    },
    {
      dayNumber: 2,
      title: "Digital Assets Video of the Day",
      subject: "Bitcoin, Blockchain, and Digital Asset Awareness",
      description: "A public business video covering digital assets, market cycles, adoption, and responsible risk awareness.",
      category: "Bitcoin & Crypto",
      videoId: "pVZzgzYZdCA",
      sourceUrl: "https://www.youtube.com/watch?v=pVZzgzYZdCA",
      archiveId: "homepage-digital-assets-video"
    },
    {
      dayNumber: 3,
      title: "Finance Video of the Day",
      subject: "Building Stronger Everyday Financial Decisions",
      description: "A daily public finance video about money, credit, capital, budgeting, and practical decision-making.",
      category: "Finance Education",
      videoId: "Qh-M3_L4xYk",
      sourceUrl: "https://www.youtube.com/watch?v=Qh-M3_L4xYk",
      archiveId: "homepage-finance-video"
    },
    {
      dayNumber: 4,
      title: "Energy Video of the Day",
      subject: "Oil, Energy, and the Business Cost Chain",
      description: "A public business video connecting energy supply, commodities, production, and operating costs.",
      category: "Oil & Energy",
      videoId: "GtaoP0skPWc",
      sourceUrl: "https://www.youtube.com/watch?v=GtaoP0skPWc",
      archiveId: "homepage-energy-video"
    },
    {
      dayNumber: 5,
      title: "Economy Video of the Day",
      subject: "Housing, Interest Rates, and Economic Pressure",
      description: "A daily public economy video about housing, property, interest rates, and changing economic conditions.",
      category: "Real Estate & Economy",
      videoId: "bNpx7gpSqbY",
      sourceUrl: "https://www.youtube.com/watch?v=bNpx7gpSqbY",
      archiveId: "homepage-economy-video"
    },
    {
      dayNumber: 6,
      title: "Leadership Video of the Day",
      subject: "Leadership Discipline and Sustainable Growth",
      description: "A public business video for founders, operators, teams, and leaders focused on sustainable growth.",
      category: "Leadership / Business Growth",
      videoId: "lmyZMtPVodo",
      sourceUrl: "https://www.youtube.com/watch?v=lmyZMtPVodo",
      archiveId: "homepage-leadership-video"
    }
  ];

  const dailySchedule = [
    {
      category: "Market & Stock",
      type: "video",
      items: [
        { subject: "Understanding Stock Market Movement", videoId: "98qfFzqDKR8", description: "Stocks, companies, market movement, and the signals that shape financial decisions.", sourceLink: "https://www.youtube.com/watch?v=98qfFzqDKR8" },
        { subject: "Reading Global Market Signals", videoId: "EulhKrrfMnw", description: "A different market briefing on global positioning, investor sentiment, and changing business conditions.", sourceLink: "https://www.youtube.com/watch?v=EulhKrrfMnw" }
      ]
    },
    {
      category: "Bitcoin & Crypto",
      type: "video",
      items: [
        { subject: "Bitcoin, Blockchain, and Digital Asset Awareness", videoId: "pVZzgzYZdCA", description: "Bitcoin, blockchain, digital assets, market cycles, and risk awareness.", sourceLink: "https://www.youtube.com/watch?v=pVZzgzYZdCA" },
        { subject: "Crypto Adoption and Market Risk", videoId: "Qh-M3_L4xYk", description: "A new daily crypto selection focused on adoption, volatility, custody, and responsible decisions.", sourceLink: "https://www.youtube.com/watch?v=Qh-M3_L4xYk" }
      ]
    },
    {
      category: "Oil & Energy",
      type: "video",
      items: [
        { subject: "Oil, Energy, and the Business Cost Chain", videoId: "GtaoP0skPWc", description: "Oil, gas, commodities, production, and the relationship between energy and business costs.", sourceLink: "https://www.youtube.com/watch?v=GtaoP0skPWc" },
        { subject: "Energy Supply and Price Pressure", videoId: "bNpx7gpSqbY", description: "A separate energy edition examining supply, infrastructure, pricing pressure, and operating costs.", sourceLink: "https://www.youtube.com/watch?v=bNpx7gpSqbY" }
      ]
    },
    {
      category: "Real Estate & Economy",
      type: "video",
      items: [
        { subject: "Housing, Interest Rates, and Economic Pressure", videoId: "bNpx7gpSqbY", description: "Housing, rent, property, interest rates, and changing economic conditions.", sourceLink: "https://www.youtube.com/watch?v=bNpx7gpSqbY" },
        { subject: "Property Demand and Economic Cycles", videoId: "lmyZMtPVodo", description: "Today’s alternate property briefing covers demand, affordability, investment, and economic cycles.", sourceLink: "https://www.youtube.com/watch?v=lmyZMtPVodo" }
      ]
    },
    {
      category: "Auto & Marine Business",
      type: "video",
      items: [
        { subject: "Auto, Marine, and Transportation Business Trends", videoId: "EulhKrrfMnw", description: "Automotive, marine, transportation, dealership, and marketplace trends.", sourceLink: "https://www.youtube.com/watch?v=EulhKrrfMnw" },
        { subject: "Dealership Operations and Mobility Demand", videoId: "98qfFzqDKR8", description: "A different daily mobility selection covering dealerships, service operations, demand, and transport markets.", sourceLink: "https://www.youtube.com/watch?v=98qfFzqDKR8" }
      ]
    },
    {
      category: "Finance Education",
      type: "video",
      items: [
        { subject: "Building Stronger Everyday Financial Decisions", videoId: "Qh-M3_L4xYk", description: "Money, credit, funding, capital, budgeting, and financial decision-making.", sourceLink: "https://www.youtube.com/watch?v=Qh-M3_L4xYk" },
        { subject: "Cash Flow, Credit, and Capital Planning", videoId: "pVZzgzYZdCA", description: "A new finance lesson on cash flow, credit discipline, capital planning, and resilient money habits.", sourceLink: "https://www.youtube.com/watch?v=pVZzgzYZdCA" }
      ]
    },
    {
      category: "Leadership / Business Growth",
      type: "video",
      items: [
        { subject: "Leadership Discipline and Sustainable Growth", videoId: "lmyZMtPVodo", description: "Lessons for founders, operators, teams, entrepreneurs, and long-term business growth.", sourceLink: "https://www.youtube.com/watch?v=lmyZMtPVodo" },
        { subject: "Building Accountable High-Growth Teams", videoId: "GtaoP0skPWc", description: "A different leadership edition about accountability, execution, team alignment, and sustainable scale.", sourceLink: "https://www.youtube.com/watch?v=GtaoP0skPWc" }
      ]
    },
    {
      category: "Market",
      type: "audio",
      items: [
        { subject: "Market Volatility and Business Movement", audioEmbed: "https://open.spotify.com/embed/episode/4fBvOHmYWKoY1tCVQOQw6r?utm_source=generator&theme=0", description: "A spoken market edition about stocks, companies, volatility, and business movement.", sourceLink: "https://open.spotify.com/episode/4fBvOHmYWKoY1tCVQOQw6r" },
        { subject: "Markets, Rates, and Investor Positioning", audioEmbed: "https://open.spotify.com/embed/episode/6fXh090ycLVYtgO6qcN8HX?utm_source=generator&theme=0", description: "A different audio briefing connecting rates, savings behavior, and investor positioning.", sourceLink: "https://open.spotify.com/episode/6fXh090ycLVYtgO6qcN8HX" }
      ]
    },
    {
      category: "Bitcoin & Crypto",
      type: "audio",
      items: [
        { subject: "Crypto Markets and Adoption", audioEmbed: "https://open.spotify.com/embed/episode/1JwQlQOZCY9izj1BJKdI2G?utm_source=generator&theme=0", description: "Bitcoin, crypto markets, adoption, risk, and digital assets in a spoken edition.", sourceLink: "https://open.spotify.com/episode/1JwQlQOZCY9izj1BJKdI2G" },
        { subject: "Digital Assets and Portfolio Risk", audioEmbed: "https://open.spotify.com/embed/episode/4fBvOHmYWKoY1tCVQOQw6r?utm_source=generator&theme=0", description: "An alternate crypto audio selection about digital assets, volatility, and portfolio risk.", sourceLink: "https://open.spotify.com/episode/4fBvOHmYWKoY1tCVQOQw6r" }
      ]
    },
    {
      category: "Oil & Energy",
      type: "audio",
      items: [
        { subject: "The State of U.S. Oil and Gas", audioEmbed: "https://open.spotify.com/embed/episode/2fOMGdpdKQWLFfXvFGa8B8?utm_source=generator&theme=0", description: "Oil, gas, energy policy, production, and business costs.", sourceLink: "https://open.spotify.com/episode/2fOMGdpdKQWLFfXvFGa8B8" },
        { subject: "Energy Policy and Operating Costs", audioEmbed: "https://open.spotify.com/embed/episode/6IUvRq66quGfIWGagbS7la?utm_source=generator&theme=0", description: "A different spoken energy edition linking policy, transportation, and operating costs.", sourceLink: "https://open.spotify.com/episode/6IUvRq66quGfIWGagbS7la" }
      ]
    },
    {
      category: "Real Estate & Economy",
      type: "audio",
      items: [
        { subject: "Creative Real Estate Success", audioEmbed: "https://open.spotify.com/embed/episode/4N6rwdgI6JeEVt1x75lKFz?utm_source=generator&theme=0", description: "Property, housing economics, investment, and market conditions.", sourceLink: "https://open.spotify.com/episode/4N6rwdgI6JeEVt1x75lKFz" },
        { subject: "Housing Wealth and Economic Choices", audioEmbed: "https://open.spotify.com/embed/episode/6fXh090ycLVYtgO6qcN8HX?utm_source=generator&theme=0", description: "An alternate property episode about housing wealth, savings, affordability, and economic choices.", sourceLink: "https://open.spotify.com/episode/6fXh090ycLVYtgO6qcN8HX" }
      ]
    },
    {
      category: "Auto & Marine Business",
      type: "audio",
      items: [
        { subject: "The Lead Response Crisis Hurting Dealers", audioEmbed: "https://open.spotify.com/embed/episode/6IUvRq66quGfIWGagbS7la?utm_source=generator&theme=0", description: "Automotive retail, dealership operations, marine technology, and transportation business.", sourceLink: "https://open.spotify.com/episode/6IUvRq66quGfIWGagbS7la" },
        { subject: "Transportation Teams and Customer Response", audioEmbed: "https://open.spotify.com/embed/episode/3fSTyvbTiNz4DhDC28QqD9?utm_source=generator&theme=0", description: "A different mobility audio edition on teams, customer response, and scalable operations.", sourceLink: "https://open.spotify.com/episode/3fSTyvbTiNz4DhDC28QqD9" }
      ]
    },
    {
      category: "Finance Education",
      type: "audio",
      items: [
        { subject: "Supercharging Your Savings", audioEmbed: "https://open.spotify.com/embed/episode/6fXh090ycLVYtgO6qcN8HX?utm_source=generator&theme=0", description: "Saving, investing, financial habits, and stronger everyday money decisions.", sourceLink: "https://open.spotify.com/episode/6fXh090ycLVYtgO6qcN8HX" },
        { subject: "Financial Habits for Long-Term Growth", audioEmbed: "https://open.spotify.com/embed/episode/4N6rwdgI6JeEVt1x75lKFz?utm_source=generator&theme=0", description: "A new daily finance episode on habits, investment thinking, and long-term wealth building.", sourceLink: "https://open.spotify.com/episode/4N6rwdgI6JeEVt1x75lKFz" }
      ]
    },
    {
      category: "Leadership / Business Growth",
      type: "audio",
      items: [
        { subject: "The Mindset That Makes Growth Feel Easier", audioEmbed: "https://open.spotify.com/embed/episode/3fSTyvbTiNz4DhDC28QqD9?utm_source=generator&theme=0", description: "Leadership mindset, entrepreneurship, teams, and sustainable business growth.", sourceLink: "https://open.spotify.com/episode/3fSTyvbTiNz4DhDC28QqD9" },
        { subject: "Leadership Through Market Uncertainty", audioEmbed: "https://open.spotify.com/embed/episode/1JwQlQOZCY9izj1BJKdI2G?utm_source=generator&theme=0", description: "An alternate leadership conversation about decision-making, uncertainty, and team direction.", sourceLink: "https://open.spotify.com/episode/1JwQlQOZCY9izj1BJKdI2G" }
      ]
    }
  ];

  function toDateKey(date) {
    const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
  }

  function dateFromKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function dayNumber(key) {
    return Math.floor(Date.UTC(...key.split("-").map((value, index) => Number(value) - (index === 1 ? 1 : 0))) / DAY_MS);
  }

  function slug(value) {
    return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function getHomepageVideo(dateInput) {
    const dateKey = typeof dateInput === "string" ? dateInput : toDateKey(dateInput || new Date());
    const date = dateFromKey(dateKey);
    const selected = dailyHomepageVideos[Math.abs(dayNumber(dateKey)) % dailyHomepageVideos.length];
    return {
      ...selected,
      date: dateKey,
      dateKey,
      dateLabel: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      type: "video",
      sourceLink: selected.sourceUrl,
      archiveId: `${selected.archiveId}-${dateKey}`
    };
  }

  function getDailyItems(dateInput) {
    const dateKey = typeof dateInput === "string" ? dateInput : toDateKey(dateInput || new Date());
    const date = dateFromKey(dateKey);
    const index = Math.abs(dayNumber(dateKey) - dayNumber(ANCHOR_DATE));
    const dateLabel = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    return dailySchedule.map((schedule) => {
      const selected = schedule.items[index % schedule.items.length];
      const archiveId = `${slug(schedule.category)}-${schedule.type}-${dateKey}`;
      return {
        date: dateKey,
        dateLabel,
        subject: selected.subject,
        title: selected.subject,
        category: schedule.category,
        type: schedule.type,
        videoId: selected.videoId || "",
        audioEmbed: selected.audioEmbed || "",
        description: selected.description,
        sourceLink: selected.sourceLink,
        archiveId
      };
    });
  }

  function readArchive() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch (error) { return []; }
  }

  function saveItems(items) {
    const byId = new Map(readArchive().map((item) => [item.archiveId, item]));
    items.forEach((item) => byId.set(item.archiveId, item));
    const saved = Array.from(byId.values()).sort((a, b) => b.date.localeCompare(a.date) || a.category.localeCompare(b.category));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (error) { /* Storage can be unavailable in private contexts. */ }
    return saved;
  }

  function seedArchive(days) {
    const items = [];
    const today = new Date();
    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      if (toDateKey(date) < ANCHOR_DATE) break;
      items.push(getHomepageVideo(date), ...getDailyItems(date));
    }
    return saveItems(items);
  }

  window.TitanCoreMedia = { dailyHomepageVideos, dailySchedule, getHomepageVideo, getDailyItems, readArchive, saveItems, seedArchive, toDateKey };
}());
