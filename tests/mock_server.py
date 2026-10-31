from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class H(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        old=os.getcwd();os.chdir(ROOT)
        try:return super().translate_path(path)
        finally:os.chdir(old)
    def do_GET(self):
        if self.path.startswith('/api/catalog'):
            body=json.dumps({'ok':True,'count':2,'books':[{'id':'drivebook12345','title':'Buku Drive Pertama','category':'Novel','sizeLabel':'2 MB','pdfUrl':'/api/pdf?id=drivebook12345'},{'id':'drivebook67890','title':'Buku Drive Kedua','category':'Bisnis','sizeLabel':'5 MB','pdfUrl':'/api/pdf?id=drivebook67890'}]}).encode()
            self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
        if self.path.startswith('/api/pdf'):
            p=os.path.join(ROOT,'demo-book.pdf');size=os.path.getsize(p)
            self.send_response(200);self.send_header('Content-Type','application/pdf');self.send_header('Content-Length',str(size));self.send_header('Accept-Ranges','bytes');self.end_headers();self.wfile.write(open(p,'rb').read());return
        return super().do_GET()
ThreadingHTTPServer(('127.0.0.1',8766),H).serve_forever()
