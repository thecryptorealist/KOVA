// Fail the build if compiled runtime modules cannot resolve their IDLs.
try{
 const pump=await import('../dist/src/pump.js');
 await import('../dist/src/notify/events.js');
 if(pump.idl.address!==pump.programId)throw Object.assign(new Error('IDL address mismatch'),{code:'IDL_ADDRESS_MISMATCH'});
 console.log('Compiled runtime smoke check passed');
}catch(error){console.error(JSON.stringify({event:'production_smoke_failed',code:error.code??'MODULE_LOAD_FAILED'}));process.exitCode=1;}
