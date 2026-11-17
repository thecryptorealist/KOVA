import{test}from'node:test';import assert from'node:assert/strict';import{fetchImage}from'../src/logo-cache.js';
test('logo fetch refuses non-HTTPS, embedded credentials, and alternate ports',async()=>{for(const uri of ['http://example.com/a.png','https://user:password@example.com/a.png','https://example.com:444/a.png'])await assert.rejects(fetchImage(uri),{code:'IMAGE_URI_REFUSED'});});
test('logo fetch refuses loopback destinations before issuing an HTTP request',async()=>{await assert.rejects(fetchImage('https://127.0.0.1/a.png'),{code:'IMAGE_ADDRESS_REFUSED'});});
