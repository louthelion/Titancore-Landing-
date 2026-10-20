(function () {
  "use strict";

  const DAY_MS = 86400000;
  const STORAGE_KEY = "titancore-media-archive-v2";
  const ANCHOR_DATE = "2026-06-06";

  const dailyHomepageVideos = [
    {
      dayNumber: 0,
      title: "Market Video of the Day",
      subject: "What it means to buy a company's stock",
      description: "A Khan Academy lesson explaining stock ownership and what it means to buy shares in a company.",
      category: "Market & Stock",
      videoId: "98qfFzqDKR8",
      sourceUrl: "https://www.youtube.com/watch?v=98qfFzqDKR8",
      archiveId: "homepage-market-video"
    },
    {
      dayNumber: 1,
      title: "Entrepreneurship Video of the Day",
      subject: "Don’t Pitch, Test: The Lean Startup Method For Smarter Startups",
      description: "A Think Fast Talk Smart discussion about testing startup ideas and the lean startup method.",
      category: "Entrepreneurship / Business Growth",
      videoId: "EulhKrrfMnw",
      sourceUrl: "https://www.youtube.com/watch?v=EulhKrrfMnw",
      archiveId: "homepage-global-markets-video"
    },
    {
      dayNumber: 2,
      title: "Digital Assets Video of the Day",
      subject: "Demystifying the Wild World of Crypto - Laura Shin",
      description: "An archival TED talk by Laura Shin introducing the world of cryptocurrency.",
      category: "Bitcoin & Crypto",
      videoId: "pVZzgzYZdCA",
      sourceUrl: "https://www.youtube.com/watch?v=pVZzgzYZdCA",
      archiveId: "homepage-digital-assets-video"
    },
    {
      dayNumber: 3,
      title: "Finance Video of the Day",
      subject: "Introduction to bonds",
      description: "A Khan Academy lesson introducing bonds and how borrowing through bonds works.",
      category: "Finance Education",
      videoId: "Qh-M3_L4xYk",
      sourceUrl: "https://www.youtube.com/watch?v=Qh-M3_L4xYk",
      archiveId: "homepage-finance-video"
    },
    {
      dayNumber: 4,
      title: "Energy Video of the Day",
      subject: "A 40-year plan for energy - Amory Lovins",
      description: "An archival TED-Ed talk by Amory Lovins on energy efficiency, innovation, and the business case for reducing oil and coal use.",
      category: "Oil & Energy",
      videoId: "PQqv8cWWV2U",
      sourceUrl: "https://www.youtube.com/watch?v=PQqv8cWWV2U",
      archiveId: "homepage-energy-video"
    },
    {
      dayNumber: 5,
      title: "Entrepreneurship Video of the Day",
      subject: "The single biggest reason why start-ups succeed - Bill Gross",
      description: "An archival TED talk by Bill Gross about factors associated with startup success.",
      category: "Entrepreneurship / Business Growth",
      videoId: "bNpx7gpSqbY",
      sourceUrl: "https://www.youtube.com/watch?v=bNpx7gpSqbY",
      archiveId: "homepage-economy-video"
    },
    {
      dayNumber: 6,
      title: "Leadership Video of the Day",
      subject: "Why good leaders make you feel safe - Simon Sinek",
      description: "An archival TED talk by Simon Sinek about leadership, trust, and feeling safe at work.",
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
        {
          subject: "What it means to buy a company's stock",
          videoId: "98qfFzqDKR8",
          description: "A Khan Academy lesson explaining stock ownership and what it means to buy shares in a company.",
          sourceLink: "https://www.youtube.com/watch?v=98qfFzqDKR8"
        }
      ]
    },
    {
      category: "Bitcoin & Crypto",
      type: "video",
      items: [
        {
          subject: "Demystifying the Wild World of Crypto - Laura Shin",
          videoId: "pVZzgzYZdCA",
          description: "An archival TED talk by Laura Shin introducing the world of cryptocurrency.",
          sourceLink: "https://www.youtube.com/watch?v=pVZzgzYZdCA"
        }
      ]
    },
    {
      category: "Oil & Energy",
      type: "video",
      items: [
        {
          subject: "A 40-year plan for energy - Amory Lovins",
          videoId: "PQqv8cWWV2U",
          description: "An archival TED-Ed talk on energy efficiency, innovation, and the business case for reducing oil and coal use.",
          sourceLink: "https://www.youtube.com/watch?v=PQqv8cWWV2U"
        }
      ]
    },
    {
      category: "Real Estate & Economy",
      type: "video",
      items: [
        {
          subject: "The housing price conundrum",
          videoId: "8IR5LefXVPY",
          description: "An archival Khan Academy lesson examining the U.S. housing price increases of 2000–2006.",
          sourceLink: "https://www.youtube.com/watch?v=8IR5LefXVPY"
        }
      ]
    },
    {
      category: "Auto & Marine Business",
      type: "video",
      items: [
        {
          subject: "Inside the secret shipping industry - Rose George",
          videoId: "j7RsRnYlz7I",
          description: "An archival TED talk by Rose George about container shipping, global trade, and life at sea.",
          sourceLink: "https://www.youtube.com/watch?v=j7RsRnYlz7I"
        }
      ]
    },
    {
      category: "Finance Education",
      type: "video",
      items: [
        {
          subject: "Introduction to bonds",
          videoId: "Qh-M3_L4xYk",
          description: "A Khan Academy lesson introducing bonds and how borrowing through bonds works.",
          sourceLink: "https://www.youtube.com/watch?v=Qh-M3_L4xYk"
        },
        {
          subject: "Introduction to interest",
          videoId: "GtaoP0skPWc",
          description: "A Khan Academy lesson introducing interest on borrowed money.",
          sourceLink: "https://www.youtube.com/watch?v=GtaoP0skPWc"
        }
      ]
    },
    {
      category: "Leadership / Business Growth",
      type: "video",
      items: [
        {
          subject: "Why good leaders make you feel safe - Simon Sinek",
          videoId: "lmyZMtPVodo",
          description: "An archival TED talk by Simon Sinek about leadership, trust, and feeling safe at work.",
          sourceLink: "https://www.youtube.com/watch?v=lmyZMtPVodo"
        }
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

