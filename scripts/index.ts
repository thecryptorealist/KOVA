import{retryRead}from'../src/read-retry.js';
import{mkdir,writeFile,rename}from'node:fs/promises';
import{build}from'../src/index-builder.js';
import{completedPartialEnd}from'../src/index-frontier.js';
import{pool,log,sleep,errorCode}from'../src/db.js';
const args=process.argv.slice(2),watch=args.includes('--watch'),verify=args.includes('--verify');
const mode=args.includes('--partial')?'partial':'strict';
const flag=(name:string)=>{const at=args.indexOf(name);return at<0?undefined:args[at+1];};
async function once(selected:'strict'|'partial',completed=false){
 try{
  if(verify){
   const rows=await retryRead(()=>pool.query('SELECT artifact FROM core.index_builds WHERE status=$1 ORDER BY built_at DESC LIMIT 1',[selected==='partial'?'preview':'published']));
   if(!rows.rowCount)throw Object.assign(new Error('No published index to reproduce'),{code:'NO_PUBLISHED_INDEX'});
   const old=rows.rows[0].artifact;
   const fresh=await retryRead(()=>build(old.metadata.windowEnd,old.metadata.builtAt,pool,'core',selected,selected==='partial'?old.metadata.windowStart:undefined));
   if(fresh.contentHash!==old.contentHash)throw Object.assign(new Error('Reproducibility hash mismatch'),{code:'REPRODUCIBILITY_MISMATCH'});
   log('index_verified',{reproducible:true,contentHash:fresh.contentHash});return true;
  }
  const requestedEnd=flag('--end');
  const end=requestedEnd?new Date(requestedEnd).toISOString():selected==='partial'&&completed?await retryRead(()=>completedPartialEnd()):new Date(selected==='partial'?Date.now():Math.floor(Date.now()/900000)*900000).toISOString();
  const builtAt=new Date().toISOString();
  const index=await retryRead(()=>build(end,builtAt,pool,'core',selected,flag('--start')));
  await mkdir('data',{recursive:true});const file=selected==='partial'?'data/index.partial.json':'data/index.json';
  await writeFile(file+'.tmp',JSON.stringify(index));
  await pool.query('INSERT INTO core.index_builds(window_start,window_end,status,content_hash,artifact) VALUES($1,$2,$3,$4,$5)',[index.metadata.windowStart,index.metadata.windowEnd,selected==='partial'?'preview':'published',index.contentHash,index]);
  await rename(file+'.tmp',file);
  log(selected==='partial'?'partial_index_preview':'index_published',{hash:index.contentHash,coverage:index.metadata,entries:index.metadata.entryCount});return true;
 }catch(error){log('index_failed',{mode:selected,code:errorCode(error),reason:error instanceof Error&&error.message.startsWith('Refused:')?error.message:undefined});return false;}
}
if(watch){
 for(;;){const published=await once(mode,mode==='partial');if(mode==='strict'&&!published)await once('partial',true);await sleep(900000);}
}else{const ok=await once(mode,args.includes('--completed'));if(!ok)process.exitCode=1;await pool.end();}
