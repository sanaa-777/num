#!/usr/bin/env node
const https = require('https'), fs = require('fs'), path = require('path'), crypto = require('crypto'), zlib = require('zlib');
const SITE_ID = 'dalil-yemen-deel';
const SA_PATH = path.join(__dirname, 'service-account.json');
const DEPLOY_FILES = [
  'index.html','admin.html','about.html','privacy.html','share.html','404.html',
  'manifest.json','sw.js','firebase-messaging-sw.js',
  'app/firebase-config.js','app/auth-firestore.js','app/data-firestore.js',
  'app/admin-firestore.js','app/ads-firestore.js','app/offers-firestore.js',
  'app/jobs-firestore.js','app/events-firestore.js','app/pricing-firestore.js',
  'app/image-storage.js','app/error-tracker.js','app/app.js',
  'app/build-meta.js','app/version-manager.js','app/styles.css','app/tailwind.css','app/lucide-local.js'
];

function b64url(b){return Buffer.from(b).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');}
function req(url,opts,body,_d){_d=_d||0;if(_d>5)return Promise.reject(new Error('redirect loop'));return new Promise((res,rej)=>{const u=new URL(url);const o={hostname:u.hostname,path:u.pathname+u.search,method:opts.method||'GET',headers:opts.headers||{}};const r=https.request(o,resp=>{if([301,302,307,308].includes(resp.statusCode)&&resp.headers.location)return req(resp.headers.location,opts,body,_d+1).then(res).catch(rej);const c=[];resp.on('data',d=>c.push(d));resp.on('end',()=>res({status:resp.statusCode,data:Buffer.concat(c).toString()}));});r.on('error',rej);if(body)r.write(body);r.end();});}

async function main(){
  if(!fs.existsSync(SA_PATH)){console.error('❌ Missing service-account.json');process.exit(1);}
  const sa=JSON.parse(fs.readFileSync(SA_PATH,'utf8'));
  console.log('📋',sa.project_id);
  console.log('🔑 Token...');
  const now=Math.floor(Date.now()/1000);
  const u=b64url(JSON.stringify({alg:'RS256',typ:'JWT'}))+'.'+b64url(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/firebase',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}));
  const sig=b64url(crypto.createSign('RSA-SHA256').update(u).sign(sa.private_key));
  const tr=await req('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'}},'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+u+'.'+sig);
  const token=JSON.parse(tr.data).access_token;
  console.log('✅ Token');

  // Read files, gzip, hash(gzipped)
  console.log('📦 Files...');
  const fileData=[];
  for(const rel of DEPLOY_FILES){
    const fp=path.join(__dirname,rel);
    if(fs.existsSync(fp)){
      const raw=fs.readFileSync(fp);
      const gz=zlib.gzipSync(raw);
      const hash=crypto.createHash('sha256').update(gz).digest('hex');
      fileData.push({path:'/'+rel,gz,hash});
    }
  }
  console.log('   '+fileData.length+' files');

  // Create version
  console.log('📝 Version...');
  const vr=await req('https://firebasehosting.googleapis.com/v1beta1/sites/'+SITE_ID+'/versions',{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}},'{}');
  const vn=JSON.parse(vr.data).name;
  console.log('   '+vn);

  // Populate
  console.log('📤 Populate...');
  const filesMap={};
  for(const f of fileData) filesMap[f.path]=f.hash;
  const pop=await req('https://firebasehosting.googleapis.com/v1beta1/'+vn+':populateFiles',{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}},JSON.stringify({files:filesMap}));
  const pd=JSON.parse(pop.data);
  const uploadUrl=pd.uploadUrl;
  const needed=pd.uploadRequiredHashes||[];
  console.log('   Need upload: '+needed.length);

  // Upload gzipped files
  if(uploadUrl&&needed.length>0){
    let ok=0,fail=0;
    for(const hash of needed){
      const entry=fileData.find(f=>f.hash===hash);
      if(!entry) continue;
      const fullUrl=uploadUrl+'/'+hash;
      const r=await req(fullUrl,{method:'POST',headers:{'Content-Type':'application/octet-stream','Authorization':'Bearer '+token}},entry.gz);
      if(r.status===200){ok++;}
      else{fail++;console.error('  ❌ '+entry.path+' → '+r.status);}
    }
    console.log('   ✅'+ok+' ❌'+fail);
  }

  // Finalize
  console.log('🔒 Finalize...');
  const fin=await req('https://firebasehosting.googleapis.com/v1beta1/'+vn+'?updateMask=status',{method:'PATCH',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}},JSON.stringify({status:'FINALIZED'}));
  if(fin.status!==200){console.error('❌',JSON.stringify(fin.data).slice(0,200));process.exit(1);}
  console.log('✅ Finalized');

  // Release
  console.log('🚀 Release...');
  const relUrl='https://firebasehosting.googleapis.com/v1beta1/sites/'+SITE_ID+'/releases?versionName='+encodeURIComponent(vn);
  const rel=await req(relUrl,{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}},'{}');
  if(rel.status!==200){console.error('❌',JSON.stringify(rel.data).slice(0,200));process.exit(1);}
  console.log('✅ DEPLOYED! 🌐 https://'+SITE_ID+'.web.app');
}
main().catch(e=>{console.error('❌',e.message);process.exit(1);});
