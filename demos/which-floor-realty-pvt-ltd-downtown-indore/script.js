/**
 * APEX PREMIER REAL ESTATE & LUXURY PROPERTIES — INTERACTIVE ENGINE
 */

let realEstateData = null;
let currentCurrency = "$";
let activePropertyFilter = "all";

document.addEventListener("DOMContentLoaded", async () => {
  await loadRealEstateData();
  setupValuationEstimator();
  setupMortgageCalculator();
  setupPropertyFilters();
  setupTabNavigation();
  setupContactForm();
});

async function loadRealEstateData() {
  try {
    const res = await fetch("./data/business.json");
    if (!res.ok) throw new Error("Could not load data/business.json");
    realEstateData = await res.json();
    currentCurrency = realEstateData.currency_symbol || "$";
    applyDataToDOM(realEstateData);
  } catch (err) {
    console.warn("Using fallback real estate state:", err);
    updateValuationDisplay();
    updateMortgageDisplay();
  }
}

function cleanBusinessName(raw, city = "") {
  if (!raw) return "Apex Premier Realty";
  let cleaned = raw;
  if (city) {
    const cityRegex = new RegExp(`\\s*[-|–—,:]\\s*${city}.*$`, 'i');
    cleaned = cleaned.replace(cityRegex, '');
  }
  cleaned = cleaned.replace(/\s*[-|–—,:]\s*(?:real estate|realty|property dealers?|properties|brokerage|luxury homes)\s*$/i, '');
  cleaned = cleaned.replace(/[\s\-|–—,:]+$/, '').trim();
  return cleaned || raw;
}

function applyDataToDOM(data) {
  if (!data) return;

  const bName = cleanBusinessName(data.business_name || "Apex Premier Realty", data.city);
  document.title = `${bName} | Exclusive Luxury Homes & Prime Estates`;

  document.querySelectorAll("[data-bind='business_name']").forEach(el => el.textContent = bName);
  document.querySelectorAll("[data-bind='tagline']").forEach(el => el.textContent = data.tagline || "");
  document.querySelectorAll("[data-bind='city']").forEach(el => el.textContent = data.city || "Miami");
  document.querySelectorAll("[data-bind='address']").forEach(el => el.textContent = data.address || "");

  if (data.phone) {
    document.querySelectorAll("[data-phone]").forEach(el => el.href = `tel:${data.phone.replace(/\s+/g, '')}`);
    document.querySelectorAll("[data-phone-display]").forEach(el => el.textContent = data.phone);
  }

  if (data.hero_image) {
    const heroBg = document.getElementById("hero-backdrop-img");
    if (heroBg) heroBg.style.backgroundImage = `url('${data.hero_image}')`;
  }

  // Stats
  if (data.stats) {
    if (data.stats.volume_sold) document.getElementById("stat-volume").textContent = data.stats.volume_sold;
    if (data.stats.list_to_sale_ratio) document.getElementById("stat-ratio").textContent = data.stats.list_to_sale_ratio;
    if (data.stats.avg_days_on_market) document.getElementById("stat-days").textContent = data.stats.avg_days_on_market;
  }
  if (data.rating) {
    document.getElementById("stat-rating").textContent = `${data.rating} ★`;
  }
  if (data.review_count) {
    document.getElementById("stat-review-count").textContent = `${data.review_count}+`;
  }

  // Render Properties & Reviews
  renderProperties(data.featured_properties || []);
  renderReviews(data.reviews || []);

  // Format WhatsApp Links
  const waNum = (data.whatsapp || data.phone || "").replace(/\D/g, "");
  const waMsg = `Hi ${bName}! 👋 I'm interested in viewing your featured luxury properties in ${data.city || 'the area'}. Could we schedule a private consultation?`;
  const waUrl = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}` : `mailto:${data.email || 'info@realty.com'}`;

  const mobWa = document.getElementById("mobile-wa-bottom-btn");
  if (mobWa) mobWa.href = waUrl;
  const contactWa = document.getElementById("contact-whatsapp-btn");
  if (contactWa) contactWa.href = waUrl;

  updateValuationDisplay();
  updateMortgageDisplay();
}

/* ==========================================================================
   FEATURED PROPERTIES RENDERING & FILTERS
   ========================================================================== */

function renderProperties(properties) {
  const container = document.getElementById("properties-grid-container");
  if (!container || !properties || !properties.length) return;

  const filtered = activePropertyFilter === "all" 
    ? properties 
    : properties.filter(p => p.type === activePropertyFilter);

  container.innerHTML = filtered.map(p => `
    <div class="property-card">
      <div class="property-img-wrap">
        <img src="${p.image}" alt="${p.title}" class="property-img" loading="lazy" />
        <span class="property-badge-tag">${p.tag || 'Exclusive'}</span>
        <span class="property-price-tag">${p.price}</span>
      </div>

      <div class="property-body">
        <h3 class="property-title">${p.title}</h3>
        <div class="property-location">
          <span>📍</span>
          <span>${p.location}</span>
        </div>

        <div class="property-specs">
          ${p.beds ? `<span>🛏️ <strong>${p.beds}</strong> Beds</span>` : ''}
          <span>🚿 <strong>${p.baths}</strong> Baths</span>
          <span>📐 <strong>${p.sqft}</strong></span>
        </div>

        <div class="property-features-row">
          ${(p.features || []).map(f => `<span class="prop-feature-pill">${f}</span>`).join('')}
        </div>

        <a href="#contact" class="property-cta-btn" onclick="prefillPropertyInquiry('${p.title.replace(/'/g, "\\'")}', '${p.price}')">
          <span>Schedule Private Viewing &rarr;</span>
        </a>
      </div>
    </div>
  `).join('');
}

function setupPropertyFilters() {
  const btns = document.querySelectorAll(".prop-filter-btn");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activePropertyFilter = btn.getAttribute("data-filter") || "all";
      if (realEstateData && realEstateData.featured_properties) {
        renderProperties(realEstateData.featured_properties);
      }
    });
  });
}

window.prefillPropertyInquiry = function(title, price) {
  const select = document.getElementById("contact-interest-type");
  const textarea = document.querySelector("#vip-contact-form textarea");
  if (select) select.value = "Schedule a Private Viewing";
  if (textarea) textarea.value = `I am interested in scheduling a private VIP walkthrough for: "${title}" (Listed at ${price}).`;
};

/* ==========================================================================
   REVIEWS RENDERING
   ========================================================================== */

function renderReviews(reviews) {
  const container = document.getElementById("reviews-grid-container");
  if (!container || !reviews || !reviews.length) return;

  container.innerHTML = reviews.map(r => `
    <div class="property-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="color: #F59E0B; font-size: 1.1rem; margin-bottom: 12px;">★★★★★</div>
        <p style="font-size: 0.92rem; line-height: 1.6; color: var(--color-text-main); font-style: italic; margin-bottom: 20px;">
          "${r.text}"
        </p>
      </div>

      <div style="display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--color-border); padding-top: 14px;">
        <img src="${r.avatar}" alt="${r.author}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-accent);" />
        <div>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-main);">${r.author}</h4>
          <div style="font-size: 0.78rem; color: var(--color-accent);">${r.role}</div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   HOME VALUATION ESTIMATOR
   ========================================================================== */

function setupValuationEstimator() {
  const typeSelect = document.getElementById("val-prop-type");
  const bedsSelect = document.getElementById("val-beds");
  const sqftInput = document.getElementById("val-sqft");
  const conditionSelect = document.getElementById("val-condition");

  [typeSelect, bedsSelect, sqftInput, conditionSelect].forEach(el => {
    if (el) el.addEventListener("input", updateValuationDisplay);
  });
}

function updateValuationDisplay() {
  const sqft = parseFloat(document.getElementById("val-sqft")?.value || 3800);
  const type = document.getElementById("val-prop-type")?.value || "luxury_villa";
  const condition = document.getElementById("val-condition")?.value || "ultra_luxury";

  let baseRate = 850; // $ per sqft
  if (type === "penthouse") baseRate = 1100;
  else if (type === "commercial") baseRate = 650;
  else if (type === "townhouse") baseRate = 720;

  if (condition === "ultra_luxury") baseRate *= 1.25;
  else if (condition === "excellent") baseRate *= 1.1;

  const estimatedTotal = sqft * baseRate;
  const lowRange = estimatedTotal * 0.95;
  const highRange = estimatedTotal * 1.08;

  function formatM(val) {
    if (val >= 1000000) {
      return `${currentCurrency}${(val / 1000000).toFixed(1)}M`;
    }
    return `${currentCurrency}${Math.round(val / 1000)}k`;
  }

  const resultEl = document.getElementById("val-estimated-price");
  if (resultEl) {
    resultEl.textContent = `${formatM(lowRange)} – ${formatM(highRange)}`;
  }
}

/* ==========================================================================
   MORTGAGE / EMI CALCULATOR
   ========================================================================== */

function setupMortgageCalculator() {
  const priceSlider = document.getElementById("mortgage-price");
  const downSlider = document.getElementById("mortgage-down");
  const termSelect = document.getElementById("mortgage-term");
  const rateInput = document.getElementById("mortgage-rate");

  [priceSlider, downSlider, termSelect, rateInput].forEach(el => {
    if (el) el.addEventListener("input", updateMortgageDisplay);
  });
}

function updateMortgageDisplay() {
  const price = parseFloat(document.getElementById("mortgage-price")?.value || 2500000);
  const downPercent = parseFloat(document.getElementById("mortgage-down")?.value || 20);
  const termYears = parseFloat(document.getElementById("mortgage-term")?.value || 30);
  const annualRate = parseFloat(document.getElementById("mortgage-rate")?.value || 6.5);

  const downAmount = price * (downPercent / 100);
  const loanAmount = price - downAmount;
  const monthlyRate = (annualRate / 100) / 12;
  const numPayments = termYears * 12;

  let monthlyPayment = 0;
  if (monthlyRate > 0) {
    monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  } else {
    monthlyPayment = loanAmount / numPayments;
  }

  // Update DOM displays
  const priceDisplay = document.getElementById("mortgage-price-display");
  const downPercentDisplay = document.getElementById("mortgage-down-percent");
  const downDisplay = document.getElementById("mortgage-down-display");
  const monthlyDisplay = document.getElementById("mortgage-monthly-payment");
  const principalDisplay = document.getElementById("mortgage-principal-breakdown");
  const loanTotalDisplay = document.getElementById("mortgage-loan-total");

  if (priceDisplay) priceDisplay.textContent = `${currentCurrency}${price.toLocaleString()}`;
  if (downPercentDisplay) downPercentDisplay.textContent = downPercent;
  if (downDisplay) downDisplay.textContent = `${currentCurrency}${Math.round(downAmount).toLocaleString()}`;
  if (monthlyDisplay) monthlyDisplay.textContent = `${currentCurrency}${Math.round(monthlyPayment).toLocaleString()} / mo`;
  if (principalDisplay) principalDisplay.textContent = `${currentCurrency}${Math.round(monthlyPayment).toLocaleString()}`;
  if (loanTotalDisplay) loanTotalDisplay.textContent = `${currentCurrency}${Math.round(loanAmount).toLocaleString()}`;
}

/* ==========================================================================
   TAB NAVIGATION & SCROLLSPY
   ========================================================================== */

function setupTabNavigation() {
  const topTabs = document.querySelectorAll(".re-tab");
  const bottomTabs = document.querySelectorAll(".mobile-app-tab");
  const sections = ["overview", "listings", "valuation", "mortgage", "track-record", "reviews", "contact"];

  function setActiveTab(targetId) {
    topTabs.forEach(t => {
      const tabTarget = t.getAttribute("data-tab") || (t.getAttribute("href") || "").replace("#", "");
      if (tabTarget === targetId) {
        t.classList.add("active");
        try {
          const container = document.getElementById("section-tabs-bar");
          if (container) {
            const tabLeft = t.offsetLeft;
            const tabWidth = t.offsetWidth;
            const cWidth = container.offsetWidth;
            container.scrollTo({
              left: tabLeft - (cWidth / 2) + (tabWidth / 2),
              behavior: "smooth"
            });
          }
        } catch (_) {}
      } else {
        t.classList.remove("active");
      }
    });

    bottomTabs.forEach(t => {
      const tabTarget = t.getAttribute("data-tab") || (t.getAttribute("href") || "").replace("#", "");
      if (tabTarget === targetId) {
        t.classList.add("active");
      } else if (tabTarget && tabTarget !== "whatsapp") {
        t.classList.remove("active");
      }
    });
  }

  // Global document click event delegation
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"], [data-tab]');
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const dataTab = link.getAttribute("data-tab") || "";
    let targetId = dataTab || (href.startsWith("#") ? href.replace("#", "") : "");

    if (!targetId || targetId === "#" || targetId === "whatsapp") return;

    if (targetId === "overview") {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveTab("overview");
      try { history.replaceState(null, "", "#overview"); } catch(_) {}
      return;
    }

    const el = document.getElementById(targetId);
    if (el) {
      e.preventDefault();
      e.stopPropagation();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveTab(targetId);
      try { history.replaceState(null, "", "#" + targetId); } catch(_) {}
    }
  }, true);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (id && sections.includes(id)) {
            setActiveTab(id);
          }
        }
      });
    }, { rootMargin: "-10% 0px -65% 0px" });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }
}

function setupContactForm() {
  const form = document.getElementById("vip-contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you for your confidential request. A senior partner will contact you shortly.");
    form.reset();
  });
}
