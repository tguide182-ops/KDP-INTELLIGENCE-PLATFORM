# KDP Intelligence Companion (Chrome Extension Manifest V3)

The **KDP Intelligence Companion** brings the power of the KDP Intelligence operating system directly onto Amazon.com, Amazon.co.uk, Amazon.de, and Amazon.ca.

---

## Key Features

1. **In-SERP Floating Dock (`#kdp-intelligence-dock`)**:
   - Displays real-time **Opportunity Score** (0–10 scale) based on Page 1 review competition and price points.
   - Calculates **Average Price** and **Average Review Counts** across all visible books.
   - 1-Click direct links to open the query in the **Keyword Explorer**, **16-Point Niche Analyzer**, or **Trend Comparison**.
   - Collapsible floating widget with minimize/expand controls.

2. **In-SERP Item Badges**:
   - Injects a fast ASIN badge and direct "Reverse ASIN &rarr;" link directly under each book card on Amazon search results.

3. **In-Page Product Badges & Category Ranks (`/dp/*`)**:
   - **Dark Pill Badges**: Injects dark rounded badges directly under the **"Add to Cart"** button and under the **format selection boxes** (Kindle, Paperback, Hardcover):
     `KDP: ASIN [ASIN]    Reverse ASIN →`
   - **Category Ranking & History Panel**: Injects directly below the format selector:
     - Main BSR Rank badge: `#188,419 in Books (Top 100)`
     - Subcategory ranks: `#236 in Low Carb Diets`, `#309 in High Protein Diets`, etc.
     - `ASIN: [ASIN]` with `[Sold by Amazon]` or `[Independently published]` tag.
     - Action buttons: `[Price History]` (CamelCamelCamel), `[Keepa History]`, and `[Market Scanner →]`.

4. **Product Detail Page Radar (`/dp/*`)**:
   - Automatically detects the book's ASIN, BSR, and price.
   - Computes **Estimated Monthly Sales** and **Estimated Monthly Royalties** ($/mo).
   - 1-Click handoff into the **Reverse ASIN Engine**, **Title & Subtitle Builder**, and **Backend Keywords Builder**.

5. **Extension Popup**:
   - Displays connection health with the local KDP Intelligence server (`http://localhost:3000`).
   - Detects active Amazon search query or book ASIN.
   - Quick search bar jumping straight into deep keyword analysis.
   - Launchpad to all platform modules including the new **Deep Market Scanner** and **Book Studio**.

---

## Installation Instructions (Chrome / Brave / Edge)

1. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions`
   - **Brave**: `brave://extensions`
   - **Edge**: `edge://extensions`
2. Enable the **"Developer mode"** toggle in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left corner.
4. Select the directory:
   ```
   d:\antigravity project 1\extension
   ```
5. Navigate to any Amazon search page (e.g. `https://www.amazon.com/s?k=menopause+cookbook`) or product page (e.g. `https://www.amazon.com/dp/B0DF123456`).
6. The KDP Intelligence dock will appear automatically in the bottom-right corner!
