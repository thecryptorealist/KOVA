// In-memory fixtures only. These rows are not chain observations or Postgres inserts.
import {PublicKey} from '@solana/web3.js';import {lines} from '../src/normalize.js';import type {pool} from '../src/db.js';
export const fixtureFields={name:'SYNTHETIC FIXTURE NOT A LAUNCH',ticker:'FIXTURE_ONLY'};
export const fixtureEnd='2000-01-02T00:00:00.000Z';
export const fixtureRows=[1,2].map(n=>({mint:new PublicKey(Buffer.alloc(32,n)).toBase58(),creator:new PublicKey(Buffer.alloc(32,n+2)).toBase58(),slot:String(n),block_time:'2000-01-01T12:00:00Z',metadata_status:'ok',fields:fixtureFields}));
export async function mockDatabase(options:{coverage?:boolean;gaps?:boolean;pending?:boolean;started?:string;heartbeat?:string;databaseOffsetMs?:number}={}){let artifact:unknown=null;const hashes=await lines(fixtureFields);const query=async(text:string,args?:unknown[])=>{let rows:unknown[]=[];
if(text.includes('min(started_at)'))rows=[{database_now:new Date(Date.now()+(options.databaseOffsetMs??0)),started:options.coverage===false?null:options.started??'1999-12-31T00:00:00Z',heartbeat:options.heartbeat??fixtureEnd}];
else if(text.includes('count(DISTINCT l.mint)'))rows=hashes.map(l=>({namespace:l.namespace,hash:l.hash,n:2,d:2,first:'2000-01-01',v:l.spellingHash?1:0}));
else if(text.includes('min(slot)'))rows=[{first:'1',last:'2'}];
else if(text.includes("metadata_status<>'ok'"))rows=[{count:options.pending?1:0}];
else if(text.includes('core.gaps')||text.includes('.gaps'))rows=options.gaps?[{reason:'SYNTHETIC_GAP'}]:[];
else if(text.includes('SELECT artifact')){const mode=(artifact as {metadata?:{mode?:string}}|null)?.metadata?.mode??'strict';rows=artifact&&((args?.[0]==='preview')===(mode==='partial'))?[{artifact}]:[];}
else if(text.includes('max(heartbeat_at)'))rows=[{heartbeat:options.heartbeat??fixtureEnd}];
else if(text.includes('SELECT mint,creator'))rows=text.includes('WHERE mint=')?fixtureRows.filter(r=>r.mint===args?.[0]):text.includes('WHERE creator=')?fixtureRows.filter(r=>r.creator===args?.[0]):fixtureRows;
return {rows,rowCount:rows.length};};
const database={query,connect:async()=>({query,release(){}})} as unknown as typeof pool;return {database,setArtifact(value:unknown){artifact=value;}};}
