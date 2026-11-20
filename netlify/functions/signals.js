const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600"
};

const SERIES = {
  dgs10: { id: "DGS10", label: "10-Year Treasury Rate" },
  cpi: { id: "CPIAUCSL", label: "Consumer Price Index" },
  wti: { id: "DCOILWTICO", label: "WTI Crude Oil" }
};

function recentStartDate(now = new Date()) {
  const start = new Date(Date.UTC(
    now.getUTCFullYear() - 2,
    now.getUTCMonth(),
    now.getUTCDate()
  ));

  return start.toISOString().slice(0, 10);
}

function parseFredCsv(csv) {
  return csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map(line => {
      const [date, rawValue] = line.split(",");
      const value = Number(rawValue);
      return { date, value };
    })
    .filter(point => point.date && Number.isFinite(point.value));
}

/*
 * FRED fetch hardening (2026-11-20): /api/signals was returning 503 in
 * production even though the fredgraph.csv URLs answer normally from
 * outside the function runtime — the handler only sends 503 when ALL
 * three series fail, so every runtime fetch was failing together. The
 * bare custom user agent below is the kind of header FRED's edge layer
 * is known to reject from datacenter egress, and a single transient
 * failure per series was enough to sink the whole snapshot. Fixes:
 * browser-compatible user agent, one retry with a short backoff per
 * series, and a longer per-attempt timeout. Partial data still returns
 * 200 (see handler); 503 remains only when every series truly fails.
 */
const FRED_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/126.0.0.0 Safari/537.36 TitanCoreBusinessSignals/1.0";

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSeriesCsv(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  let response;

  try {
    response = await fetch(url, {
      headers: {
        "Accept": "text/csv, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": FRED_USER_AGENT
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`FRED request returned ${response.status}`);
  }

  return response.text();
}

async function loadSeries(id) {
  const params = new URLSearchParams({
    id,
    cosd: recentStartDate()
  });
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?${params}`;

  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const points = parseFredCsv(await fetchSeriesCsv(url));
      if (!points.length) {
        throw new Error(`FRED series ${id} returned no data points`);
      }
      return points;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await wait(600);
    }
  }

  throw lastError || new Error(`FRED series ${id} failed`);
}

function latestSignal(points, source) {
  const latest = points.at(-1);
  const previous = points.at(-2);

  if (!latest) return null;

  return {
    value: latest.value,
    delta: previous ? latest.value - previous.value : null,
    asOf: latest.date,
    source
  };
}

function cpiYearOverYear(points) {
  const latest = points.at(-1);
  const comparisonDate = latest && new Date(`${latest.date}T00:00:00Z`);

  if (!latest || !comparisonDate) return null;

  comparisonDate.setUTCFullYear(comparisonDate.getUTCFullYear() - 1);
  const yearAgoKey = comparisonDate.toISOString().slice(0, 7);
  const yearAgo = points.find(point => point.date.startsWith(yearAgoKey));

  if (!yearAgo) return null;

  const value = ((latest.value / yearAgo.value) - 1) * 100;
  const previous = points.at(-2);
  let delta = null;

  if (previous) {
    const previousDate = new Date(`${previous.date}T00:00:00Z`);
    previousDate.setUTCFullYear(previousDate.getUTCFullYear() - 1);
    const previousYearAgoKey = previousDate.toISOString().slice(0, 7);
    const previousYearAgo = points.find(point => point.date.startsWith(previousYearAgoKey));

    if (previousYearAgo) {
      const previousValue = ((previous.value / previousYearAgo.value) - 1) * 100;
      delta = value - previousValue;
    }
  }

  return {
    value,
    delta,
    asOf: latest.date,
    source: "U.S. Bureau of Labor Statistics via FRED"
  };
}

exports.handler = async function() {
  try {
    const results = await Promise.allSettled([
      loadSeries(SERIES.dgs10.id),
      loadSeries(SERIES.cpi.id),
      loadSeries(SERIES.wti.id)
    ]);
    const [treasury, cpi, wti] = results.map(result =>
      result.status === "fulfilled" ? result.value : []
    );
    const signals = {
      dgs10: latestSignal(treasury, "U.S. Treasury via FRED"),
      cpiyoy: cpiYearOverYear(cpi),
      wti: latestSignal(wti, "U.S. Energy Information Administration via FRED")
    };

    if (!Object.values(signals).some(Boolean)) {
      throw new Error("All signal providers failed");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        updatedAt: new Date().toISOString(),
        signals
      })
    };
  } catch (error) {
    return {
      statusCode: 503,
      headers: { ...headers, "Cache-Control": "no-store" },
      body: JSON.stringify({
        ok: false,
        error: "Current economic signals are temporarily unavailable."
      })
    };
  }
};
