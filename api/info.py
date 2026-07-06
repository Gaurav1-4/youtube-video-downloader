from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        url = query.get('url', [None])[0]
        
        if not url:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"error": "Missing url"}')
            return
            
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            # Extract basic info
            result = {
                "title": info.get('title'),
                "thumbnail": info.get('thumbnail'),
                "author": info.get('uploader'),
                "lengthSeconds": info.get('duration'),
                "formats": info.get('formats')
            }
            self.wfile.write(json.dumps(result).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
