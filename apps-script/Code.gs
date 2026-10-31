const CONFIG={MAX_BOOKS:2500,MAX_DEPTH:10,CACHE_SECONDS:900,CACHE_CHUNK:50000};
const MIME={PDF:'application/pdf',FOLDER:'application/vnd.google-apps.folder',SHORTCUT:'application/vnd.google-apps.shortcut'};

function doGet(e){
  const callback=String((e&&e.parameter&&e.parameter.callback)||'');
  let result;
  try{
    if(!e||!e.parameter||e.parameter.action!=='catalog')throw new Error('Action tidak didukung');
    const source=String(e.parameter.folder||'');
    const folderId=extractFolderId_(source);
    if(!folderId)throw new Error('Link folder Google Drive tidak valid');
    const cached=cacheRead_(folderId);
    if(cached){result=cached}else{
      const resourceKey=extractResourceKey_(source);
      const root=getFolder_(folderId,resourceKey);
      assertPublicFolder_(root);
      const books=scanCatalog_(root);
      result={ok:true,folderId:folderId,folderName:root.getName(),count:books.length,generatedAt:new Date().toISOString(),books:books};
      cacheWrite_(folderId,result);
    }
  }catch(error){result={ok:false,error:String(error&&error.message||error)}}
  return respond_(result,callback);
}

function scanCatalog_(root){
  const books=[],visitedFolders={},visitedFiles={};
  walk_(root,[],0,books,visitedFolders,visitedFiles);
  books.sort(function(a,b){return a.title.localeCompare(b.title)});
  return books;
}

function walk_(folder,path,depth,books,visitedFolders,visitedFiles){
  if(depth>CONFIG.MAX_DEPTH||books.length>=CONFIG.MAX_BOOKS)return;
  const folderId=folder.getId();
  if(visitedFolders[folderId])return;
  visitedFolders[folderId]=true;

  const files=folder.getFiles();
  while(files.hasNext()&&books.length<CONFIG.MAX_BOOKS){
    const file=files.next();
    const mime=file.getMimeType();
    if(mime===MIME.SHORTCUT){
      const targetId=file.getTargetId();
      const targetMime=file.getTargetMimeType();
      const targetKey=file.getTargetResourceKey();
      if(!targetId)continue;
      try{
        if(targetMime===MIME.FOLDER){
          const targetFolder=getFolder_(targetId,targetKey);
          walk_(targetFolder,path.concat([file.getName()]),depth+1,books,visitedFolders,visitedFiles);
        }else if(targetMime===MIME.PDF){
          addPdf_(getFile_(targetId,targetKey),path,books,visitedFiles,file.getName());
        }
      }catch(error){console.warn('Shortcut dilewati: '+file.getName()+' — '+error.message)}
      continue;
    }
    if(mime===MIME.PDF||/\.pdf$/i.test(file.getName()))addPdf_(file,path,books,visitedFiles);
  }

  const folders=folder.getFolders();
  while(folders.hasNext()&&books.length<CONFIG.MAX_BOOKS){
    const child=folders.next();
    walk_(child,path.concat([child.getName()]),depth+1,books,visitedFolders,visitedFiles);
  }
}

function addPdf_(file,path,books,visitedFiles,displayName){
  const id=file.getId();
  if(visitedFiles[id])return;
  visitedFiles[id]=true;
  const name=displayName||file.getName();
  const size=Number(file.getSize()||0);
  books.push({id:id,title:name.replace(/\.pdf$/i,'').replace(/_/g,' '),name:name,category:path[0]||'Umum',path:path.join(' / '),size:size,sizeLabel:sizeLabel_(size),modifiedTime:file.getLastUpdated().toISOString()});
}

function getFolder_(id,key){return key&&DriveApp.getFolderByIdAndResourceKey?DriveApp.getFolderByIdAndResourceKey(id,key):DriveApp.getFolderById(id)}
function getFile_(id,key){return key&&DriveApp.getFileByIdAndResourceKey?DriveApp.getFileByIdAndResourceKey(id,key):DriveApp.getFileById(id)}
function extractFolderId_(value){const match=String(value).match(/\/folders\/([A-Za-z0-9_-]{10,})/)||String(value).match(/^([A-Za-z0-9_-]{10,})$/);return match?match[1]:''}
function extractResourceKey_(value){const match=String(value).match(/[?&]resourcekey=([^&#]+)/i);return match?decodeURIComponent(match[1]):''}
function sizeLabel_(bytes){if(!bytes)return '';if(bytes<1048576)return Math.ceil(bytes/1024)+' KB';return (bytes/1048576).toFixed(bytes>10485760?0:1)+' MB'}
function assertPublicFolder_(folder){try{const access=folder.getSharingAccess();if(access===DriveApp.Access.PRIVATE)throw new Error('Folder masih Private. Ubah ke Anyone with the link / Viewer.')}catch(error){if(/Private/.test(error.message))throw error}}

function respond_(data,callback){
  const json=JSON.stringify(data);
  if(callback&&/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback))return ContentService.createTextOutput(callback+'('+json+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function cacheRead_(folderId){
  try{const cache=CacheService.getScriptCache(),prefix='rb_'+folderId+'_',meta=cache.get(prefix+'meta');if(!meta)return null;const count=Number(meta),keys=[];for(let i=0;i<count;i++)keys.push(prefix+i);const parts=cache.getAll(keys);let json='';for(const key of keys){if(!parts[key])return null;json+=parts[key]}return JSON.parse(json)}catch(error){return null}
}
function cacheWrite_(folderId,data){
  try{const cache=CacheService.getScriptCache(),prefix='rb_'+folderId+'_',json=JSON.stringify(data),values={};let count=0;for(let i=0;i<json.length;i+=CONFIG.CACHE_CHUNK)values[prefix+(count++)]=json.slice(i,i+CONFIG.CACHE_CHUNK);values[prefix+'meta']=String(count);cache.putAll(values,CONFIG.CACHE_SECONDS)}catch(error){console.warn('Cache dilewati: '+error.message)}
}
