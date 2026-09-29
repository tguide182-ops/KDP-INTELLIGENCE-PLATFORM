/**
 * KDP Intelligence Companion - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const contextText = document.getElementById('context-text');
  const searchForm = document.getElementById('quick-search-form');
  const searchInput = document.getElementById('quick-search-input');
  const serverStatus = document.getElementById('server-status');

  const KDP_BASE_URL = 'http://localhost:3000';

  // Check server health
  try {
    const res = await fetch(`${KDP_BASE_URL}/api/admin/health`, { method: 'GET', mode: 'no-cors' });
    serverStatus.innerHTML = '<span class="status-dot"></span><span>Local Active</span>';
  } catch (err) {
    serverStatus.innerHTML = '<span class="status-dot" style="background:#f43f5e"></span><span style="color:#f43f5e">Server Offline</span>';
  }

  // Detect active tab
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.url) {
        contextText.textContent = 'Ready for research';
        return;
      }

      const url = activeTab.url;
      if (url.includes('amazon.') && url.includes('/s')) {
        const urlObj = new URL(url);
        const query = urlObj.searchParams.get('k');
        if (query) {
          contextText.innerHTML = `Amazon Search: <strong>"${query}"</strong>`;
          searchInput.value = query;
        } else {
          contextText.textContent = 'Amazon Search Page detected';
        }
      } else if (url.includes('amazon.') && (url.includes('/dp/') || url.includes('/gp/product/'))) {
        const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
        if (match) {
          const asin = match[1];
          contextText.innerHTML = `Amazon Book ASIN: <strong>${asin}</strong>`;
        } else {
          contextText.textContent = 'Amazon Product Page detected';
        }
      } else if (url.includes('amazon.')) {
        contextText.textContent = 'Browsing Amazon';
      } else {
        contextText.textContent = 'Navigate to Amazon to trigger overlay';
      }
    });
  } else {
    contextText.textContent = 'Extension Preview Mode';
  }

  // Handle quick search form
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    const targetUrl = `${KDP_BASE_URL}/keywords/explorer?q=${encodeURIComponent(query)}`;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: targetUrl });
    } else {
      window.open(targetUrl, '_blank');
    }
  });
});
