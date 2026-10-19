const test=require("node:test"),assert=require("node:assert/strict");
const gateway=require("../netlify/functions/nuvexa-status.js").handler;
const valid="a".repeat(48),source="b".repeat(48);
const previous={...process.env};
test.after(()=>{process.env.TITANCORE_NUVEXA_GATEWAY_TOKEN=previous.TITANCORE_NUVEXA_GATEWAY_TOKEN;process.env.NUVEXA_REPORTING_TOKEN=previous.NUVEXA_REPORTING_TOKEN;});
function setup(){process.env.TITANCORE_NUVEXA_GATEWAY_TOKEN=valid;process.env.NUVEXA_REPORTING_TOKEN=source;}
const request=(auth="Bearer "+valid,method="GET")=>({httpMethod:method,headers:{authorization:auth},queryStringParameters:{}});
test("rejects non-GET",async()=>{setup();assert.equal((await gateway(request(undefined,"POST"))).statusCode,405);});
test("missing config disables gateway",async()=>{setup();delete process.env.NUVEXA_REPORTING_TOKEN;assert.equal((await gateway(request())).statusCode,503);});
test("unauthorized access rejected before upstream call",async()=>{setup();let calls=0;const original=global.fetch;global.fetch=async()=>{calls++;throw Error("called");};try{assert.equal((await gateway(request("Bearer "+"c".repeat(48)))).statusCode,401);assert.equal(calls,0);}finally{global.fetch=original;}});
test("fresh paper-status response is sanitized",async()=>{setup();const original=global.fetch;global.fetch=async()=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify({version:"paper-status-v1",mode:"paper",liveTradingEnabled:false,checkedAt:new Date().toISOString(),broker:{account:"SECRET"},monitoring:{available:true,stale:false}})});try{const r=await gateway(request());assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).brokerVerified,false);assert.equal(r.body.includes("SECRET"),false);}finally{global.fetch=original;}});
test("stale or live-trading reports fail closed",async()=>{setup();const original=global.fetch;global.fetch=async()=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify({version:"paper-status-v1",mode:"paper",liveTradingEnabled:true,checkedAt:"2020-01-01T00:00:00Z"})});try{assert.equal((await gateway(request())).statusCode,502);}finally{global.fetch=original;}});
