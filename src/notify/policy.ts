import {PublicKey} from '@solana/web3.js';
export const DISCLAIMER='Not advice. This reads strings and does not check the contract.';
export const LIMITS={wallets:20,tradesPerUtcDay:10000,streamBytesPerUtcDay:100_000_000,chatIntervalMs:10000,walletIntervalMs:60000,retentionMs:7*86400000} as const;
export function validWallet(value:unknown):value is string{if(typeof value!=='string')return false;try{return new PublicKey(value).toBase58()===value;}catch{return false;}}
export function allowedChats(text:string){const values=text.split(',').map(s=>s.trim()).filter(Boolean);if(!values.length||values.some(s=>!/^\d+$/.test(s)||!Number.isSafeInteger(Number(s))||Number(s)<=0))throw Object.assign(new Error('Invalid private chat allowlist'),{code:'TELEGRAM_ALLOWLIST_INVALID'});return new Set(values);}
export type Incoming={update_id:number;message?:{text?:string;chat:{id:number;type:string};from?:{id:number;is_bot:boolean}}};
export function authorized(update:Incoming,allowlist:Set<string>){const m=update.message;return !!m&&m.chat.type==='private'&&Number.isSafeInteger(m.chat.id)&&m.from?.is_bot===false&&m.from.id===m.chat.id&&allowlist.has(String(m.chat.id));}
export type Command={name:'follow'|'unfollow';wallet:string}|{name:'list'|'pause'|'resume'|'status'|'help'};
export function parseCommand(text:string):Command{const [raw,...args]=text.trim().split(/\s+/);const name=raw?.split('@')[0]?.replace(/^\//,'');if((name==='follow'||name==='unfollow')&&args.length===1&&validWallet(args[0]))return {name,wallet:args[0]};if(['list','pause','resume','status'].includes(name??'')&&!args.length)return {name:name as 'list'|'pause'|'resume'|'status'};return {name:'help'};}
export const reply=(text:string)=>text+'\n\n'+DISCLAIMER;
export function safeCode(error:unknown){if(typeof error==='object'&&error&&'code'in error){const c=String(error.code);return /^[-A-Z0-9_]{1,80}$/.test(c)?c:'OPERATION_FAILED';}return error instanceof Error&&error.name==='TimeoutError'?'TIMEOUT':'OPERATION_FAILED';}
export function log(event:string,details:Record<string,unknown>={}){console.log(JSON.stringify({time:new Date().toISOString(),event,...details}));}
