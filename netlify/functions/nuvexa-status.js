// Read-only operational gateway; no scheduled jobs, broker writes or persistence.
// Disabled until owner-approved server-side credentials are configured.
const {createHash,timingSafeEqual}=require("node:crypto");
const respond=(body,status)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
const valid=s=>/^[A-Za-z0-9_-]{43,128}$/.test(s);
const same=(a,b)=>timingSafeEqual(createHash("sha256").update(a).digest(),createHash("sha256").update(b).digest());
exports.handler=async function(event) {
  if(event.httpMethod!=="GET") return {statusCode:405,headers:{"Cache-Control":"no-store"},body:'{"error":"Read-only"}'};
  const output=(value,status)=>({statusCode:status,headers:{"Content-Type":"application/json","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"},body:JSON.stringify(value)});
  if(event.queryStringParameters&&Object.keys(event.queryStringParameters).length) return output({error:"Query denied"},400);
  const ownerToken=process.env.TITANCORE_NUVEXA_GATEWAY_TOKEN||"";
  const sourceToken=process.env.NUVEXA_REPORTING_TOKEN||"";
  if(!valid(ownerToken)||!valid(sourceToken)) return output({error:"Not configured"},503);
  const supplied=/^Bearer ([A-Za-z0-9_-]{43,128})$/.exec(event.headers?.authorization||event.headers?.Authorization||"")?.[1]||"";
  if(!valid(supplied)||!same(ownerToken,supplied)) return output({error:"Unauthorized"},401);
  try {
    const upstream=await fetch("https://trading-software-platform.netlify.app/api/reporting/paper-status",{
      headers:{Authorization:"Bearer "+sourceToken,Accept:"application/json"},
      method:"GET",redirect:"error",cache:"no-store",signal:AbortSignal.timeout(8000)
    });
    if(!upstream.ok||Number(upstream.headers.get("content-length")||0)>65536) return output({error:"Upstream unavailable"},502);
    const body=await upstream.text();
    if(body.length>65536) return output({error:"Upstream oversized"},502);
    const data=JSON.parse(body);
    const time=Date.parse(data?.checkedAt);
    if(data?.version!=="paper-status-v1"||data.mode!=="paper"||data.liveTradingEnabled!==false||
      !Number.isFinite(time)||Math.abs(Date.now()-time)>600000) return output({error:"Invalid or stale report"},502);
    return output({source:"Nuvexa IQ",reportType:"operational-only",checkedAt:data.checkedAt,
      monitoringAvailable:data.monitoring?.available===true,monitoringStale:data.monitoring?.stale===true,
      aiAvailable:data.ai?.available===true,brokerVerified:false,delivery:"on-demand-not-persisted"},200);
  }catch{return output({error:"Reporting unavailable"},502);}
};
