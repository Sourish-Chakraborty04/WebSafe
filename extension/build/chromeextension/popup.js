class WebSafeUI {
  constructor() {
    this.urlInput = document.getElementById('urlInput');
    this.analyzeBtn = document.getElementById('analyzeBtn');
    this.pasteBtn = document.getElementById('pasteBtn');
    this.themeToggle = document.getElementById('themeToggle');
    this.resultsSection = document.getElementById('resultsSection');
    this.scoreValue = document.getElementById('scoreValue');
    this.progressFill = document.getElementById('progressFill');
    this.parametersList = document.getElementById('parametersList');
    this.loader = document.getElementById('loader');
    this.init();
  }

  init() {
    document.body.classList.add('popup-collapsed'); // Start collapsed
    this.setupEventListeners();
    this.loadTheme();
    this.checkAutoScanStatus();
  }

  setupEventListeners() {
    this.analyzeBtn.addEventListener('click', () => this.handleAnalyze());
    this.pasteBtn.addEventListener('click', () => this.handlePaste());
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.urlInput.addEventListener('input', () => this.validateInput());
  }

  async handleAnalyze() {
    const url = this.urlInput.value.trim();
    if (!url) {
      this.showError('Please enter a URL');
      return;
    }

    try {
      this.showLoading(true);
      const analysis = await this.performAnalysis(url);
      this.displayResults(analysis);
      this.expandPopup(); //this to trigger the animation after results!
    } catch (error) {
      this.showError('Analysis failed. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  async performAnalysis(url) {
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      this.urlInput.value = text;
      this.validateInput();
    } catch (error) {
      this.showError('Failed to paste from clipboard');
    }
  }

  validateInput() {
    const url = this.urlInput.value.trim();
    const isValid = url && /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/.test(url);
    this.analyzeBtn.disabled = !isValid;
  }

  displayResults(analysis) {
    this.resultsSection.classList.remove('hidden');
    
    // Scale score from 0-100 to 0-10 for display
    const score = Math.round(analysis.score / 10);
    this.scoreValue.textContent = `${score}/10`;
    
    const percentage = score * 10;
    this.progressFill.style.width = `${percentage}%`;
    
    this.parametersList.innerHTML = '';
    analysis.parameters.forEach(param => {
      const paramElement = document.createElement('div');
      paramElement.className = 'parameter-item';
      paramElement.innerHTML = `
        <div class="parameter-name">
          <span>${param.icon}</span>
          <span>${param.name}</span>
        </div>
        <span class="parameter-status status-${param.status}">${param.status.charAt(0).toUpperCase() + param.status.slice(1)}</span>
      `;
      this.parametersList.appendChild(paramElement);
    });
  }

  showError(message) {
    alert(message); // Replace with better UI error handling in production
  }

  showLoading(isLoading) {
    if (isLoading) {
      this.analyzeBtn.disabled = true;
      this.analyzeBtn.querySelector('.btn-text').classList.add('hidden');
      this.loader.classList.remove('hidden');
    } else {
      this.analyzeBtn.disabled = false;
      this.analyzeBtn.querySelector('.btn-text').classList.remove('hidden');
      this.loader.classList.add('hidden');
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    this.themeToggle.querySelector('.theme-icon').textContent = newTheme === 'light' ? '🌙' : '☀️';
    chrome.storage.sync.set({ theme: newTheme });
  }

  loadTheme() {
    chrome.storage.sync.get(['theme'], (result) => {
      const theme = result.theme || 'light';
      document.documentElement.setAttribute('data-theme', theme);
      this.themeToggle.querySelector('.theme-icon').textContent = theme === 'light' ? '🌙' : '☀️';
    });
  }

  checkAutoScanStatus() {
    chrome.storage.sync.get(['autoScan'], (result) => {
      const autoScan = result.autoScan !== false;
      const statusDot = document.querySelector('.status-dot');
      if (autoScan) {
        statusDot.classList.add('active');
      } else {
        statusDot.classList.remove('active');
      }
    });
  }
    expandPopup() {
    document.body.classList.remove('popup-collapsed');
    document.body.classList.add('popup-expanded');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WebSafeUI();
});