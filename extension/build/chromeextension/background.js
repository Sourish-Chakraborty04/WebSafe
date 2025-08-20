// Declare the chrome variable to fix lint/correctness/noUndeclaredVariables error
const chrome = window.chrome;

class BackgroundSecurityService {
  constructor() {
    this.init();
  }

  init() {
    this.setupMessageListeners();
    this.setupTabListeners();
    this.initializeStorage();
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case "analyzeUrl":
          this.analyzeUrl(request.url).then(sendResponse);
          return true; // Keep message channel open for async response

        case "quickAnalyze":
          this.quickAnalyze(request.url);
          break;

        case "openPopup":
          chrome.action.openPopup();
          break;
      }
    });
  }

  setupTabListeners() {
    // Monitor tab updates for automatic scanning
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete" && tab.url) {
        this.scanTabUrl(tab.url, tabId);
      }
    });
  }

  async initializeStorage() {
    // Initialize default settings
    const defaults = {
      autoScan: true,
      notificationsEnabled: true,
      theme: "light",
    };

    chrome.storage.sync.get(Object.keys(defaults), (result) => {
      const updates = {};
      Object.keys(defaults).forEach((key) => {
        if (result[key] === undefined) {
          updates[key] = defaults[key];
        }
      });

      if (Object.keys(updates).length > 0) {
        chrome.storage.sync.set(updates);
      }
    });
  }

  async analyzeUrl(url) {
    try {
      // Check cache first
      const cached = await this.getCachedAnalysis(url);
      if (cached && this.isCacheValid(cached)) {
        return cached;
      }

      // Perform new analysis
      const analysis = await this.performSecurityAnalysis(url);

      // Cache result
      await this.cacheAnalysis(url, analysis);

      return analysis;
    } catch (error) {
      console.error("URL analysis failed:", error);
      return this.getDefaultAnalysis(url);
    }
  }

  async performSecurityAnalysis(url) {
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();
      // Scale score from 0-100 to 1-10
      return {
        url: data.url,
        score: Math.round(data.score / 10),
        parameters: data.parameters,
        timestamp: new Date(data.timestamp).getTime(),
        domain: new URL(url).hostname
      };
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async getCachedAnalysis(url) {
    return new Promise((resolve) => {
      chrome.storage.local.get([`analysis_${url}`], (result) => {
        resolve(result[`analysis_${url}`] || null);
      });
    });
  }

  isCacheValid(cached) {
    const maxAge = 30 * 60 * 1000; // 30 minutes
    return Date.now() - cached.timestamp < maxAge;
  }

  async cacheAnalysis(url, analysis) {
    const key = `analysis_${url}`;
    chrome.storage.local.set({ [key]: analysis });
  }

  getDefaultAnalysis(url) {
    return {
      url,
      score: 5,
      parameters: [
        {
          name: "Analysis Error",
          icon: "⚠️",
          status: "warning",
          description: "Unable to complete security analysis",
        },
      ],
      timestamp: Date.now(),
      error: true,
    };
  }

  async scanTabUrl(url, tabId) {
    // Skip certain URLs
    if (this.shouldSkipUrl(url)) return;

    const analysis = await this.analyzeUrl(url);

    // Update badge based on score
    this.updateBadge(tabId, analysis.score);

    // Store analysis for quick access
    chrome.storage.local.set({ [`tab_${tabId}`]: analysis });
  }

  shouldSkipUrl(url) {
    const skipPatterns = ["chrome://", "chrome-extension://", "moz-extension://", "about:", "file://", "data:"];
    return skipPatterns.some((pattern) => url.startsWith(pattern));
  }

  updateBadge(tabId, score) {
    let badgeText = "";
    let badgeColor = "#10b981"; // Green

    if (score < 4) {
      badgeText = "!";
      badgeColor = "#ef4444"; // Red
    } else if (score < 7) {
      badgeText = "?";
      badgeColor = "#f59e0b"; // Yellow
    }

    chrome.action.setBadgeText({ text: badgeText, tabId });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId });
  }

  async quickAnalyze(url) {
    const analysis = await this.analyzeUrl(url);
    if (analysis.score < 5) {
      console.log("Quick analysis found security concerns:", analysis);
    }
  }
}

// Initialize background service
new BackgroundSecurityService();