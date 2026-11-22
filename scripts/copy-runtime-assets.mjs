import {cp,mkdir} from 'node:fs/promises';
// Keep module-relative asset paths valid after TypeScript moves code under dist/.
for(const name of ['idl','db']){
 await mkdir(new URL('../dist/'+name+'/',import.meta.url),{recursive:true});
 await cp(new URL('../'+name+'/',import.meta.url),new URL('../dist/'+name+'/',import.meta.url),{recursive:true});
}
console.log('Runtime assets copied: idl, db');
