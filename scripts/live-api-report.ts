import {pool,errorCode} from '../src/db.js';
process.env.NODE_ENV='test';
const {createServer}=await import('../src/api.js');
const server=createServer();
try {
 await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const address=server.address();if(!address||typeof address==='string')throw new Error('No listener');const base=`http://127.0.0.1:${address.port}`;
 async function call(path:string,body?:unknown){const r=await fetch(base+path+(process.argv.includes('--partial')?'?window=partial':''),{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await r.json();console.log(JSON.stringify({method:body?'POST':'GET',path,mode:process.argv.includes('--partial')?'partial':'strict',status:r.status,result:path==='/v1/live'?{...data,launches:data.launches?.slice(0,3)}:data}));return data;}
 await call('/v1/status');await call('/v1/index');const live=await call('/v1/live');
 const launch=live.launches?.[0];await call('/v1/check',launch?.fields??{});
 if(launch){await call('/v1/token/'+encodeURIComponent(launch.mint));await call('/v1/deployer/'+encodeURIComponent(launch.creator));}
 else console.log(JSON.stringify({skipped:['/v1/token/:mint','/v1/deployer/:address'],reason:live.error?'Launch query unavailable; no addresses invented':'No observed launch supplies a real mint or creator; no addresses invented'}));
 const sharing=await pool.query('SELECT h.namespace,h.hash,count(DISTINCT h.mint)::int AS observed_launches FROM core.field_hashes h GROUP BY h.namespace,h.hash HAVING count(DISTINCT h.mint)>1 ORDER BY observed_launches DESC LIMIT 3');
 console.log(JSON.stringify({observedSharedStringGroups:sharing.rows,notice:'Observed database groups only; not a complete 24-hour published index'}));
}catch(e){console.error(JSON.stringify({event:'live_api_report_failed',code:errorCode(e)}));process.exitCode=1;}
finally{if(server.listening)await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await pool.end();}
