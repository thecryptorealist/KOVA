import pg from 'pg';
import {databaseStream} from './database-dns.js';
export const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000,max:5,idleTimeoutMillis:60000,keepAlive:true,keepAliveInitialDelayMillis:10000,stream:()=>databaseStream(()=>log('database_dns_fallback'))});
export const eventCounts:Record<string,number>={};
export const log=(event:string,data:Record<string,unknown>={})=>{eventCounts[event]=(eventCounts[event]??0)+1;console.log(JSON.stringify({time:new Date().toISOString(),event,...data}));};
// Never log error.message: provider/database errors can contain credentials.
export function errorCode(e:unknown){return typeof e==='object'&&e&&'code'in e?String(e.code):'operation_failed';}
pool.on('error',()=>log('database_connection_lost'));
export const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
export async function retry<T>(work:()=>Promise<T>,wait:(ms:number)=>Promise<unknown>=sleep):Promise<T>{let attempt=0;for(;;){try{const result=await work();if(attempt)log('database_reconnected',{attempt});return result;}catch(e){attempt++;log('database_retry',{attempt,code:errorCode(e)});await wait(Math.min(30000,1000*2**Math.min(attempt,5)));}}}
