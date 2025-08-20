// Extension popup functionality
class PhishingShield {
    constructor() {
        this.apiUrl = 'http://localhost:5000';
        this.currentUrl = '';
        this.init();
    }

    async init() {
        await this.getCurrentTab();
        this.setupEventListeners();
        this.checkApiStatus();
    }

    async getCurrentTab() {
        try {
            // Get current active tab
            const tabs = await this.queryTabs({ active: true, currentWindow: true });
            if (tabs && tabs.length > 0) {
                this.currentUrl = tabs[0].url;
                this.displayCurrentUrl(this.currentUrl);
            } else {
                this.displayCurrentUrl('Unable to get current URL');
            }
        } catch (error) {
            console.error('Error getting current tab:', error);
            this.displayCurrentUrl('Error loading URL');
        }
    }

    queryTabs(queryInfo) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.query(queryInfo, resolve);
            } else if (typeof browser !== 'undefined' && browser.tabs) {
                browser.tabs.query(queryInfo).then(resolve);
            } else {
                resolve([]);
            }
        });
    }

    displayCurrentUrl(url) {
        const urlElement = document.getElementById('url-text');
        if (url.length > 50) {
            urlElement.textContent = url.substring(0, 47) + '...';
            urlElement.title = url;
        } else {
            urlElement.textContent = url;
            urlElement.title = url;
        }
    }

    setupEventListeners() {
        const scanBtn = document.getElementById('scan-btn');
        scanBtn.addEventListener('click', () => this.scanCurrentUrl());
    }

    async checkApiStatus() {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        try {
            const response = await fetch(`${this.apiUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000
            });

            if (response.ok) {
                statusDot.className = 'status-dot online';
                statusText.textContent = 'API Status: Online';
            } else {
                throw new Error('API not responding');
            }
        } catch (error) {
            statusDot.className = 'status-dot offline';
            statusText.textContent = 'API Status: Offline';
            console.error('API health check failed:', error);
        }
    }

    async scanCurrentUrl() {
        if (!this.currentUrl || this.currentUrl === 'Unable to get current URL') {
            this.showError('No valid URL to scan');
            return;
        }

        // Don't scan extension pages or special URLs
        if (this.currentUrl.startsWith('chrome://') || 
            this.currentUrl.startsWith('moz-extension://') ||
            this.currentUrl.startsWith('chrome-extension://') ||
            this.currentUrl.startsWith('about:') ||
            this.currentUrl.startsWith('file://')) {
            this.showError('Cannot scan this type of URL');
            return;
        }

        this.showLoading(true);
        this.hideResults();

        try {
            const response = await fetch(`${this.apiUrl}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: this.currentUrl
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();
            this.displayResults(result);

        } catch (error) {
            console.error('Scan failed:', error);
            this.showError('Scan failed. Please check if the API is running.');
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const scanBtn = document.getElementById('scan-btn');
        const buttonText = scanBtn.querySelector('.button-text');
        const spinner = document.getElementById('spinner');

        if (show) {
            scanBtn.disabled = true;
            buttonText.style.display = 'none';
            spinner.style.display = 'block';
        } else {
            scanBtn.disabled = false;
            buttonText.style.display = 'block';
            spinner.style.display = 'none';
        }
    }

    hideResults() {
        const resultsSection = document.getElementById('results');
        resultsSection.style.display = 'none';}}