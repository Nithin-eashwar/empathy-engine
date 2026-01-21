/**
 * Empathy Engine - Popup Script
 * Handles UI interactions and API communication
 */

// ===== CONFIGURATION =====
const API_BASE_URL = 'http://localhost:8000/api/v1';

// ===== DOM ELEMENTS =====
const elements = {
  textInput: document.getElementById('textInput'),
  styleSelect: document.getElementById('styleSelect'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  loadingSection: document.getElementById('loadingSection'),
  resultsSection: document.getElementById('resultsSection'),
  errorSection: document.getElementById('errorSection'),
  errorMessage: document.getElementById('errorMessage'),
  retryBtn: document.getElementById('retryBtn'),
  
  // Scores
  warmthScore: document.getElementById('warmthScore'),
  warmthValue: document.getElementById('warmthValue'),
  validationScore: document.getElementById('validationScore'),
  validationValue: document.getElementById('validationValue'),
  perspectiveScore: document.getElementById('perspectiveScore'),
  perspectiveValue: document.getElementById('perspectiveValue'),
  supportivenessScore: document.getElementById('supportivenessScore'),
  supportivenessValue: document.getElementById('supportivenessValue'),
  
  // Issues
  issuesCard: document.getElementById('issuesCard'),
  issuesList: document.getElementById('issuesList'),
  
  // Rewrite
  rewriteContent: document.getElementById('rewriteContent'),
  copyBtn: document.getElementById('copyBtn'),
  thumbsUp: document.getElementById('thumbsUp'),
  thumbsDown: document.getElementById('thumbsDown'),
  
  // Status
  statusIndicator: document.getElementById('statusIndicator')
};

// ===== STATE =====
let currentMessageId = null;
let currentRewrite = '';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  // Try to get selected text from the active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' }, (response) => {
        if (response?.selectedText) {
          elements.textInput.value = response.selectedText;
        }
      });
    }
  } catch (err) {
    console.log('Could not get selected text:', err);
  }
  
  // Load available styles from API
  loadStyles();
  
  // Check API status
  checkApiStatus();
});

// ===== EVENT LISTENERS =====
elements.analyzeBtn.addEventListener('click', analyzeText);
elements.retryBtn.addEventListener('click', analyzeText);
elements.copyBtn.addEventListener('click', copyRewrite);
elements.thumbsUp.addEventListener('click', () => submitFeedback(1));
elements.thumbsDown.addEventListener('click', () => submitFeedback(-1));

// Allow Enter key to analyze (with Ctrl/Cmd)
elements.textInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    analyzeText();
  }
});

// ===== CUSTOM DROPDOWN HANDLING =====
const dropdown = document.getElementById('styleDropdown');
const dropdownToggle = document.getElementById('dropdownToggle');
const dropdownMenu = document.getElementById('dropdownMenu');
const dropdownLabel = document.getElementById('dropdownLabel');
const dropdownIcon = document.querySelector('.dropdown-icon');
const dropdownItems = document.querySelectorAll('.dropdown-item');

// Toggle dropdown
dropdownToggle.addEventListener('click', (e) => {
  e.preventDefault();
  dropdown.classList.toggle('open');
});

// Handle item selection
dropdownItems.forEach(item => {
  item.addEventListener('click', () => {
    const value = item.dataset.value;
    const icon = item.dataset.icon;
    const label = item.querySelector('.item-label').textContent;
    
    // Update hidden input
    elements.styleSelect.value = value;
    
    // Update toggle display
    dropdownLabel.textContent = label;
    dropdownIcon.textContent = icon;
    
    // Update active state
    dropdownItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    // Close dropdown
    dropdown.classList.remove('open');
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});

// Close dropdown on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    dropdown.classList.remove('open');
  }
});

// ===== API FUNCTIONS =====

async function checkApiStatus() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/`);
    if (response.ok) {
      updateStatus('Connected', 'success');
    } else {
      updateStatus('API Error', 'error');
    }
  } catch (err) {
    updateStatus('Offline', 'error');
  }
}

async function loadStyles() {
  try {
    const response = await fetch(`${API_BASE_URL}/styles`);
    if (response.ok) {
      const data = await response.json();
      // Styles are already hardcoded in HTML, but we could update dynamically
      console.log('Available styles:', data.styles);
    }
  } catch (err) {
    console.log('Could not load styles:', err);
  }
}

async function analyzeText() {
  const text = elements.textInput.value.trim();
  
  if (!text) {
    showToast('Please enter some text to analyze');
    return;
  }
  
  const style = elements.styleSelect.value;
  
  // Show loading state
  showSection('loading');
  
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        style: style
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    displayResults(data);
    
  } catch (err) {
    console.error('Analysis error:', err);
    showError(err.message || 'Could not connect to Empathy Engine backend');
  }
}

async function submitFeedback(rating) {
  if (!currentMessageId) {
    showToast('No message to rate');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message_id: currentMessageId,
        rating: rating
      })
    });
    
    if (response.ok) {
      // Update button states
      if (rating > 0) {
        elements.thumbsUp.classList.add('active-up');
        elements.thumbsDown.classList.remove('active-down');
      } else {
        elements.thumbsDown.classList.add('active-down');
        elements.thumbsUp.classList.remove('active-up');
      }
      showToast(rating > 0 ? 'Thanks for the feedback! 👍' : 'We\'ll improve! 🙏');
    }
  } catch (err) {
    console.error('Feedback error:', err);
    showToast('Could not submit feedback');
  }
}

// ===== DISPLAY FUNCTIONS =====

function displayResults(data) {
  currentMessageId = data.message_id;
  
  // Update scores
  const scores = data.empathy_scores;
  updateScore('warmth', scores.warmth);
  updateScore('validation', scores.validation);
  updateScore('perspective', scores.perspective_taking);
  updateScore('supportiveness', scores.supportiveness);
  
  // Update issues
  displayIssues(data.issues);
  
  // Update rewrite
  if (data.rewrites && data.rewrites.length > 0) {
    currentRewrite = data.rewrites[0].text;
    elements.rewriteContent.innerHTML = `
      <div class="rewrite-style">${data.rewrites[0].style}</div>
      <div class="rewrite-text">${escapeHtml(currentRewrite)}</div>
    `;
  }
  
  // Reset feedback buttons
  elements.thumbsUp.classList.remove('active-up');
  elements.thumbsDown.classList.remove('active-down');
  
  // Show results
  showSection('results');
}

function updateScore(name, value) {
  // Value is 0-10, convert to percentage
  const percentage = Math.round(value * 10);
  const scoreEl = elements[`${name}Score`];
  const valueEl = elements[`${name}Value`];
  
  if (scoreEl && valueEl) {
    scoreEl.style.setProperty('--score', `${percentage}%`);
    valueEl.textContent = `${percentage}%`;
    
    // Color based on score
    if (percentage >= 70) {
      scoreEl.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
    } else if (percentage >= 40) {
      scoreEl.style.background = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
    } else {
      scoreEl.style.background = 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
    }
  }
}

function displayIssues(issues) {
  elements.issuesList.innerHTML = '';
  
  if (!issues || issues.length === 0) {
    elements.issuesList.innerHTML = `
      <div class="no-issues">
        <span>✅</span>
        <span>No issues detected - your message looks empathetic!</span>
      </div>
    `;
    return;
  }
  
  issues.forEach(issue => {
    const issueEl = document.createElement('div');
    issueEl.className = 'issue-item';
    issueEl.innerHTML = `
      <div class="issue-span">"${escapeHtml(issue.span)}"</div>
      <div class="issue-text">${escapeHtml(issue.issue)}</div>
    `;
    elements.issuesList.appendChild(issueEl);
  });
}

async function copyRewrite() {
  if (!currentRewrite) {
    showToast('No rewrite to copy');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(currentRewrite);
    showToast('Copied to clipboard! 📋');
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = currentRewrite;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied to clipboard! 📋');
  }
}

// ===== UI HELPERS =====

function showSection(section) {
  elements.loadingSection.classList.add('hidden');
  elements.resultsSection.classList.add('hidden');
  elements.errorSection.classList.add('hidden');
  
  if (section === 'loading') {
    elements.loadingSection.classList.remove('hidden');
  } else if (section === 'results') {
    elements.resultsSection.classList.remove('hidden');
  } else if (section === 'error') {
    elements.errorSection.classList.remove('hidden');
  }
}

function showError(message) {
  elements.errorMessage.textContent = message;
  showSection('error');
}

function updateStatus(text, type) {
  const statusText = elements.statusIndicator.querySelector('.status-text');
  const statusDot = elements.statusIndicator.querySelector('.status-dot');
  
  statusText.textContent = text;
  statusDot.style.background = type === 'success' ? 'var(--success)' : 'var(--error)';
}

function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  // Create new toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
