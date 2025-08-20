<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSafe README</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3 {
            color: #24292e;
        }
        h1 {
            font-size: 2.5em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 10px;
        }
        h2 {
            font-size: 1.75em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 5px;
        }
        h3 {
            font-size: 1.25em;
        }
        ul {
            list-style-type: disc;
            margin: 10px 0;
            padding-left: 20px;
        }
        pre {
            background-color: #f6f8fa;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
        }
        code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 85%;
            background-color: #f6f8fa;
            padding: 2px 4px;
            border-radius: 3px;
        }
        a {
            color: #0366d6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .emoji {
            font-size: 1.2em;
            vertical-align: middle;
        }
        .highlight {
            font-weight: bold;
            color: #24292e;
        }
    </style>
</head>
<body>
    <h1>🌐 WebSafe: Your Shield Against Phishing Attacks 🛡️</h1>
    <p>Welcome to <span class="highlight">WebSafe</span>! 🚀 A powerful Chrome extension that protects you from phishing threats by analyzing URLs in real-time using machine learning. Stay safe online with an intuitive interface and robust backend, perfect for users and developers alike. Let's make the web a safer place! 😎</p>
    <h2>🎯 What is WebSafe?</h2>
    <p>WebSafe is a security-focused Chrome extension that detects phishing URLs with a trained Random Forest model. Whether you're browsing the web or checking a suspicious link, WebSafe provides instant feedback on whether a URL is safe or malicious. Built with a sleek frontend and a Flask-powered backend, it's both user-friendly and developer-friendly! 💻</p>
    <h2>✨ Key Features</h2>
    <ul>
        <li><span class="emoji">🔍</span> <span class="highlight">Real-Time URL Scanning</span>: Instantly analyze URLs on webpages or via the extension popup.</li>
        <li><span class="emoji">🧠</span> <span class="highlight">Machine Learning Power</span>: Uses a Random Forest classifier to detect phishing with confidence scores.</li>
        <li><span class="emoji">🎨</span> <span class="highlight">Sleek Popup Interface</span>: Clean, responsive design to check URLs with ease.</li>
        <li><span class="emoji">⚡</span> <span class="highlight">Automatic Webpage Analysis</span>: Highlights risky links on any webpage you visit.</li>
        <li><span class="emoji">🌐</span> <span class="highlight">Flask API Backend</span>: Scalable server for processing URL predictions.</li>
    </ul>
    <h2>📂 Project Structure</h2>
    <pre><code>
WebSafe/
├── backend/                    # Backend logic for phishing detection
│   ├── app.py                 # Flask API for URL analysis
│   ├── phishing_model.pkl     # Pre-trained ML model
│   ├── vectorizer.pkl         # Feature extraction vectorizer
│   └── requirements.txt       # Python dependencies
├── extension/                 # Chrome extension files
│   ├── manifest.json          # Extension configuration
│   ├── popup.html            # Popup UI
│   ├── popup.js              # Popup logic and API calls
│   ├── popup.css             # Popup styling
│   ├── content.js            # Webpage URL scanning
│   ├── content.css           # Webpage highlight styling
│   ├── background.js         # Background event handling
│   ├── icon48.png            # 48x48 icon
│   └── icon128.png           # 128x128 icon
├── README.md                  # You're reading it! 📖
└── LICENSE                    # MIT License
    </code></pre>
    <h2>🛠️ Getting Started</h2>
    <h3>Prerequisites</h3>
    <ul>
        <li><span class="emoji">🐍</span> <span class="highlight">Python 3.8+</span>: For the Flask backend.</li>
        <li><span class="emoji">🌐</span> <span class="highlight">Google Chrome</span>: To load and test the extension.</li>
        <li><span class="emoji">📦</span> <span class="highlight">Dependencies</span>:
            <ul>
                <li>Python: <code>flask</code>, <code>pandas</code>, <code>scikit-learn</code>, <code>joblib</code></li>
                <li>Chrome: No additional setup needed.</li>
            </ul>
        </li>
    </ul>
    <h3>🚀 Backend Setup</h3>
    <ol>
        <li>Navigate to the backend folder:
            <pre><code>cd backend</code></pre>
        </li>
        <li>Create and activate a virtual environment:
            <pre><code>python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate</code></pre>
        </li>
        <li>Install dependencies:
            <pre><code>pip install -r requirements.txt</code></pre>
        </li>
        <li>Ensure <code>phishing_model.pkl</code> and <code>vectorizer.pkl</code> are ready (see "Training the Model" below).</li>
        <li>Start the Flask server:
            <pre><code>python app.py</code></pre>
            <p>📡 Server runs at <code>http://localhost:5000</code>.</p>
        </li>
    </ol>
    <h3>🌟 Extension Setup</h3>
    <ol>
        <li>Open Chrome and go to <code>chrome://extensions/</code>.</li>
        <li>Enable <span class="highlight">Developer mode</span> (top-right toggle).</li>
        <li>Click <span class="highlight">Load unpacked</span> and select the <code>extension</code> folder.</li>
        <li><span class="emoji">🎉</span> WebSafe will appear in your Chrome toolbar!</li>
    </ol>
    <h3>🧠 Training the Model (Optional)</h3>
    <p>To train your own phishing detection model:</p>
    <ol>
        <li>Gather a dataset of labeled URLs (phishing/legitimate).</li>
        <li>Use <code>prepare_dataset</code> in <code>app.py</code> to extract features.</li>
        <li>Train and save the model:
            <pre><code>from sklearn.ensemble import RandomForestClassifier
import joblib
model = RandomForestClassifier()
model.fit(X_train, y_train)  # Your feature and label data
joblib.dump(model, 'phishing_model.pkl')</code></pre>
        </li>
    </ol>
    <h2>🎮 How to Use</h2>
    <ul>
        <li><span class="highlight">Popup Interface</span> 📱:
            <ul>
                <li>Click the WebSafe icon in Chrome.</li>
                <li>Enter a URL and hit "Scan".</li>
                <li>See results: "Safe" ✅ or "Phishing" 🚨 with a confidence score.</li>
            </ul>
        </li>
        <li><span class="highlight">Webpage Scanning</span> 🌍:
            <ul>
                <li>Browse any site, and WebSafe auto-scans links.</li>
                <li>Risky links are highlighted for easy spotting.</li>
            </ul>
        </li>
        <li><span class="highlight">API Access</span> 🔗:
            <ul>
                <li>Send a POST request to <code>http://localhost:5000/predict</code>:
                    <pre><code>{"url": "https://example.com"}</code></pre>
                </li>
                <li>Get a response:
                    <pre><code>{"is_phishing": false, "confidence": 0.95}</code></pre>
                </li>
            </ul>
        </li>
    </ul>
    <h2>🛠️ Development Tips</h2>
    <ul>
        <li><span class="highlight">Backend</span>: Add new URL features in <code>app.py</code> for better detection.</li>
        <li><span class="highlight">Frontend</span>: Enhance <code>popup.js</code> for more interactivity or <code>content.js</code> for advanced scanning.</li>
        <li><span class="highlight">Styling</span>: Tweak <code>popup.css</code> or <code>content.css</code> for a custom look.</li>
        <li><span class="highlight">Model</span>: Experiment with other ML algorithms for improved accuracy.</li>
    </ul>
    <h2>🧪 Testing</h2>
    <ul>
        <li>Test on known phishing and legitimate URLs.</li>
        <li>Use Postman or curl to verify API responses.</li>
        <li>Check Chrome DevTools (<code>Ctrl+Shift+J</code>) for debugging logs.</li>
    </ul>
    <h2>🤝 Contributing</h2>
    <p>We'd love your help to make WebSafe even better! 🌟</p>
    <ol>
        <li>Fork the repo.</li>
        <li>Create a feature branch: <code>git checkout -b feature/cool-new-feature</code>.</li>
        <li>Commit changes: <code>git commit -m 'Add cool new feature'</code>.</li>
        <li>Push: <code>git push origin feature/cool-new-feature</code>.</li>
        <li>Open a pull request! 🚀</li>
    </ol>
    <h2>📜 License</h2>
    <p>This project is licensed under the MIT License. See the <a href="LICENSE">LICENSE</a> file for details.</p>
    <h2>🙌 Acknowledgments</h2>
    <ul>
        <li>Built as a final-year project to make the web safer.</li>
        <li>Inspired by the open-source security community. 💙</li>
        <li>Thanks to all contributors and users for supporting WebSafe!</li>
    </ul>
    <p><span class="emoji">🌟</span> <span class="highlight">Star this repo on GitHub</span> to stay updated and show your support! Let's keep the web safe together! 🛡️</p>
</body>
</html>
