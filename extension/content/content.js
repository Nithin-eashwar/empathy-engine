/**
 * Empathy Engine - Content Script
 * Runs on every webpage to capture selected text
 */

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ selectedText: selectedText });
  }
  return true; // Required for async response
});

// Optional: Add visual feedback when text is selected
// This could show a small indicator that the extension can analyze the selection
let selectionIndicator = null;

document.addEventListener('mouseup', (e) => {
  const selectedText = window.getSelection().toString().trim();
  
  // Remove existing indicator
  if (selectionIndicator) {
    selectionIndicator.remove();
    selectionIndicator = null;
  }
  
  // Only show indicator if there's meaningful selected text
  if (selectedText.length > 10 && selectedText.length < 1000) {
    // Store the selection for quick access
    chrome.storage.local.set({ lastSelectedText: selectedText });
  }
});

// Cleanup on navigation
window.addEventListener('beforeunload', () => {
  if (selectionIndicator) {
    selectionIndicator.remove();
  }
});

console.log('Empathy Engine content script loaded');
