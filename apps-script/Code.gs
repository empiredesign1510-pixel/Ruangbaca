const CONFIG={MAX_BOOKS:2500,MAX_DEPTH:10,CACHE_SECONDS:900,CACHE_CHUNK:50000,FILES_PER_TURN:24,FOLDERS_PER_TURN:16,MAX_SCAN_MS:270000};
const MIME={PDF:'application/pdf',FOLDER:'application/vnd.google-apps.folder',SHORTCUT:'application/vnd.google-apps.shortcut'};

function doGet(e){
  const callback=String((e&&e.parameter&&e.parameter.callback)||'');
  let result;
  try{
    if(!e||!e.parameter)throw new Error('Parameter tidak lengkap');
    const action=String(e.parameter.action||'');
    const source=String(e.parameter.folder||'');
    const folderId=extractFolderId_(source);
    if(!folderId)throw new Error('Link folder Google Drive tidak valid');
    const resourceKey=extractResourceKey_(source);
    const root=getFolder_(folderId,resourceKey);
    assertPublicFolder_(root);
    if(action==='categories'){
      const cacheId='categories_'+folderId;
      const cached=cacheRead_(cacheId);
      if(cached){result=cached}else{
        const categories=listCategories_(root);
        result={ok:true,folderId:folderId,folderName:root.getName(),count:categories.length,generatedAt:new Date().toISOString(),categories:categories};
        cacheWrite_(cacheId,result);
      }
    }else if(action==='catalog'){
      const categoryId=String(e.parameter.categoryId||'');
      const categoryName=String(e.parameter.categoryName||'Umum');
      const categoryKey=String(e.parameter.categoryKey||'');
      const requested=Math.max(24,Math.min(600,Number(e.parameter.limit||300)));
      const target=categoryId?getFolder_(categoryId,categoryKey):root;
      const cacheId=(categoryId?'category_'+categoryId:'catalog_'+folderId)+'_'+requested;
      const cached=cacheRead_(cacheId);
      if(cached){result=cached}else{
        const books=scanCatalog_(target,categoryId?[categoryName]:[],requested);
        result={ok:true,folderId:folderId,folderName:root.getName(),category:categoryName,count:books.length,limit:requested,truncated:books.length>=requested,generatedAt:new Date().toISOString(),books:books};
        cacheWrite_(cacheId,result);
      }
    }else{
      throw new Error('Action tidak didukung');
    }
  }catch(error){result={ok:false,error:String(error&&error.message||error)}}
  return respond_(result,callback);
}

function listCategories_(root){
  const categories=[],seen={};
  const add=function(id,name,key){if(!id||seen[id])return;seen[id]=true;categories.push({id:id,name:name||'Umum',resourceKey:key||''})};
  const files=root.getFiles();
  while(files.hasNext()){
    const file=files.next();
    if(file.getMimeType()===MIME.SHORTCUT&&file.getTargetMimeType()===MIME.FOLDER){
      add(file.getTargetId(),file.getName(),file.getTargetResourceKey());
    }
  }
  const folders=root.getFolders();
  while(folders.hasNext()){const folder=folders.next();add(folder.getId(),folder.getName(),'')}
  categories.sort(function(a,b){return a.name.localeCompare(b.name)});
  return categories;
}

function scanCatalog_(root,startPath,maxBooks){
  const limit=Math.max(1,Math.min(Number(maxBooks||CONFIG.MAX_BOOKS),CONFIG.MAX_BOOKS));
  const books=[],visitedFolders={},visitedFiles={},queue=[makeNode_(root,startPath||[],0)];
  const deadline=Date.now()+CONFIG.MAX_SCAN_MS;
  while(queue.length&&books.length<limit&&Date.now()<deadline){
    const node=queue.shift();
    if(node.depth>CONFIG.MAX_DEPTH)continue;
    if(!node.started){
      const folderId=node.folder.getId();
      if(visitedFolders[folderId])continue;
      visitedFolders[folderId]=true;
      node.files=node.folder.getFiles();
      node.folders=node.folder.getFolders();
      node.started=true;
    }

    let fileTurns=0;
    while(node.files.hasNext()&&fileTurns<CONFIG.FILES_PER_TURN&&books.length<limit){
      fileTurns++;
      const file=node.files.next();
      const mime=file.getMimeType();
      if(mime===MIME.SHORTCUT){
        const targetId=file.getTargetId();
        const targetMime=file.getTargetMimeType();
        const targetKey=file.getTargetResourceKey();
        if(!targetId)continue;
        try{
          if(targetMime===MIME.FOLDER){
            queue.push(makeNode_(getFolder_(targetId,targetKey),node.path.concat([file.getName()]),node.depth+1));
          }else if(targetMime===MIME.PDF){
            addPdf_(getFile_(targetId,targetKey),node.path,books,visitedFiles,file.getName());
          }
        }catch(error){console.warn('Shortcut dilewati: '+file.getName()+' — '+error.message)}
      }else if(mime===MIME.PDF||/\.pdf$/i.test(file.getName())){
        addPdf_(file,node.path,books,visitedFiles);
      }
    }

    let folderTurns=0;
    while(node.folders.hasNext()&&folderTurns<CONFIG.FOLDERS_PER_TURN){
      folderTurns++;
      const child=node.folders.next();
      queue.push(makeNode_(child,node.path.concat([child.getName()]),node.depth+1));
    }
    if(node.files.hasNext()||node.folders.hasNext())queue.push(node);
  }
  books.sort(function(a,b){return a.title.localeCompare(b.title)});
  return books;
}

function makeNode_(folder,path,depth){return {folder:folder,path:path,depth:depth,started:false,files:null,folders:null}}

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
