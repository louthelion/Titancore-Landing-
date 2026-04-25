// TitanCore Public Website Script
// Public website only. No dashboard code.

// Mobile menu
function toggleMenu() {
  const nav = document.querySelector(".nav");
  if (nav) {
    nav.classList.toggle("show");
  }
}

// Button click effect
document.addEventListener("click", function (event) {
  const button = event.target.closest(".btn");

  if (button) {
    button.classList.add("clicked");

    setTimeout(function () {
      button.classList.remove("clicked");
    }, 250);
  }
});

// Show today's date on homepage
function updateTodayDate() {
  const dateBox = document.getElementById("todayDate");

  if (!dateBox) return;

  const now = new Date();

  dateBox.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

// Homepage country business preview
function openCountryBusiness() {
  const countrySelect = document.getElementById("countrySelect");
  const resultBox = document.getElementById("countryResult");

  if (!countrySelect || !resultBox) return;

  const country = countrySelect.value || "United States";

  resultBox.innerHTML = `
    <div class="panel" style="box-shadow:none;margin-top:18px;">
      <h2>${country} Business Intelligence</h2>

      <p>
        This country page is for business-only information about ${country}.
        It focuses on economy, business news, stock market, major industries,
        major companies, finance, banking, real estate, trade, and business opportunities.
      </p>

      <div class="grid cols-2">
        <div class="card" style="min-height:auto;">
          <h3>${country} Business News</h3>
          <p>
            Business headlines, company movement, industry updates, finance,
            banking, real estate, trade, jobs, and economic direction.
          </p>
          <span class="badge green">Business Only</span>
        </div>

        <div class="card" style="min-height:auto;">
          <h3>${country} Stock Market</h3>
          <p>
            Country stock index, public companies, market movement,
            currency, investor confidence, and sector watch information.
          </p>
          <span class="badge green">Market Watch</span>
        </div>

        <div class="card" style="min-height:auto;">
          <h3>${country} Major Industries</h3>
          <p>
            Finance, real estate, healthcare, technology, energy, logistics,
            tourism, manufacturing, agriculture, and business services.
          </p>
          <span class="badge green">Industries</span>
        </div>

        <div class="card" style="min-height:auto;">
          <h3>${country} Business Opportunities</h3>
          <p>
            Public research about growing sectors, business risks,
            market direction, company expansion, and economic opportunity areas.
          </p>
          <span class="badge green">Research</span>
        </div>
      </div>

      <p class="notice">
        Country-level business intelligence only. No forced state, county, or city drill-down.
        Live data will require approved APIs or licensed business data sources.
      </p>
    </div>
  `;
}

// Global Business News country search
function openGlobalCountry() {
  const countrySelect = document.getElementById("globalCountrySelect");
  const resultBox = document.getElementById("globalCountryResult");

  if (!countrySelect || !resultBox) return;

  const country = countrySelect.value || "United States";

  resultBox.innerHTML = `
    <div class="panel" style="box-shadow:none;margin-top:18px;">
      <h2>${country} Business News & Market Intelligence</h2>

      <p>
        This is a country-level business overview for ${country}. It focuses on business news,
        stock market activity, major industries, major companies, banking, finance, real estate,
        trade, currency, business risks, and business opportunities.
      </p>

      <div class="grid cols-3">
        <div class="card">
          <h3>${country} Business News</h3>
          <p>
            Business headlines, company moves, expansion, layoffs, earnings,
            banking updates, industry news, and economic direction.
          </p>
          <span class="badge green">Business Only</span>
        </div>

        <div class="card">
          <h3>${country} Stock Market</h3>
          <p>
            Country index, public companies, top movers, market direction,
            investor sentiment, and sector performance.
          </p>
          <span class="badge green">Stock Market</span>
        </div>

        <div class="card">
          <h3>${country} Major Companies</h3>
          <p>
            Large public companies, national employers, major private groups,
            growing companies, and business anchors.
          </p>
          <span class="badge green">Companies</span>
        </div>

        <div class="card">
          <h3>${country} Major Industries</h3>
          <p>
            Finance, real estate, healthcare, technology, manufacturing,
            transportation, energy, tourism, and business services.
          </p>
          <span class="badge green">Industries</span>
        </div>

        <div class="card">
          <h3>${country} Banking & Finance</h3>
          <p>
            Banking conditions, lending environment, interest rate pressure,
            funding access, capital movement, and business credit.
          </p>
          <span class="badge green">Finance</span>
        </div>

        <div class="card">
          <h3>${country} Business Opportunities</h3>
          <p>
            Growing sectors, public market trends, underserved needs,
            expansion areas, and business opportunity notes.
          </p>
          <span class="badge green">Opportunities</span>
        </div>
      </div>

      <p class="notice">
        Country-level only. No forced state, county, or city drill-down.
        Live data will require approved APIs, licensed data providers, or properly attributed public sources.
      </p>
    </div>
  `;
}

// Business Intelligence Book country search
function openBookCountry() {
  const countrySelect = document.getElementById("bookCountrySelect");
  const resultBox = document.getElementById("bookCountryResult");

  if (!countrySelect || !resultBox) return;

  const country = countrySelect.value || "United States";

  resultBox.innerHTML = `
    <div class="panel" style="box-shadow:none;margin-top:18px;">
      <h2>${country} Business Intelligence</h2>

      <p>
        This is a country-level business view for ${country}. It focuses on business news,
        the stock market, major companies, major industries, banking, finance, real estate,
        trade, currency, business risks, and business opportunities.
      </p>

      <div class="grid cols-3">
        <div class="card">
          <h3>${country} Business News</h3>
          <p>
            Business-only headlines, company movement, industry activity,
            banking, finance, trade, real estate, and economy.
          </p>
          <span class="badge green">Business Only</span>
        </div>

        <div class="card">
          <h3>${country} Stock Market</h3>
          <p>
            Market index, public companies, sector movement,
            investor confidence, and market direction.
          </p>
          <span class="badge green">Stock Market</span>
        </div>

        <div class="card">
          <h3>${country} Major Companies</h3>
          <p>
            Public companies, major employers, national brands,
            important industries, and business anchors.
          </p>
          <span class="badge green">Companies</span>
        </div>

        <div class="card">
          <h3>${country} Economy</h3>
          <p>
            Jobs, inflation, interest rates, currency, growth pressure,
            business confidence, and economic direction.
          </p>
          <span class="badge green">Economy</span>
        </div>

        <div class="card">
          <h3>${country} Banking & Finance</h3>
          <p>
            Lending conditions, banks, business credit, capital movement,
            funding access, and financial sector direction.
          </p>
          <span class="badge green">Finance</span>
        </div>

        <div class="card">
          <h3>${country} Opportunities & Risks</h3>
          <p>
            Growing sectors, business demand, market risks,
            regulation pressure, currency risk, and sector weakness.
          </p>
          <span class="badge green">Research</span>
        </div>
      </div>

      <p class="notice">
        Country-level only. No forced city/county/state drill-down.
      </p>
    </div>
  `;
}

// Optional local business search inside Business Intelligence Book
function openLocalBusiness() {
  const stateInput = document.getElementById("localState");
  const cityInput = document.getElementById("localCity");
  const resultBox = document.getElementById("localBusinessResult");

  if (!stateInput || !cityInput || !resultBox) return;

  const state = stateInput.value.trim() || "Florida";
  const city = cityInput.value.trim() || "Orlando";

  resultBox.innerHTML = `
    <div class="panel" style="box-shadow:none;margin-top:18px;">
      <h2>${city}, ${state} Local Business Intelligence</h2>

      <p>
        This is an optional local business view. It can show local business openings,
        real estate movement, tourism, jobs, construction, major employers,
        stock connections, and business opportunity notes.
      </p>

      <div class="grid cols-3">
        <div class="card">
          <h3>${city} Business Pulse</h3>
          <p>
            New businesses, local company movement, commercial areas,
            restaurants, services, and local economic activity.
          </p>
          <span class="badge green">Local</span>
        </div>

        <div class="card">
          <h3>${city} Real Estate</h3>
          <p>
            Housing, rentals, commercial property, development,
            construction, and property management demand.
          </p>
          <span class="badge green">Real Estate</span>
        </div>

        <div class="card">
          <h3>${city} Market Opportunity</h3>
          <p>
            Local demand, growing sectors, tourism, jobs,
            business services, and public opportunity notes.
          </p>
          <span class="badge green">Opportunity</span>
        </div>
      </div>

      <p class="notice">
        Optional local view only. Global Business News remains country-level.
      </p>
    </div>
  `;
}

// Stock symbol demo search
function runStockSearch() {
  const stockInput = document.getElementById("stockSearch");
  const resultBox = document.getElementById("stockResult");

  if (!stockInput || !resultBox) return;

  const symbol = stockInput.value.trim().toUpperCase() || "AAPL";

  resultBox.innerHTML = `
    <div class="panel" style="box-shadow:none;margin-top:18px;">
      <h2>${symbol} Stock Watch</h2>

      <p>
        This is a public demo stock research block. Later, this can connect to a live market data API
        to show price, chart, company data, sector, market cap, news, and financial information.
      </p>

      <div class="grid cols-3">
        <div class="card">
          <h3>${symbol} Overview</h3>
          <p>
            Company name, ticker, market, exchange, sector, price movement,
            and watchlist status.
          </p>
          <span class="badge green">Demo</span>
        </div>

        <div class="card">
          <h3>${symbol} Business News</h3>
          <p>
            Business-only company headlines, earnings, expansion, leadership,
            product movement, and market activity.
          </p>
          <span class="badge green">Business News</span>
        </div>

        <div class="card">
          <h3>${symbol} Sector Movement</h3>
          <p>
            How this company connects to its sector, industry, market direction,
            and broader business conditions.
          </p>
          <span class="badge green">Sector</span>
        </div>
      </div>

      <table class="table" style="margin-top:18px;">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Status</th>
            <th>Data Type</th>
            <th>Notice</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>${symbol}</td>
            <td><span class="badge green">Watchlist</span></td>
            <td>Demo placeholder</td>
            <td>Informational only</td>
          </tr>
        </tbody>
      </table>

      <p class="notice">
        This is not financial advice, investment advice, trading advice, or a recommendation to buy or sell securities.
      </p>
    </div>
  `;
}

// Contact form helper
// Important: We do NOT block Netlify form submission.
// The form will submit normally if hosted on Netlify.
function preparePublicForms() {
  const forms = document.querySelectorAll("form[data-netlify='true']");

  forms.forEach(function (form) {
    form.addEventListener("submit", function () {
      const button = form.querySelector("button[type='submit']");

      if (button) {
        button.textContent = "Submitting...";
        button.disabled = true;
      }
    });
  });
}

// Close mobile menu after clicking a link
function closeMenuAfterClick() {
  const nav = document.querySelector(".nav");

  if (!nav) return;

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("show");
    });
  });
}

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
  updateTodayDate();
  preparePublicForms();
  closeMenuAfterClick();
});
