import {Store} from '../../src/notify/store.js';import {safeCode} from '../../src/notify/policy.js';
const store=new Store(process.env.DATABASE_URL??'');try{console.log(JSON.stringify(await store.status(),null,2));}catch(e){console.error(JSON.stringify({notificationStatus:'unavailable',code:safeCode(e)}));process.exitCode=1;}finally{await store.pool.end();}
