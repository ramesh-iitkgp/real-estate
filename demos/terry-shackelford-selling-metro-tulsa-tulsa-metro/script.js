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

function getDefaultProperties(city = "Chennai", currency = "₹") {
  const isINR = currency === "₹" || currency === "Rs" || currency === "INR";
  
  return [
    {
      id: "prop-1",
      title: "Royal Palm Luxury Villa & Private Lawn",
      location: `Prime Coastal Corridor, ${city}`,
      price: isINR ? "₹4.75 Cr" : "$3,850,000",
      tag: "Featured Exclusive",
      type: "villa",
      beds: 4,
      baths: 5,
      sqft: "4,850 sq ft",
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      features: ["Private Garden", "Infinity Pool", "Gated Security", "Vastu Compliant"]
    },
    {
      id: "prop-2",
      title: "Grand Horizon Skyline Penthouse",
      location: `CBD Central Boulevard, ${city}`,
      price: isINR ? "₹2.90 Cr" : "$2,450,000",
      tag: "Ready to Move",
      type: "penthouse",
      beds: 3,
      baths: 3.5,
      sqft: "3,200 sq ft",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      features: ["Panoramic City Views", "Private Lift", "Clubhouse & Gym", "2 Covered Car Parks"]
    },
    {
      id: "prop-3",
      title: "Modern Premium 3 & 4 BHK Family Residences",
      location: `Greenwood Enclave, ${city}`,
      price: isINR ? "₹1.45 Cr" : "$1,250,000",
      tag: "New Launch",
      type: "family_home",
      beds: 3,
      baths: 3,
      sqft: "2,150 sq ft",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      features: ["Kids Play Area", "Power Backup", "RERA Approved", "24/7 CCTV"]
    },
    {
      id: "prop-4",
      title: "Prime Commercial Retail & Corporate Suites",
      location: `Main Arterial Expressway, ${city}`,
      price: isINR ? "₹6.80 Cr" : "$4,900,000",
      tag: "High ROI Investment",
      type: "commercial",
      beds: 0,
      baths: 4,
      sqft: "8,500 sq ft",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      features: ["100% Occupancy", "High Footfall Corridor", "Grade-A Glass Facade", "Ample Visitor Parking"]
    },
    {
      id: "prop-5",
      title: "Luxury Gated Community Villa Plots",
      location: `South Extension Corridor, ${city}`,
      price: isINR ? "₹85 Lakhs" : "$680,000",
      tag: "Clear Title",
      type: "villa",
      beds: 0,
      baths: 0,
      sqft: "2,400 sq ft Plot",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      features: ["Blacktop Roads", "Underground Cabling", "Immediate Registration", "Bank Approved"]
    },
    {
      id: "prop-6",
      title: "Contemporary Lakeview Duplex Residence",
      location: `Lakeview Promenade, ${city}`,
      price: isINR ? "₹3.20 Cr" : "$2,100,000",
      tag: "Spotlight Deal",
      type: "family_home",
      beds: 4,
      baths: 4,
      sqft: "3,650 sq ft",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      features: ["Double Height Living", "Private Terrace", "Solar Grid", "Designer Modular Kitchen"]
    }
  ];
}

function getDefaultReviews(city = "Chennai", bName = "Apex Premier Realty") {
  return [
    {
      author: "Rajesh & Priya Sundaram",
      role: `Bought Luxury 4 BHK Villa in ${city}`,
      rating: 5,
      text: `${bName} made our home buying process seamless and stress-free. Clear title verification, transparent pricing, and excellent local area knowledge. Highly recommended!`,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      author: "K. Venkatesh",
      role: `Commercial Space Investor, ${city}`,
      rating: 5,
      text: "Outstanding market insight. They identified an off-market high-yield rental commercial floor for me and negotiated favorable terms with the developer. Top tier brokerage.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      author: "Ananya Deshmukh",
      role: `Sold Gated Community Plot in 14 Days`,
      rating: 5,
      text: "Extremely professional and prompt service. They brought genuine, verified buyers within a week and handled all registration paperwork effortlessly.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
    }
  ];
}

async function loadRealEstateData() {
  try {
    const res = await fetch("./data/business.json");
    if (!res.ok) throw new Error("Could not load data/business.json");
    realEstateData = await res.json();
    currentCurrency = realEstateData.currency_symbol || (realEstateData.country === "India" ? "₹" : "$");
    applyDataToDOM(realEstateData);
  } catch (err) {
    console.warn("Using fallback real estate state:", err);
    applyDataToDOM({});
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
  const city = data.city || "Chennai";
  const bName = cleanBusinessName(data.business_name || "Apex Premier Realty", city);
  document.title = `${bName} | Verified Properties & Real Estate Advisory`;

  document.querySelectorAll("[data-bind='business_name']").forEach(el => el.textContent = bName);
  
  const defaultTagline = `Your trusted local property consultants for buying, selling, and investing in verified residential homes, luxury villas, commercial spaces, and plots across ${city}.`;
  document.querySelectorAll("[data-bind='tagline']").forEach(el => el.textContent = data.tagline || defaultTagline);
  document.querySelectorAll("[data-bind='city']").forEach(el => el.textContent = city);
  document.querySelectorAll("[data-bind='address']").forEach(el => el.textContent = data.address || `${city}, Tamil Nadu, India`);

  if (data.phone) {
    document.querySelectorAll("[data-phone]").forEach(el => el.href = `tel:${data.phone.replace(/\s+/g, '')}`);
    document.querySelectorAll("[data-phone-display]").forEach(el => el.textContent = data.phone);
  }

  if (data.hero_image) {
    const heroBg = document.getElementById("hero-backdrop-img");
    if (heroBg) heroBg.style.backgroundImage = `url('${data.hero_image}')`;
  }

  // Stats
  const statVolumeEl = document.getElementById("stat-volume");
  if (statVolumeEl) {
    statVolumeEl.textContent = data.stats?.volume_sold || (currentCurrency === "₹" ? "₹185 Cr+" : "$185M+");
  }
  if (data.stats?.list_to_sale_ratio) {
    document.getElementById("stat-ratio").textContent = data.stats.list_to_sale_ratio;
  }
  if (data.stats?.avg_days_on_market) {
    document.getElementById("stat-days").textContent = data.stats.avg_days_on_market;
  }
  if (data.rating) {
    document.getElementById("stat-rating").textContent = `${data.rating} ★`;
  }
  if (data.review_count) {
    document.getElementById("stat-review-count").textContent = `${data.review_count}+`;
  }

  // Properties: use provided or full visual defaults
  const properties = (data.featured_properties && data.featured_properties.length > 0)
    ? data.featured_properties
    : getDefaultProperties(city, currentCurrency);
  
  if (!data.featured_properties || !data.featured_properties.length) {
    data.featured_properties = properties;
  }

  const reviews = (data.reviews && data.reviews.length > 0)
    ? data.reviews
    : getDefaultReviews(city, bName);

  renderProperties(properties);
  renderReviews(reviews);

  // Format WhatsApp Links
  const waNum = (data.whatsapp || data.phone || "").replace(/\D/g, "");
  const waMsg = `Hi ${bName}! 👋 I came across your property listing in ${city}. I'm interested in exploring your available properties. Could you share more details?`;
  const waUrl = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}` : `tel:${data.phone || ''}`;

  const heroWa = document.getElementById("hero-whatsapp-btn");
  if (heroWa) heroWa.href = waUrl;
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

  const waNum = (realEstateData?.whatsapp || realEstateData?.phone || "").replace(/\D/g, "");

  container.innerHTML = filtered.map(p => {
    const waPropMsg = `Hi! 👋 I'm interested in this property: "${p.title}" (${p.price}) in ${p.location}. Is it still available for a site visit?`;
    const propWaUrl = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(waPropMsg)}` : '#contact';

    return `
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
          ${p.baths ? `<span>🚿 <strong>${p.baths}</strong> Baths</span>` : ''}
          <span>📐 <strong>${p.sqft}</strong></span>
        </div>

        <div class="property-features-row">
          ${(p.features || []).map(f => `<span class="prop-feature-pill">${f}</span>`).join('')}
        </div>

        <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 14px;">
          <a href="#contact" class="property-cta-btn" onclick="prefillPropertyInquiry('${p.title.replace(/'/g, "\\'")}', '${p.price}')">
            <span>Book Site Visit &rarr;</span>
          </a>
          <a href="${propWaUrl}" target="_blank" rel="noopener" class="hero-btn-whatsapp" style="padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 700; gap: 4px;" title="Inquire on WhatsApp">
            <span>💬 Chat</span>
          </a>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function setupPropertyFilters() {
  const btns = document.querySelectorAll(".prop-filter-btn");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activePropertyFilter = btn.getAttribute("data-filter") || "all";
      const props = realEstateData?.featured_properties || getDefaultProperties(realEstateData?.city || "Chennai", currentCurrency);
      renderProperties(props);
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
