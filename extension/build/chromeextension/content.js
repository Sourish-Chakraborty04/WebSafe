// Declare chrome variable to fix undeclared variable error
const chrome = window.chrome;

class ContentSecurityMonitor {
  constructor() {
    this.init();
  }

  init() {
    this.monitorPageLoad();
    this.monitorClipboard();
    this.createNotificationContainer();
  }

  monitorPageLoad() {
    // Check current page URL
    this.analyzeCurrentPage();

    // Monitor for navigation changes
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        this.analyzeCurrentPage();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  async analyzeCurrentPage() {
    const url = window.location.href;

    // Skip analysis for certain URLs
    if (this.shouldSkipUrl(url)) return;

    try {
      // Send message to background script for analysis
      chrome.runtime.sendMessage(
        {
          action: "analyzeUrl",
          url: url,
        },
        (response) => {
          if (response && response.score < 5) {
            this.showSecurityWarning(response);
          }
        },
      );
    } catch (error) {
      console.error("Content script analysis failed:", error);
    }
  }

  shouldSkipUrl(url) {
    const skipPatterns = ["chrome://", "chrome-extension://", "moz-extension://", "about:", "file://"];
    return skipPatterns.some((pattern) => url.startsWith(pattern));
  }

  monitorClipboard() {
    // Monitor paste events for URL analysis
    document.addEventListener("paste", async (e) => {
      try {
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData("text");

        if (this.isUrl(pastedData)) {
          // Brief delay to allow paste to complete
          setTimeout(() => {
            this.showQuickAnalysisOption(pastedData);
          }, 100);
        }
      } catch (error) {
        console.error("Clipboard monitoring failed:", error);
      }
    });
  }

  isUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  createNotificationContainer() {
    if (document.getElementById("websafe-notifications")) return;

    const container = document.createElement("div");
    container.id = "websafe-notifications";
    document.body.appendChild(container);
  }

  showSecurityWarning(analysis) {
    const notification = this.createNotification({
      type: "warning",
      title: "Security Warning",
      message: `This website has a low security score (${analysis.score}/10)`,
      actions: [
        { text: "View Details", action: () => this.openExtensionPopup() },
        { text: "Dismiss", action: () => notification.remove() },
      ],
    });

    this.showNotification(notification);
  }

  showQuickAnalysisOption(url) {
    const notification = this.createNotification({
      type: "info",
      title: "URL Detected",
      message: "Would you like to analyze this link for security?",
      actions: [
        { text: "Analyze", action: () => this.quickAnalyze(url) },
        { text: "Dismiss", action: () => notification.remove() },
      ],
    });

    this.showNotification(notification);
  }

  createNotification({ type, title, message, actions }) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-bar ${type}"></div>
        <div>
          <div class="notification-title">${title}</div>
          <div class="notification-message">${message}</div>
          <div class="notification-actions">
            ${actions
              .map(
                (action) => `
              <button class="${type}" onclick="(${action.action.toString()})()">${action.text}</button>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    return notification;
  }

  showNotification(notification) {
    const container = document.getElementById("websafe-notifications");
    container.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  async quickAnalyze(url) {
    // Send to background for analysis
    chrome.runtime.sendMessage({
      action: "quickAnalyze",
      url: url,
    });

    // Show analyzing notification
    const notification = this.createNotification({
      type: "info",
      title: "Analyzing...",
      message: "Checking link security...",
      actions: [],
    });

    this.showNotification(notification);

    // Remove after 3 seconds
    setTimeout(() => notification.remove(), 3000);
  }

  openExtensionPopup() {
    chrome.runtime.sendMessage({ action: "openPopup" });
  }
}

// Initialize content script
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new ContentSecurityMonitor();
  });
} else {
  new ContentSecurityMonitor();
}