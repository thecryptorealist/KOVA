import {readFileSync} from 'node:fs';
import {BorshCoder,EventParser,type Idl} from '@coral-xyz/anchor';
import {PublicKey} from '@solana/web3.js';
import WebSocket from 'ws';
import {log} from './db.js';
export const idl=JSON.parse(readFileSync(new URL('../idl/pump.json',import.meta.url),'utf8')) as Idl;
export const programId='6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
if(idl.address!==programId)throw new Error('Allowlist/IDL mismatch');
export type LaunchEvent={is_holder_reward?:boolean;name:string;symbol:string;uri:string;mint:PublicKey;creator:PublicKey;timestamp:{toString():string}};
export interface LaunchpadAdapter{programId:string;decode(logs:string[]):{data:LaunchEvent;variant:string;index:number;fieldNames:string[]}[];}
export const pump:LaunchpadAdapter={programId,decode(logs){const coder=new BorshCoder(idl);const stack:string[]=[];for(const log of logs){const invoke=log.match(/^Program (\S+) invoke \[\d+\]$/);if(invoke){stack.push(invoke[1]!);continue;}if(/^Program \S+ (success|failed:)/.test(log)){stack.pop();continue;}if(stack.at(-1)===programId&&log.startsWith('Program data: ')&&!coder.events.decode(log.slice(14)))throw new Error('Unknown pump event data');}const parser=new EventParser(new PublicKey(programId),coder);const variant=logs.some(l=>l==='Program log: Instruction: CreateV2')?'create_v2':logs.some(l=>l==='Program log: Instruction: Create')?'create':'unknown';return [...parser.parseLogs(logs)].map((event,index)=>({event,index})).filter(({event})=>event.name==='CreateEvent').map(({event,index})=>({data:event.data as unknown as LaunchEvent,variant,index,fieldNames:Object.keys(event.data)}));}};
export type StreamOptions={endpoint?:string;factory?:(endpoint:string)=>WebSocket;reconnectDelayMs?:number;heartbeatMs?:number;onSubscribed?:()=>Promise<void>};
export function stream(onLaunch:(event:ReturnType<typeof pump.decode>[number],signature:string,slot:number)=>Promise<void>,onGap:(reason:string)=>Promise<void>,options:StreamOptions={}){
 const endpoint=options.endpoint??process.env.SOLANA_RPC_WS;if(!endpoint)throw new Error('SOLANA_RPC_WS is required');
 let stopped=false;let socket:WebSocket;let heartbeat:NodeJS.Timeout;let timer:NodeJS.Timeout|undefined;let failures=0;let queue=Promise.resolve();let backlog=0;
 const connect=()=>{if(stopped)return;socket=options.factory?options.factory(endpoint):new WebSocket(endpoint,{handshakeTimeout:10000,maxPayload:2_000_000});let alive=true;let lastMessage=Date.now();
 socket.on('open',()=>{log('rpc_websocket_connected',{reconnect:failures>0});socket.send(JSON.stringify({jsonrpc:'2.0',id:1,method:'logsSubscribe',params:[{mentions:[programId]},{commitment:'finalized'}]}));heartbeat=setInterval(()=>{if(!alive||Date.now()-lastMessage>60000){socket.terminate();return;}alive=false;socket.ping();},options.heartbeatMs??15000);});
 socket.on('pong',()=>{alive=true;});
 socket.on('message',raw=>{try{const msg=JSON.parse(raw.toString());if(msg.error){log('rpc_subscription_refused');socket.close();return;}if(msg.id===1&&typeof msg.result==='number'){log('rpc_subscription_confirmed');if(options.onSubscribed)queue=queue.then(options.onSubscribed).catch(()=>{log('subscription_checkpoint_failed');socket.close();});return;}const value=msg.params?.result?.value;if(value)lastMessage=Date.now();const slot=msg.params?.result?.context?.slot;if(!value||value.err)return;if(backlog>1000){queue=queue.then(()=>onGap('queue_overflow'));socket.close();return;}const decoded=pump.decode(value.logs);for(const event of decoded){backlog++;queue=queue.then(()=>onLaunch(event,value.signature,slot)).catch(async()=>{log('launch_processing_failed');await onGap('launch_processing_failed');}).finally(()=>{backlog--;});}}catch{log('rpc_decode_failure');queue=queue.then(()=>onGap('decode_failure'));}});
 socket.on('error',()=>log('rpc_websocket_error'));
 socket.on('close',()=>{clearInterval(heartbeat);if(stopped)return;failures++;log('rpc_websocket_reconnect',{attempt:failures});queue=queue.then(()=>onGap('websocket_disconnected'));timer=setTimeout(connect,options.reconnectDelayMs??Math.min(30000,1000*2**Math.min(failures,5)));});};
 connect();return ()=>{stopped=true;clearInterval(heartbeat);clearTimeout(timer);socket?.close();};
}
