import {lookup,resolve4,resolve6} from 'node:dns/promises';
import {Socket,type LookupFunction} from 'node:net';
import type {LookupAddress,LookupOptions} from 'node:dns';
type Resolver={system:(host:string,options:LookupOptions)=>Promise<LookupAddress[]>;v4:(host:string)=>Promise<string[]>;v6:(host:string)=>Promise<string[]>};
const resolver:Resolver={system:(host,options)=>lookup(host,{...options,all:true}),v4:resolve4,v6:resolve6};
// Keep the configured hostname for pg authentication/TLS. No fixed IPs or external DNS servers.
export function databaseLookup(resolvers:Resolver=resolver,onFallback:()=>void=()=>{}):LookupFunction{
 return (host,options,callback)=>{
  const run=async()=>{
   let addresses:LookupAddress[];
   try{addresses=await resolvers.system(host,options);}
   catch(error){
    const code=(error as NodeJS.ErrnoException).code;
    if(code!=='ENOTFOUND'&&code!=='EAI_AGAIN')throw error;
    const family=Number(options.family)||0;
    const results=await Promise.allSettled([family===6?Promise.resolve([]):resolvers.v4(host),family===4?Promise.resolve([]):resolvers.v6(host)]);
    addresses=results.flatMap((result,index)=>result.status==='fulfilled'?result.value.map(address=>({address,family:index===0?4:6})):[]);
    if(!addresses.length)throw error;
    onFallback();
   }
   if(!addresses.length)throw Object.assign(new Error('Database name resolution failed'),{code:'ENOTFOUND'});
   if(options.all)callback(null,addresses);else callback(null,addresses[0]!.address,addresses[0]!.family);
  };
  void run().catch(error=>callback(error,'',0));
 };
}
export function databaseStream(onFallback:()=>void,lookup:LookupFunction=databaseLookup(resolver,onFallback)){
 const socket=new Socket();const connect=socket.connect.bind(socket);
 // pg calls stream.connect(port, host); scope the resolver to that socket only.
 socket.connect=((port:number,host:string)=>connect({port,host,lookup})) as Socket['connect'];
 return socket;
}
