/**
 * KDP Intelligence Companion - Background Service Worker (Manifest V3)
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('⚡ KDP Intelligence Companion Extension installed successfully.');
});

// Message listener for cross-component communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PING') {
    sendResponse({ status: 'PONG', timestamp: Date.now() });
    return true;
  }

  if (request.type === 'OPEN_KDP_URL') {
    chrome.tabs.create({ url: request.url });
    sendResponse({ success: true });
    return true;
  }

  return false;
});
