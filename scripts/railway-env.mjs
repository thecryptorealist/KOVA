// Local operator helper: sends only required values via stdin, never argv or logs.
import{readFile}from'node:fs/promises';import{parseEnv}from'node:util';import{spawn}from'node:child_process';
const flag=name=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1];};
const project=flag('--project'),cli=flag('--cli')??'railway';
if(!project){console.error('Required: --project PROJECT_ID');process.exit(1);}
const values={...parseEnv(await readFile('.env','utf8')),...process.env};
const services={'kova-web':['DATABASE_URL'],'kova-collector':['DATABASE_URL','SOLANA_RPC_HTTP','SOLANA_RPC_WS'],'kova-metadata':['DATABASE_URL'],'kova-indexer':['DATABASE_URL']};
for(const names of Object.values(services))for(const name of names)if(!values[name]){console.error('Missing required variable: '+name);process.exit(1);}
async function set(service,name,value){return new Promise((resolve,reject)=>{const child=spawn(cli,['variable','set',name,'--stdin','--skip-deploys','--service',service,'--environment','production','--project',project],{stdio:['pipe','pipe','pipe']});child.stdout.resume();child.stderr.resume();child.stdin.on('error',()=>{});child.once('error',()=>reject(new Error('Railway CLI unavailable')));child.once('exit',code=>code===0?resolve():reject(new Error('Railway variable update failed for '+service+'/'+name)));child.stdin.end(value);});}
try{for(const[service,names]of Object.entries(services)){await set(service,'NODE_ENV','production');for(const name of names){await set(service,name,values[name]);console.log(JSON.stringify({service,variable:name,updated:true}));}}}catch(error){console.error(error.message);process.exitCode=1;}
