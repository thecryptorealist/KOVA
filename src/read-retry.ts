import {errorCode,log,sleep} from './db.js';
const transient=new Set(['ENOTFOUND','EAI_AGAIN','ECONNRESET','ECONNREFUSED','ETIMEDOUT','EPIPE','08000','08003','08006','57P01','57P02','57P03']);
// For independent read queries only; never replay writes or transactions.
export async function retryRead<T>(read:()=>Promise<T>,wait:(ms:number)=>Promise<unknown>=sleep):Promise<T>{
 for(let attempt=0;;attempt++){
  try{const result=await read();if(attempt)log('api_database_recovered',{attempt});return result;}
  catch(error){if(attempt>=2||!transient.has(errorCode(error)))throw error;log('api_database_retry',{attempt:attempt+1,code:errorCode(error)});await wait(attempt===0?300:1000);}
 }
}
