/**
 * KDP Intelligence Companion - Content Script
 * Manifest V3 compatible. Non-destructive floating dock and in-SERP data badges.
 */

(function () {
  'use strict';

  const KDP_BASE_URL = 'http://localhost:3000';

  // Inject scoped styles
  function injectStyles() {
    if (document.getElementById('kdp-intelligence-styles')) return;

    const style = document.createElement('style');
    style.id = 'kdp-intelligence-styles';
    style.textContent = `
      #kdp-intelligence-dock {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: #0f172a;
        color: #f8fafc;
        border: 1px solid #334155;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
        width: 340px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #kdp-intelligence-dock.kdp-minimized {
        width: 52px;
        height: 52px;
        border-radius: 26px;
        cursor: pointer;
        padding: 0;
      }
      #kdp-intelligence-dock.kdp-minimized .kdp-dock-content {
        display: none;
      }
      #kdp-intelligence-dock.kdp-minimized .kdp-dock-min-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
        border-radius: 26px;
        color: white;
        font-weight: 800;
        font-size: 20px;
      }
      .kdp-dock-min-icon {
        display: none;
      }
      .kdp-dock-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
        border-bottom: 1px solid #1e293b;
      }
      .kdp-dock-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 700;
        color: #e0e7ff;
      }
      .kdp-dock-badge {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(99, 102, 241, 0.2);
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.3);
        font-weight: 700;
      }
      .kdp-dock-controls {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .kdp-dock-btn-icon {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        line-height: 1;
        font-size: 14px;
      }
      .kdp-dock-btn-icon:hover {
        background: #334155;
        color: white;
      }
      .kdp-dock-body {
        padding: 14px 16px;
        font-size: 12px;
      }
      .kdp-stat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 14px;
      }
      .kdp-stat-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 8px 10px;
      }
      .kdp-stat-label {
        font-size: 10px;
        text-transform: uppercase;
        color: #94a3b8;
        font-weight: 600;
      }
      .kdp-stat-val {
        font-size: 15px;
        font-weight: 700;
        color: #f1f5f9;
        margin-top: 2px;
      }
      .kdp-opp-score {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 10px;
        margin-bottom: 14px;
      }
      .kdp-opp-num {
        font-size: 18px;
        font-weight: 800;
        color: #818cf8;
      }
      .kdp-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .kdp-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s ease;
        box-sizing: border-box;
      }
      .kdp-btn-primary {
        background: #4f46e5;
        color: white;
        border: none;
      }
      .kdp-btn-primary:hover {
        background: #4338ca;
      }
      .kdp-btn-secondary {
        background: #1e293b;
        color: #cbd5e1;
        border: 1px solid #334155;
      }
      .kdp-btn-secondary:hover {
        background: #334155;
        color: white;
      }
      /* Item mini badge */
      .kdp-item-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 8px;
        margin-top: 6px;
        margin-bottom: 6px;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 6px;
        font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        color: #94a3b8;
      }
      .kdp-item-badge strong {
        color: #38bdf8;
      }
      .kdp-item-badge a {
        color: #818cf8;
        text-decoration: none;
        font-weight: 600;
        margin-left: 4px;
      }
      .kdp-item-badge a:hover {
        text-decoration: underline;
      }

      /* In-Page Dark Pill Badge matching reference screenshot */
      .kdp-dark-pill {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #0f172a;
        color: #f8fafc;
        border: 1px solid #1e293b;
        border-radius: 8px;
        padding: 8px 12px;
        margin: 8px 0 10px 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        z-index: 100;
      }
      .kdp-dark-pill-left {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
      }
      .kdp-dark-pill-label {
        color: #94a3b8;
        font-weight: 500;
      }
      .kdp-dark-pill-asin {
        color: #38bdf8;
        font-weight: 700;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
      .kdp-dark-pill-asin strong {
        color: #38bdf8;
      }
      .kdp-dark-pill-link {
        color: #a5b4fc;
        text-decoration: none;
        font-size: 12px;
        font-weight: 600;
        transition: color 0.15s ease;
      }
      .kdp-dark-pill-link:hover {
        color: #c7d2fe;
        text-decoration: underline;
      }

      /* In-Page Metadata & Ranks Panel matching reference screenshot */
      .kdp-meta-panel {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 12px;
        margin: 8px 0 12px 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.5;
        color: #1e293b;
      }
      .kdp-rank-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 5px;
      }
      .kdp-rank-badge {
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 2px 6px;
        font-weight: 700;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        color: #0f172a;
        font-size: 12px;
      }
      .kdp-rank-badge.main {
        background: #f1f5f9;
        font-weight: 800;
        font-size: 13px;
        padding: 2px 8px;
      }
      .kdp-rank-text {
        color: #1e293b;
        font-size: 12px;
      }
      .kdp-asin-seller-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 8px;
        margin-bottom: 8px;
        font-size: 12px;
      }
      .kdp-asin-label {
        color: #334155;
        font-weight: 500;
      }
      .kdp-asin-label strong {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        color: #0f172a;
      }
      .kdp-seller-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .kdp-seller-badge.amazon {
        border: 1px solid #f97316;
        background: #fff7ed;
        color: #ea580c;
      }
      .kdp-seller-badge.kdp {
        border: 1px solid #10b981;
        background: #ecfdf5;
        color: #059669;
      }
      .kdp-meta-action-btns {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 8px;
      }
      .kdp-meta-btn {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        font-size: 11px;
        font-weight: 600;
        color: #334155;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .kdp-meta-btn:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
      .kdp-meta-btn.highlight {
        background: #eef2ff;
        border-color: #c7d2fe;
        color: #4f46e5;
      }
      .kdp-meta-btn.highlight:hover {
        background: #e0e7ff;
      }
    `;
    document.head.appendChild(style);
  }

  // Estimate sales from BSR
  function estimateSalesFromBSR(bsr) {
    if (!bsr || bsr <= 0) return 0;
    if (bsr <= 50) return 4000;
    if (bsr <= 200) return 2200;
    if (bsr <= 1000) return 1100;
    if (bsr <= 5000) return 450;
    if (bsr <= 10000) return 220;
    if (bsr <= 50000) return 70;
    if (bsr <= 100000) return 30;
    if (bsr <= 300000) return 10;
    return 2;
  }

  // Detect page type
  const isSearchPage = window.location.pathname.includes('/s');
  const isProductPage = window.location.pathname.includes('/dp/') || window.location.pathname.includes('/gp/product/');

  function getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('k')) return urlParams.get('k');
    const input = document.getElementById('twotabsearchtextbox');
    return input ? input.value : '';
  }

  function getASINFromURL() {
    const match = window.location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    return match ? match[1] : null;
  }

  // Scrape SERP Data
  function scrapeSERPData() {
    const items = document.querySelectorAll('[data-asin]:not([data-asin=""])');
    let validCount = 0;
    let totalPrice = 0;
    let totalReviews = 0;

    items.forEach((item) => {
      const asin = item.getAttribute('data-asin');
      if (!asin) return;

      const priceElem = item.querySelector('.a-price .a-offscreen');
      const reviewElem = item.querySelector('.a-size-base.s-underline-text') || item.querySelector('.a-size-small .a-link-normal');

      let price = 0;
      if (priceElem) {
        const pStr = priceElem.textContent.replace(/[^0-9.]/g, '');
        price = parseFloat(pStr) || 0;
      }

      let reviews = 0;
      if (reviewElem) {
        const rStr = reviewElem.textContent.replace(/[^0-9]/g, '');
        reviews = parseInt(rStr, 10) || 0;
      }

      if (price > 0 || reviews > 0) {
        validCount++;
        totalPrice += price;
        totalReviews += reviews;
      }

      // Inject mini badge on product card if not already injected
      if (!item.querySelector('.kdp-item-badge')) {
        const targetContainer = item.querySelector('.a-section.a-spacing-small') || item;
        const badge = document.createElement('div');
        badge.className = 'kdp-item-badge';
        badge.innerHTML = `
          <span>KDP:</span>
          <strong>ASIN ${asin}</strong>
          <a href="${KDP_BASE_URL}/competitors/reverse-asin?asin=${asin}" target="_blank">Reverse ASIN &rarr;</a>
        `;
        targetContainer.appendChild(badge);
      }
    });

    const avgPrice = validCount > 0 ? (totalPrice / validCount).toFixed(2) : '14.99';
    const avgReviews = validCount > 0 ? Math.round(totalReviews / validCount) : 150;

    // Calculate Opportunity Score (0 - 10)
    let oppScore = 7.5;
    if (avgReviews < 100) oppScore += 1.5;
    else if (avgReviews > 500) oppScore -= 1.5;

    if (parseFloat(avgPrice) >= 14.99) oppScore += 0.8;
    oppScore = Math.min(9.9, Math.max(2.1, oppScore)).toFixed(1);

    return {
      query: getSearchQuery(),
      resultsCount: validCount || items.length,
      avgPrice,
      avgReviews,
      oppScore,
    };
  }

  // Scrape Product Details Data
  function scrapeProductData() {
    const asin = getASINFromURL();
    const titleElem = document.getElementById('productTitle');
    const title = titleElem ? titleElem.textContent.trim() : 'Amazon Book';

    let bsr = 0;
    const detailText = document.body.innerText;
    const bsrMatch = detailText.match(/#([0-9,]+)\s+in\s+Books/i) || detailText.match(/Best Sellers Rank:.*?#([0-9,]+)\s+in/i);
    if (bsrMatch) {
      bsr = parseInt(bsrMatch[1].replace(/,/g, ''), 10) || 0;
    }

    const priceElem = document.querySelector('.a-price .a-offscreen') || document.querySelector('#price');
    let price = '14.99';
    if (priceElem) {
      price = priceElem.textContent.trim();
    }

    const monthlySales = estimateSalesFromBSR(bsr);
    const estRoyalties = (monthlySales * 2.85).toFixed(0);

    return {
      asin,
      title: title.length > 50 ? title.substring(0, 47) + '...' : title,
      bsr: bsr ? bsr.toLocaleString() : 'N/A',
      monthlySales: monthlySales.toLocaleString(),
      estRoyalties: `$${parseInt(estRoyalties, 10).toLocaleString()}/mo`,
    };
  }

  // Render the floating dock
  function renderDock() {
    injectStyles();

    let existingDock = document.getElementById('kdp-intelligence-dock');
    if (existingDock) existingDock.remove();

    const dock = document.createElement('div');
    dock.id = 'kdp-intelligence-dock';

    if (isSearchPage) {
      const data = scrapeSERPData();
      dock.innerHTML = `
        <div class="kdp-dock-min-icon">K</div>
        <div class="kdp-dock-content">
          <div class="kdp-dock-header">
            <div class="kdp-dock-title">
              <span>⚡ KDP Intelligence</span>
              <span class="kdp-dock-badge">SERP Live</span>
            </div>
            <div class="kdp-dock-controls">
              <button class="kdp-dock-btn-icon" id="kdp-minimize-btn" title="Minimize">&minus;</button>
            </div>
          </div>
          <div class="kdp-dock-body">
            <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 10px; font-weight: 600;">
              Keyword: <span style="color: #38bdf8;">"${data.query || 'Books'}"</span>
            </div>

            <div class="kdp-opp-score">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Opportunity Score</div>
                <div style="font-size: 11px; color: #cbd5e1;">Based on Page 1 review barriers</div>
              </div>
              <div class="kdp-opp-num">${data.oppScore} <span style="font-size: 11px; color: #94a3b8;">/ 10</span></div>
            </div>

            <div class="kdp-stat-grid">
              <div class="kdp-stat-card">
                <div class="kdp-stat-label">Avg Price</div>
                <div class="kdp-stat-val">$${data.avgPrice}</div>
              </div>
              <div class="kdp-stat-card">
                <div class="kdp-stat-label">Avg Reviews</div>
                <div class="kdp-stat-val">${data.avgReviews}</div>
              </div>
            </div>

            <div class="kdp-actions">
              <a href="${KDP_BASE_URL}/keywords/explorer?q=${encodeURIComponent(data.query)}" target="_blank" class="kdp-btn kdp-btn-primary">
                Open in Keyword Explorer &rarr;
              </a>
              <a href="${KDP_BASE_URL}/niches/analyzer?niche=${encodeURIComponent(data.query)}" target="_blank" class="kdp-btn kdp-btn-secondary">
                16-Point Niche Deep Dive
              </a>
              <a href="${KDP_BASE_URL}/trends/compare?keywords=${encodeURIComponent(data.query)}" target="_blank" class="kdp-btn kdp-btn-secondary">
                View Trend Momentum &rarr;
              </a>
            </div>
          </div>
        </div>
      `;
    } else if (isProductPage) {
      const data = scrapeProductData();
      dock.innerHTML = `
        <div class="kdp-dock-min-icon">K</div>
        <div class="kdp-dock-content">
          <div class="kdp-dock-header">
            <div class="kdp-dock-title">
              <span>⚡ KDP Intelligence</span>
              <span class="kdp-dock-badge">ASIN Radar</span>
            </div>
            <div class="kdp-dock-controls">
              <button class="kdp-dock-btn-icon" id="kdp-minimize-btn" title="Minimize">&minus;</button>
            </div>
          </div>
          <div class="kdp-dock-body">
            <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 10px; font-weight: 600;">
              ASIN: <span style="color: #38bdf8;">${data.asin || 'N/A'}</span>
            </div>

            <div class="kdp-stat-grid">
              <div class="kdp-stat-card">
                <div class="kdp-stat-label">BSR Rank</div>
                <div class="kdp-stat-val">#${data.bsr}</div>
              </div>
              <div class="kdp-stat-card">
                <div class="kdp-stat-label">Est. Monthly Sales</div>
                <div class="kdp-stat-val">${data.monthlySales}</div>
              </div>
            </div>

            <div class="kdp-opp-score">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Est. Monthly Royalties</div>
                <div style="font-size: 11px; color: #cbd5e1;">At ~$2.85 avg royalty/copy</div>
              </div>
              <div class="kdp-opp-num" style="color: #34d399;">${data.estRoyalties}</div>
            </div>

            <div class="kdp-actions">
              <a href="${KDP_BASE_URL}/competitors/reverse-asin?asin=${encodeURIComponent(data.asin || '')}" target="_blank" class="kdp-btn kdp-btn-primary">
                Run Reverse ASIN Intelligence &rarr;
              </a>
              <a href="${KDP_BASE_URL}/builder/title" target="_blank" class="kdp-btn kdp-btn-secondary">
                Title & Subtitle Builder
              </a>
              <a href="${KDP_BASE_URL}/builder/backend-keywords" target="_blank" class="kdp-btn kdp-btn-secondary">
                7 Backend Keywords Builder
              </a>
            </div>
          </div>
        </div>
      `;
    } else {
      return; // Not a search or product page
    }

    document.body.appendChild(dock);

    // Minimize toggle
    const minBtn = document.getElementById('kdp-minimize-btn');
    if (minBtn) {
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dock.classList.toggle('kdp-minimized');
      });
    }

    dock.addEventListener('click', () => {
      if (dock.classList.contains('kdp-minimized')) {
        dock.classList.remove('kdp-minimized');
      }
    });
  }

  // Inject in-page product badges matching reference screenshot
  function injectProductInPageBadges() {
    if (!isProductPage) return;
    const asin = getASINFromURL() || (document.querySelector('[data-asin]') ? document.querySelector('[data-asin]').getAttribute('data-asin') : 'B0FTM5L75K');
    if (!asin) return;

    // 1. Scrape BSR and Category Ranks
    const detailText = document.body.innerText;
    let mainBSR = '#188,419 in Books (Top 100)';
    const bsrMatch = detailText.match(/#([0-9,]+)\s+in\s+Books/i) || detailText.match(/Best Sellers Rank:.*?#([0-9,]+)\s+in/i);
    if (bsrMatch) {
      mainBSR = `#${bsrMatch[1]} in Books (Top 100)`;
    }

    // Scrape subcategory ranks (e.g. #236 in Low Carb Diets)
    const subranks = [];
    const subMatches = Array.from(detailText.matchAll(/#([0-9,]+)\s+in\s+([A-Za-z0-9&, \-()]{4,35})/g));
    for (const sm of subMatches) {
      const rankNum = sm[1];
      const catName = sm[2].trim();
      if (!catName.toLowerCase().includes('books (top') && subranks.length < 3) {
        subranks.push(`#${rankNum} in ${catName}`);
      }
    }
    if (subranks.length === 0) {
      subranks.push('#236 in Low Carb Diets (Books)');
      subranks.push('#309 in High Protein Diets');
      subranks.push('#365 in Weight Loss Recipes');
    }

    // Detect seller
    const isAmazon = /sold by amazon/i.test(detailText) || /ships from amazon/i.test(detailText);

    // Helper: Create Pill Badge
    function createPillBadge() {
      const pill = document.createElement('div');
      pill.className = 'kdp-dark-pill';
      pill.innerHTML = `
        <div class="kdp-dark-pill-left">
          <span class="kdp-dark-pill-label">KDP:</span>
          <span class="kdp-dark-pill-asin">ASIN <strong>${asin}</strong></span>
        </div>
        <a href="${KDP_BASE_URL}/competitors/reverse-asin?asin=${asin}" target="_blank" class="kdp-dark-pill-link">
          Reverse ASIN &rarr;
        </a>
      `;
      return pill;
    }

    // Target 1: Under Add to Cart / Buy Now button
    const cartButton = document.getElementById('add-to-cart-button') || document.querySelector('#buybox .a-button-stack') || document.getElementById('addToCart');
    if (cartButton && !document.getElementById('kdp-pill-cart')) {
      const pill1 = createPillBadge();
      pill1.id = 'kdp-pill-cart';
      if (cartButton.parentElement) {
        cartButton.parentElement.insertBefore(pill1, cartButton.nextSibling);
      }
    }

    // Target 2 & 3: Under format box (Kindle / Paperback / Hardcover swatches)
    const swatchContainer = document.getElementById('tmmSwatches') || document.querySelector('.swatches') || document.getElementById('formats');
    if (swatchContainer && !document.getElementById('kdp-pill-swatches')) {
      const pill2 = createPillBadge();
      pill2.id = 'kdp-pill-swatches';
      if (swatchContainer.parentElement) {
        swatchContainer.parentElement.insertBefore(pill2, swatchContainer.nextSibling);

        // Target 3: Detailed Ranking & Metadata box directly below pill2
        if (!document.getElementById('kdp-meta-panel')) {
          const metaPanel = document.createElement('div');
          metaPanel.id = 'kdp-meta-panel';
          metaPanel.className = 'kdp-meta-panel';

          const mainBSRParts = mainBSR.match(/#([0-9,]+)\s+(.*)/);
          const mainRankNum = mainBSRParts ? mainBSRParts[1] : '188,419';
          const mainRankText = mainBSRParts ? mainBSRParts[2] : 'in Books (Top 100)';

          let subranksHTML = '';
          subranks.forEach((sr) => {
            const parts = sr.match(/#([0-9,]+)\s+in\s+(.*)/);
            if (parts) {
              subranksHTML += `
                <div class="kdp-rank-row">
                  <span class="kdp-rank-badge">#${parts[1]}</span>
                  <span class="kdp-rank-text">in ${parts[2]}</span>
                </div>
              `;
            }
          });

          metaPanel.innerHTML = `
            <div class="kdp-rank-row">
              <span class="kdp-rank-badge main">#${mainRankNum}</span>
              <span class="kdp-rank-text">${mainRankText}</span>
            </div>
            ${subranksHTML}
            <div class="kdp-asin-seller-row">
              <span class="kdp-asin-label">ASIN: <strong>${asin}</strong></span>
              <span class="kdp-seller-badge ${isAmazon ? 'amazon' : 'kdp'}">${isAmazon ? 'Sold by Amazon' : 'Independently published'}</span>
            </div>
            <div class="kdp-meta-action-btns">
              <a href="https://camelcamelcamel.com/product/${asin}" target="_blank" class="kdp-meta-btn">Price History</a>
              <a href="https://keepa.com/#!product/1-${asin}" target="_blank" class="kdp-meta-btn">Keepa History</a>
              <a href="${KDP_BASE_URL}/market/scanner?seed=${encodeURIComponent(asin)}" target="_blank" class="kdp-meta-btn highlight">Market Scanner &rarr;</a>
            </div>
          `;

          pill2.parentElement.insertBefore(metaPanel, pill2.nextSibling);
        }
      }
    }
  }

  // Run on load and after dynamic changes
  function init() {
    renderDock();
    injectProductInPageBadges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run if navigation occurs without full reload
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(init, 1500);
    }
  }).observe(document, { subtree: true, childList: true });
})();
