const test=require("node:test"),assert=require("node:assert/strict");
const handler=require("../netlify/functions/nuvexa-ingest.js").handler;
const before={...process.env},k="a".repeat(48),id="12345678-1234-4123-8123-123456789abc";
test.after(()=>{for(const x of ["NUVEXA_INGEST_ENABLED","TITANCORE_NUVEXA_INGEST_TOKEN","TITANCORE_SUPABASE_SERVICE_ROLE_KEY"])if(before[x]===undefined)delete process.env[x];else process.env[x]=before[x];});
const body=JSON.stringify({eventId:id,eventType:"integration_queue_smoke_test",payloadSha256:"b".repeat(64),sourceCreatedAt:"2026-10-18T23:49:33Z"});
function setup(enabled="true"){process.env.NUVEXA_INGEST_ENABLED=enabled;process.env.TITANCORE_NUVEXA_INGEST_TOKEN=k;process.env.TITANCORE_SUPABASE_SERVICE_ROLE_KEY="test-only";}
const req=(authorization="Bearer "+k,content=body)=>({httpMethod:"POST",headers:{authorization},body:content});
test("disabled receiver fails closed",async()=>{setup("false");assert.equal((await handler(req())).statusCode,503);});
test("unauthorized caller never reaches database",async()=>{setup();let n=0;const old=global.fetch;global.fetch=async()=>{n++;throw Error("called")};try{assert.equal((await handler(req("Bearer "+"c".repeat(48)))).statusCode,401);assert.equal(n,0);}finally{global.fetch=old;}});
test("invalid input rejected without write",async()=>{setup();assert.equal((await handler(req(undefined,'{"eventId":"bad"}'))).statusCode,400);});
test("receipt returned only after committed response",async()=>{setup();const old=global.fetch;global.fetch=async()=>({status:201,json:async()=>[{id:"receipt-test",source_event_id:id}]});try{const r=await handler(req());assert.equal(r.statusCode,201);assert.equal(JSON.parse(r.body).status,"received");}finally{global.fetch=old;}});
test("conflicting duplicate is not acknowledged",async()=>{setup();const old=global.fetch;global.fetch=async(_url,opts)=>opts.method==="POST"?{status:409}:{ok:true,json:async()=>[{id:"old",source_payload_sha256:"c".repeat(64),source_event_type:"integration_queue_smoke_test",source_created_at:"2026-10-18T23:49:33Z"}]};try{assert.equal((await handler(req())).statusCode,409);}finally{global.fetch=old;}});

test("matching duplicate requires identical source timestamp",async()=>{setup();const old=global.fetch;global.fetch=async(_url,opts)=>opts.method==="POST"?{status:409}:{ok:true,json:async()=>[{id:"old",source_payload_sha256:"b".repeat(64),source_event_type:"integration_queue_smoke_test",source_created_at:"2026-10-17T23:49:33Z"}]};try{assert.equal((await handler(req())).statusCode,409);}finally{global.fetch=old;}});
