export type DeliveryResult={kind:'sent';messageId:string|number}|{kind:'retry';seconds:number}|{kind:'failed'|'unknown';code:string};
export interface Notifier{readonly kind:'discord'|'telegram';initialize():Promise<void>;send(destination:string,text:string):Promise<DeliveryResult>;}
export interface CommandNotifier extends Notifier{updates(offset:number):Promise<unknown>;}
export function hasCommands(notifier:Notifier):notifier is CommandNotifier{return 'updates'in notifier&&typeof notifier.updates==='function';}
