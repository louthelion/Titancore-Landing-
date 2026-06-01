const ALLOWED_PODCASTS = {
  "201853034": "Marketplace Business",
  "73330130": "Marketplace Morning Report",
  "290783428": "Planet Money",
  "1123922160": "Unchained Crypto",
  "663379413": "The Energy Gang",
  "152022135": "HBR IdeaCast",
  "1227971746": "Masters of Scale"
};

const responseHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=1800"
};

function decodeXml(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function getTag(xml, tag) {
  const escapedTag = tag.replace(":", "\\:");
  const regex = new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, "i");
  const match = xml.match(regex);
  return match ? decodeXml(match[1]) : "";
}

function getAttr(xml, tag, attr) {
  const escapedTag = tag.replace(":", "\\:");
  const regex = new RegExp(`<${escapedTag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, "i");
  const match = xml.match(regex);
  return match ? decodeXml(match[1]) : "";
}

function getLatestItem(feedXml) {
  const itemMatch = feedXml.match(/<item[\s\S]*?<\/item>/i);
  if (itemMatch) return itemMatch[0];

  const entryMatch = feedXml.match(/<entry[\s\S]*?<\/entry>/i);
  if (entryMatch) return entryMatch[0];

  return "";
}

exports.handler = async function(event) {
  try {
    const id = event.queryStringParameters?.id || "201853034";

    if (!ALLOWED_PODCASTS[id]) {
      return {
        statusCode: 400,
        headers: responseHeaders,
        body: JSON.stringify({ error: "Podcast not allowed." })
      };
    }

    const lookupUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}`;
    const lookupResponse = await fetch(lookupUrl);

    if (!lookupResponse.ok) {
      throw new Error("Could not reach the podcast lookup service.");
    }

    const lookupData = await lookupResponse.json();
    const show = lookupData.results && lookupData.results[0];

    if (!show || !show.feedUrl) {
      throw new Error("No podcast feed found.");
    }

    const feedResponse = await fetch(show.feedUrl);

    if (!feedResponse.ok) {
      throw new Error("Could not load the podcast feed.");
    }

    const feedXml = await feedResponse.text();
    const item = getLatestItem(feedXml);

    if (!item) {
      throw new Error("No latest episode found.");
    }

    const audioUrl =
      getAttr(item, "enclosure", "url") ||
      getAttr(item, "media:content", "url");

    if (!audioUrl) {
      throw new Error("No playable audio file found in the latest episode.");
    }

    const result = {
      showTitle: show.collectionName || ALLOWED_PODCASTS[id],
      episodeTitle: getTag(item, "title") || "Latest Episode",
      description:
        getTag(item, "itunes:summary") ||
        getTag(item, "description") ||
        "Latest public business audio episode.",
      audioUrl,
      image:
        getAttr(item, "itunes:image", "href") ||
        show.artworkUrl600 ||
        show.artworkUrl100 ||
        "",
      sourceUrl: show.collectionViewUrl || "",
      feedUrl: show.feedUrl
    };

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({
        error: error.message || "Audio feed failed."
      })
    };
  }
};
