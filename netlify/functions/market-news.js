const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=900"
};

const NEWS_TOPICS = {
  global: {
    label: "Global News",
    query: "global business economy markets news"
  },
  business: {
    label: "Business / Stock Market",
    query: "business news stock market economy today"
  },
  crypto: {
    label: "Bitcoin / Crypto",
    query: "Bitcoin crypto market news today"
  },
  oil: {
    label: "Oil / Energy",
    query: "oil energy prices business news today"
  },
  realestate: {
    label: "Real Estate / Economy",
    query: "real estate economy mortgage housing market news"
  }
};

function clean(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function getTag(xml, tag) {
  const safeTag = tag.replace(":", "\\:");
  const match = xml.match(new RegExp(`<${safeTag}[^>]*>([\\s\\S]*?)<\\/${safeTag}>`, "i"));
  return match ? clean(match[1]) : "";
}

function getItems(xml) {
  const matches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

  return matches.map(item => {
    return {
      title: getTag(item, "title"),
      link: getTag(item, "link"),
      pubDate: getTag(item, "pubDate"),
      source: getTag(item, "source") || "Public News Source",
      summary: getTag(item, "description")
    };
  }).filter(item => item.title && item.link);
}

function dateNumber(dateKey) {
  const parts = String(dateKey || "").split("-");
  if (parts.length === 3) {
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    return Math.floor(new Date(y, m, d).getTime() / 86400000);
  }

  const now = new Date();
  return Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
}

function modeOffset(mode) {
  if (mode === "afternoon") return 7;
  if (mode === "evening") return 14;
  return 0;
}

function rotate(items, count, offset) {
  if (!items.length) return [];

  const output = [];
  for (let i = 0; i < Math.min(count, items.length); i++) {
    output.push(items[(offset + i) % items.length]);
  }

  return output;
}

async function fetchTopic(key, topic, dateKey, mode, index, count) {
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(topic.query) +
    "&hl=en-US&gl=US&ceid=US:en";

  const response = await fetch(url, {
    headers: {
      "User-Agent": "TitanCoreMarketNewsDesk/1.0"
    }
  });

  if (!response.ok) {
    throw new Error("Could not load " + topic.label);
  }

  const xml = await response.text();
  const items = getItems(xml);

  const offset =
    (dateNumber(dateKey) + modeOffset(mode) + index * 3) % Math.max(items.length, 1);

  return {
    key,
    label: topic.label,
    items: rotate(items, count, offset)
  };
}

exports.handler = async function(event) {
  try {
    const dateKey = event.queryStringParameters?.day || "";
    const mode = event.queryStringParameters?.mode || "morning";
    const small = event.queryStringParameters?.small === "1";
    const count = small ? 1 : 4;

    const sections = await Promise.all(
      Object.entries(NEWS_TOPICS).map(([key, topic], index) =>
        fetchTopic(key, topic, dateKey, mode, index, count)
      )
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        mode,
        dateKey,
        updatedAt: new Date().toISOString(),
        sections
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: false,
        error: error.message || "Market News Desk is updating.",
        sections: []
      })
    };
  }
};
