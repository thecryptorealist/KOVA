// Alternative gateways preserve the exact IPFS content path; published URIs are never rewritten in storage.
export function resourceCandidates(uri:string){
 try{let path:string|undefined;if(uri.startsWith('ipfs://'))path=uri.slice(7).replace(/^ipfs\//,'');else{const url=new URL(uri);const match=url.pathname.match(/^\/ipfs\/([^?#]+)$/);if(match)path=match[1];}
 if(!path||!/^b[a-z2-7]{20,}(?:\/[^?#]*)?$|^Qm[1-9A-HJ-NP-Za-km-z]{44}(?:\/[^?#]*)?$/.test(path))return [uri];
 const alternatives=['https://dweb.link/ipfs/','https://ipfs.io/ipfs/','https://gateway.pinata.cloud/ipfs/'].map(base=>base+path);
 return [...new Set([...(uri.startsWith('https://')?[uri]:[]),...alternatives])];
 }catch{return [uri];}
}
const cooldown=new Map<string,number>();
export async function withGateways<T>(uri:string,fetcher:(uri:string)=>Promise<T>):Promise<T>{let last:unknown;for(const candidate of resourceCandidates(uri)){let host;try{host=new URL(candidate).hostname;}catch{continue;}if((cooldown.get(host)??0)>Date.now())continue;try{return await fetcher(candidate);}catch(e){last=e;const code=String((e as {code?:string}).code??'');if(code.endsWith('_429'))cooldown.set(host,Date.now()+60000);}}
 throw last??Object.assign(new Error('Gateways cooling down'),{code:'GATEWAYS_COOLDOWN'});
}
