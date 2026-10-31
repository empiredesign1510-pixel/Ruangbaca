from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse,parse_qs
import json,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOKS=[{'id':'publicDriveFile123','title':'Buku Drive Pertama','category':'Novel','sizeLabel':'2 MB'},{'id':'publicDriveFile456','title':'Buku Drive Kedua','category':'Bisnis','sizeLabel':'5 MB'}]
class H(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        old=os.getcwd();os.chdir(ROOT)
        try:return super().translate_path(path)
        finally:os.chdir(old)
    def do_GET(self):
        parsed=urlparse(self.path)
        if parsed.path=='/apps-script':
            q=parse_qs(parsed.query);callback=q.get('callback',['callback'])[0]
            body=(callback+'('+json.dumps({'ok':True,'count':len(BOOKS),'books':BOOKS})+');').encode()
            self.send_response(200);self.send_header('Content-Type','application/javascript');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
        if parsed.path=='/api/pdf':
            p=os.path.join(ROOT,'demo-book.pdf');size=os.path.getsize(p)
            self.send_response(200);self.send_header('Content-Type','application/pdf');self.send_header('Content-Length',str(size));self.send_header('Accept-Ranges','bytes');self.end_headers();self.wfile.write(open(p,'rb').read());return
        return super().do_GET()
ThreadingHTTPServer(('127.0.0.1',8767),H).serve_forever()
