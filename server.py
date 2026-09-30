import http.server
import socketserver
import os
from urllib.parse import urlparse

http.server.SimpleHTTPRequestHandler.extensions_map.update({
    '.avif': 'image/avif',
    '.webp': 'image/webp',
})

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        request_path = urlparse(self.path).path.replace('\\', '/')
        if request_path.startswith('/assets/isadora/book/'):
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        else:
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

PORT = 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with ThreadedHTTPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
    print(f"Serving at port {PORT} multi-threaded with strict no-cache headers")
    httpd.serve_forever()
