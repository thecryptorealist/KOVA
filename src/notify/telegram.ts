import type {DeliveryResult,Notifier} from './notifier.js';
import {safeCode,reply,DISCLAIMER} from './policy.js';
export type TelegramResult=DeliveryResult;
export class Telegram implements Notifier{readonly kind='telegram' as const;
async initialize(){await this.identity();await this.webhookCheck();}
constructor(private token:string,private allowed:Set<string>,private fetcher:typeof fetch=fetch){}
private async call(method:string,body:unknown,timeout=15000){try{const r=await this.fetcher('https://api.telegram.org/bot'+this.token+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(timeout)});const data=await r.json();return {http:r.status,data};}catch(e){throw Object.assign(new Error('Telegram transport error'),{code:'TELEGRAM_TRANSPORT_'+safeCode(e)});}}
async identity(){const r=await this.call('getMe',{});if(!r.data.ok)throw Object.assign(new Error('Telegram identity rejected'),{code:'TELEGRAM_'+r.data.error_code});return true;}
async webhookCheck(){const r=await this.call('getWebhookInfo',{});if(!r.data.ok)throw Object.assign(new Error('Webhook inspection failed'),{code:'TELEGRAM_'+r.data.error_code});if(r.data.result.url)throw Object.assign(new Error('An existing webhook owns this bot'),{code:'TELEGRAM_WEBHOOK_ACTIVE'});}
async updates(offset:number){const r=await this.call('getUpdates',{offset,timeout:25,limit:100,allowed_updates:['message']},35000);if(!r.data.ok)throw Object.assign(new Error('Telegram polling rejected'),{code:'TELEGRAM_'+r.data.error_code});return r.data.result;}
async send(chat:string,text:string):Promise<TelegramResult>{if(!text.endsWith(DISCLAIMER))text=reply(text);if(!this.allowed.has(chat))return {kind:'failed',code:'CHAT_NOT_ALLOWED'};try{const r=await this.call('sendMessage',{chat_id:chat,text,link_preview_options:{is_disabled:true}});if(r.data.ok)return {kind:'sent',messageId:r.data.result.message_id};if(r.data.error_code===429)return {kind:'retry',seconds:Math.max(1,Number(r.data.parameters?.retry_after??30))};return {kind:r.http>=500?'unknown':'failed',code:'TELEGRAM_'+String(r.data.error_code??r.http)};}catch(e){return {kind:'unknown',code:safeCode(e)};}}
}
