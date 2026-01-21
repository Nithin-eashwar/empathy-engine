/**
 * Empathy Engine - Background Service Worker
 * Handles context menus and background tasks
 */

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeEmpathy',
    title: '💎 Analyze Empathy',
    contexts: ['selection']
  });
  
  console.log('Empathy Engine extension installed');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeEmpathy' && info.selectionText) {
    // Store the selected text for the popup to use
    chrome.storage.local.set({ 
      selectedTextForAnalysis: info.selectionText.trim() 
    }, () => {
      // Open the popup (this triggers the popup to open)
      // Note: We can't programmatically open popup, but we can badge
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#00d4ff' });
    });
  }
});

// Clear badge when popup opens
chrome.action.onClicked.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStoredSelection') {
    chrome.storage.local.get(['selectedTextForAnalysis'], (result) => {
      sendResponse({ text: result.selectedTextForAnalysis || '' });
      // Clear after sending
      chrome.storage.local.remove('selectedTextForAnalysis');
    });
    return true; // Async response
  }
});

console.log('Empathy Engine service worker started');
