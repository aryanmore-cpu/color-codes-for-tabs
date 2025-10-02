// Listens for messages from the popup script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message is for changing the favicon
  if (request.type === 'changeFavicon') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error('Tab query error:', chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      if (tabs[0]) {
        // Check for restricted URLs (chrome://, chrome-extension://, etc.)
        const url = tabs[0].url || '';
        if (/^chrome:\/\//.test(url) || /^chrome-extension:\/\//.test(url) || /^about:/.test(url)) {
          const errorMsg = 'Cannot inject script into restricted page: ' + url;
          console.error(errorMsg);
          sendResponse({ success: false, error: errorMsg });
          return;
        }
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: changePageFavicon,
          args: [request.color]
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error('Script injection error:', chrome.runtime.lastError.message || chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message || JSON.stringify(chrome.runtime.lastError) });
            return;
          }
          if (!results || results.length === 0) {
            console.error('Script injection returned no results.');
            sendResponse({ success: false, error: 'Script injection returned no results.' });
            return;
          }
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found.' });
      }
    });
    // Return true to indicate async response
    return true;
  }
  return false;
});

// This function is injected into the active web page.
function changePageFavicon(color) {
  // Find the existing favicon link element.
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    // If no favicon link exists, create one and append it to the head.
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  // Create a new circular SVG icon with the selected color.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="${color}" /></svg>`;
  // Set the link's href to a data URL representing the new SVG icon.
  link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
}

