import{test}from'node:test';import assert from'node:assert/strict';import{resourceCandidates,withGateways}from'../src/gateways.js';
const cid='Qm'+'a'.repeat(44);
test('IPFS fallback preserves exact content identifier and path',()=>{const rows=resourceCandidates('https://ipfs.io/ipfs/'+cid+'/metadata.json');assert.ok(rows.length>1);for(const row of rows)assert.equal(new URL(row).pathname,'/ipfs/'+cid+'/metadata.json');assert.deepEqual(resourceCandidates('https://example.com/metadata.json'),['https://example.com/metadata.json']);});
test('fallback recovers a rate-limited gateway with the same content',async()=>{let calls=0;const result=await withGateways('ipfs://'+cid,async uri=>{calls++;if(calls===1)throw Object.assign(new Error('limited'),{code:'METADATA_HTTP_429'});assert.ok(uri.endsWith(cid));return {image:'published-image'};});assert.equal(calls,2);assert.equal(result.image,'published-image');});
test('non-IPFS errors do not substitute unrelated metadata',async()=>{let calls=0;await assert.rejects(withGateways('https://example.org/metadata',async()=>{calls++;throw new Error('not found');}));assert.equal(calls,1);});

test('raw image CIDv1 bafk paths also get gateway fallback',()=>{const cid='bafkrei'+'a'.repeat(40);assert.ok(resourceCandidates('https://ipfs.io/ipfs/'+cid).length>1);});
