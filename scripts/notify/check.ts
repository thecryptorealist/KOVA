import {configuration} from '../../src/notify/config.js';import {safeCode} from '../../src/notify/policy.js';
try{configuration();console.log(JSON.stringify({configuration:'valid',valuesPrinted:false}));}catch(e){console.log(JSON.stringify({configuration:'invalid',code:safeCode(e)}));process.exitCode=1;}
