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

async function loadSeries(id) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(id)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "TitanCoreBusinessSignals/1.0" }
  });

  if (!response.ok) {
    throw new Error(`FRED series ${id} returned ${response.status}`);
  }

  return parseFredCsv(await response.text());
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
    const [treasury, cpi, wti] = await Promise.all([
      loadSeries(SERIES.dgs10.id),
      loadSeries(SERIES.cpi.id),
      loadSeries(SERIES.wti.id)
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        updatedAt: new Date().toISOString(),
        signals: {
          dgs10: latestSignal(treasury, "U.S. Treasury via FRED"),
          cpiyoy: cpiYearOverYear(cpi),
          wti: latestSignal(wti, "U.S. Energy Information Administration via FRED")
        }
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
