import os
import shutil
import json
import zipfile
from pathlib import Path

class ExtensionBuilder:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.extension_dir = self.base_dir / "extension"
        self.build_dir = self.base_dir / "build"
        
        # Common files for all browsers
        self.common_files = [
            "popup.html",
            "popup.css", 
            "popup.js"
        ]
        
        # Browser-specific configurations
        self.browsers = {
            "chrome": {
                "manifest": "manifest_v3.json",
                "folder": "chrome-extension",
                "zip": "phishing-shield-chrome.zip"
            },
            "firefox": {
                "manifest": "manifest_v2.json", 
                "folder": "firefox-extension",
                "zip": "phishing-shield-firefox.zip"
            },
            "edge": {
                "manifest": "manifest_v3.json",
                "folder": "edge-extension", 
                "zip": "phishing-shield-edge.zip"
            }
        }
    
    def create_icons(self):
        """Create placeholder icons for the extension"""
        icons_dir = self.extension_dir / "icons"
        icons_dir.mkdir(exist_ok=True)
        
        # Create simple SVG icons (placeholder - replace with actual icons)
        icon_svg = '''<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="10" fill="#4CAF50"/>
<path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''
        
        sizes = [16, 32, 48, 128]
        for size in sizes:
            icon_path = icons_dir / f"icon{size}.png"
            if not icon_path.exists():
                # In a real scenario, you'd convert SVG to PNG
                # For now, create a placeholder text file
                with open(icons_dir / f"icon{size}.svg", "w") as f:
                    f.write(icon_svg.format(size=size))
                print(f"Created placeholder icon: icon{size}.svg")
    
    def build_browser_extension(self, browser):
        """Build extension for specific browser"""
        config = self.browsers[browser]
        browser_dir = self.build_dir / config["folder"]
        
        # Create browser-specific directory
        if browser_dir.exists():
            shutil.rmtree(browser_dir)
        browser_dir.mkdir(parents=True)
        
        # Copy common files
        for file_name in self.common_files:
            src = self.extension_dir / file_name
            if src.exists():
                shutil.copy2(src, browser_dir / file_name)
            else:
                print(f"Warning: {file_name} not found")
        
        # Copy manifest file
        manifest_src = self.extension_dir / config["manifest"]
        if manifest_src.exists():
            shutil.copy2(manifest_src, browser_dir / "manifest.json")
        else:
            print(f"Warning: {config['manifest']} not found")
        
        # Copy icons directory
        icons_src = self.extension_dir / "icons"
        if icons_src.exists():
            shutil.copytree(icons_src, browser_dir / "icons")
        
        print(f"Built {browser} extension in {browser_dir}")
        return browser_dir
    
    def create_zip_package(self, browser, browser_dir):
        """Create ZIP package for browser extension"""
        config = self.browsers[browser]
        zip_path = self.build_dir / config["zip"]
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(browser_dir):
                for file in files:
                    file_path = Path(root) / file
                    arc_path = file_path.relative_to(browser_dir)
                    zipf.write(file_path, arc_path)
        
        print(f"Created ZIP package: {zip_path}")
        return zip_path
    
    def build_all(self):
        """Build extensions for all browsers"""
        print("🚀 Building Phishing Shield Browser Extensions")
        print("=" * 50)
        
        # Create build directory
        self.build_dir.mkdir(exist_ok=True)
        self.extension_dir.mkdir(exist_ok=True)
        
        # Create placeholder icons
        self.create_icons()
        
        # Build for each browser
        for browser in self.browsers:
            print(f"\n🔨 Building {browser.title()} extension...")
            try:
                browser_dir = self.build_browser_extension(browser)
                zip_path = self.create_zip_package(browser, browser_dir)
                print(f"✅ {browser.title()} extension ready!")
            except Exception as e:
                print(f"❌ Error building {browser} extension: {e}")
        
        print(f"\n🎉 Build complete! Check {self.build_dir} for extensions")
    
    def clean(self):
        """Clean build directory"""
        if self.build_dir.exists():
            shutil.rmtree(self.build_dir)
            print("🧹 Build directory cleaned")

def main():
    import sys
    
    builder = ExtensionBuilder()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "clean":
            builder.clean()
        elif command == "build":
            builder.build_all()
        elif command in builder.browsers:
            print(f"Building {command} extension only...")
            browser_dir = builder.build_browser_extension(command)
            builder.create_zip_package(command, browser_dir)
        else:
            print(f"Unknown command: {command}")
            print("Available commands: build, clean, chrome, firefox, edge")
    else:
        builder.build_all()

if __name__ == "__main__":
    main()