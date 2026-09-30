#!/usr/bin/env python3
"""
Local development & preview server for Rajkumar & Rubitha Wedding Invitation.
Solves the browser file:// CORS restriction by serving the site over HTTP.
"""
import http.server
import mimetypes
import os
import socketserver
import sys
import threading
import time
import webbrowser

# Ensure correct MIME types for ES modules, audio, fonts
mimetypes.add_type("text/javascript", ".mjs")
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("audio/mpeg", ".mp3")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("font/woff", ".woff")
mimetypes.add_type("application/json", ".json")

class WeddingRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for smooth local preview
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_GET(self):
        # Handle DevTools source maps and well-known requests gracefully
        clean_path = self.path.split("?")[0]
        if clean_path.endswith(".map") or clean_path.startswith("/.well-known/"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b"{}")
            return

        super().do_GET()

    def translate_path(self, path):
        translated = super().translate_path(path)
        if not os.path.exists(translated):
            clean = path.split("?")[0].lstrip("/")
            # Fallback 1: Root Insecurities.mp3 -> music/Insecurities.mp3
            if clean == "Insecurities.mp3" and os.path.exists("music/Insecurities.mp3"):
                return os.path.abspath("music/Insecurities.mp3")

            # Fallback 2: Any missing assets/images -> heritage or default event image
            normalized = clean.replace("\\", "/")
            if normalized.startswith("assets/images/"):
                base_name = os.path.basename(clean)
                heritage_path = os.path.join("assets", "images", "heritage", base_name)
                if os.path.exists(heritage_path):
                    return os.path.abspath(heritage_path)
                fallback_image = os.path.join("assets", "images", "heritage", "event-wedding.webp")
                if os.path.exists(fallback_image):
                    return os.path.abspath(fallback_image)

        return translated

    def log_message(self, format, *args):
        # Clean terminal logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

def find_available_port(start_port=8000, max_attempts=50):
    import socket
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("", port))
                return port
            except OSError:
                continue
    return start_port

def start_server(port=None, open_browser=True):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    selected_port = port if port else find_available_port(8000)
    server_address = ("", selected_port)
    url = f"http://localhost:{selected_port}"

    # Allow immediate address reuse
    socketserver.TCPServer.allow_reuse_address = True

    try:
        with socketserver.TCPServer(server_address, WeddingRequestHandler) as httpd:
            print("=" * 64)
            print("  Rajkumar & Rubitha Wedding Invitation - Local Preview")
            print("=" * 64)
            print(f"  - Root Directory : {base_dir}")
            print(f"  - Local Server   : {url}")
            print("  - Status         : Ready (Serving ES Modules with CORS headers)")
            print("=" * 64)
            print("  Press Ctrl+C to stop the preview server anytime.\n")

            if open_browser:
                threading.Timer(0.8, lambda: webbrowser.open(url)).start()

            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping preview server. Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"\nError starting server on port {selected_port}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    port_arg = None
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port_arg = int(sys.argv[1])
    no_browser = "--no-browser" in sys.argv
    start_server(port=port_arg, open_browser=not no_browser)
