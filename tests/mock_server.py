from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse,parse_qs
import json,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATEGORIES=[
    {'id':'mockCategoryNovel123','name':'Novel','resourceKey':''},
    {'id':'mockCategoryBusiness1','name':'Bisnis','resourceKey':''},
    {'id':'mockCategoryAI123456','name':'Belajar AI','resourceKey':''},
    {'id':'mockCategoryDesign12','name':'Desain','resourceKey':''},
]
BOOKS={
    'Novel':[{'id':'publicDriveFile123','title':'Buku Drive Pertama','category':'Novel','sizeLabel':'2 MB'}],
    'Bisnis':[{'id':'publicDriveFile456','title':'Strategi Bisnis Praktis','category':'Bisnis','sizeLabel':'5 MB'}],
    'Belajar AI':[{'id':'publicDriveFile789','title':'AI untuk Pemula','category':'Belajar AI','sizeLabel':'3 MB'},{'id':'publicDriveFile790','title':'Prompt yang Efektif','category':'Belajar AI','sizeLabel':'4 MB'}],
    'Desain':[{'id':'publicDriveFile791','title':'Dasar Tata Letak','category':'Desain','sizeLabel':'2 MB'}],
}
class H(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        old=os.getcwd();os.chdir(ROOT)
        try:return super().translate_path(path)
        finally:os.chdir(old)
    def do_GET(self):
        parsed=urlparse(self.path)
        if parsed.path=='/apps-script':
            q=parse_qs(parsed.query);callback=q.get('callback',['callback'])[0];action=q.get('action',[''])[0]
            if action=='categories':
                payload={'ok':True,'folderName':'Google Drive Mock','count':len(CATEGORIES),'categories':CATEGORIES}
            elif action=='catalog':
                name=q.get('categoryName',['Novel'])[0];books=BOOKS.get(name,[])
                payload={'ok':True,'folderName':'Google Drive Mock','category':name,'count':len(books),'truncated':False,'books':books}
            else:
                payload={'ok':False,'error':'Action tidak didukung'}
            body=(callback+'('+json.dumps(payload)+');').encode()
            self.send_response(200);self.send_header('Content-Type','application/javascript');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
        if parsed.path=='/api/pdf':
            p=os.path.join(ROOT,'demo-book.pdf');size=os.path.getsize(p)
            self.send_response(200);self.send_header('Content-Type','application/pdf');self.send_header('Content-Length',str(size));self.send_header('Accept-Ranges','bytes');self.end_headers();self.wfile.write(open(p,'rb').read());return
        return super().do_GET()
ThreadingHTTPServer(('127.0.0.1',8767),H).serve_forever()
