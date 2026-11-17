import {PublicKey} from '@solana/web3.js';
import {lines,type Fields} from './normalize.js';
import type {LaunchEvent} from './pump.js';
export function metadataFields(json:Record<string,unknown>):Fields{const result:Fields={};for(const [target,source] of Object.entries({description:'description',x:'twitter',telegram:'telegram',website:'website',logo:'image'})){if(typeof json[source]==='string')result[target as keyof Fields]=json[source] as string;}return result;}
export function metadataRetry(previousAttempts:number,now=Date.now()){if(!Number.isSafeInteger(previousAttempts)||previousAttempts<0)throw new Error('Invalid attempt count');return {attempts:previousAttempts+1,status:previousAttempts>=7?'failed' as const:'pending' as const,nextAttempt:new Date(now+Math.min(3600,15*2**Math.min(previousAttempts,8))*1000)};}
export async function prepareLaunch(e:LaunchEvent,signature:string,eventIndex:number,slot:number){
if(!Number.isSafeInteger(slot)||slot<0||!Number.isSafeInteger(eventIndex)||eventIndex<0||!signature)throw new Error('Invalid event envelope');
if(typeof e.name!=='string'||typeof e.symbol!=='string'||typeof e.uri!=='string')throw new Error('Invalid launch string fields');
const mint=new PublicKey(e.mint.toBase58()).toBase58();const creator=new PublicKey(e.creator.toBase58()).toBase58();const timestamp=Number(e.timestamp.toString());if(!Number.isSafeInteger(timestamp)||!Number.isFinite(new Date(timestamp*1000).getTime()))throw new Error('Invalid event timestamp');
const fields={name:e.name,ticker:e.symbol};return {mint,creator,signature,eventIndex,slot,blockTime:new Date(timestamp*1000),uri:e.uri,fields,hashes:await lines(fields)};
}
