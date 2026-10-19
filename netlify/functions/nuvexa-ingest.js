// Draft ingest endpoint; DISABLED until explicitly enabled after independent security review.
// No trades, no transfers, and no browser credentials. Receipt only after DB confirms write.
const {createHash,timingSafeEqual}=require("node:crypto");
const json=(status,body)=>({statusCode:status,headers:{"Content-Type":"application/json","Cache-Control":"private, no-store"},body:JSON.stringify(body)});
const token=s=>/^[A-Za-z0-9_-]{43,128}$/.test(s);
const equal=(a,b)=>timingSafeEqual(createHash("sha256").update(a).digest(),createHash("sha256").update(b).digest());
exports.handler=async(event)=>{
 if(event.httpMethod!=="POST")return json(405,{error:"POST required"});
 if(process.env.NUVEXA_INGEST_ENABLED!=="true")return json(503,{error:"Ingestion disabled"});
 const auth=process.env.TITANCORE_NUVEXA_INGEST_TOKEN||"";
 const dbKey=process.env.TITANCORE_SUPABASE_SERVICE_ROLE_KEY||"";
 const supplied=/^Bearer ([A-Za-z0-9_-]{43,128})$/.exec(event.headers?.authorization||event.headers?.Authorization||"")?.[1]||"";
 if(!token(auth)||!dbKey)return json(503,{error:"Receiver not configured"});
 if(!token(supplied)||!equal(auth,supplied))return json(401,{error:"Unauthorized"});
 if((event.body||"").length>8192)return json(413,{error:"Payload too large"});
 let input;try{input=JSON.parse(event.body||"");}catch{return json(400,{error:"Invalid JSON"});}
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 if(!input||Object.keys(input).sort().join(",")!=="eventId,eventType,payloadSha256,sourceCreatedAt"||
 !uuid.test(input.eventId)||typeof input.eventType!=="string"||
 !/^[a-z][a-z0-9_]{0,99}$/.test(input.eventType)||
 !["integration_queue_smoke_test","auto_queue_trigger_smoke_test"].includes(input.eventType)||
 !/^[0-9a-f]{64}$/.test(input.payloadSha256)||
 typeof input.sourceCreatedAt!=="string"||!Number.isFinite(Date.parse(input.sourceCreatedAt)))
 return json(400,{error:"Invalid event"});
 const base="https://jgpvrblzyznyprtffirw.supabase.co/rest/v1/nuvexa_audit_receipts";
 const row={source_project:"szhrslrofqpvjubhvfea",source_event_id:input.eventId,
 source_event_type:input.eventType,report_kind:"audit-test",source_created_at:input.sourceCreatedAt,
 source_payload_sha256:input.payloadSha256};
 const headers={apikey:dbKey,Authorization:"Bearer "+dbKey,"Content-Type":"application/json",Prefer:"return=representation"};
 try{
 const reply=await fetch(base,{method:"POST",headers,body:JSON.stringify(row),signal:AbortSignal.timeout(8000)});
 if(reply.status===201){const data=await reply.json();if(Array.isArray(data)&&data.length===1&&data[0].source_event_id===input.eventId)return json(201,{receiptId:data[0].id,eventId:input.eventId,status:"received"});return json(502,{error:"Receipt not confirmed"});}
 if(reply.status===409){
   const read=await fetch(base+"?source_project=eq.szhrslrofqpvjubhvfea&source_event_id=eq."+encodeURIComponent(input.eventId)+"&select=id,source_payload_sha256,source_event_type",{headers:{apikey:dbKey,Authorization:"Bearer "+dbKey},signal:AbortSignal.timeout(8000)});
   if(!read.ok)return json(502,{error:"Receipt lookup unavailable"});
   const found=await read.json();if(found.length===1&&found[0].source_payload_sha256===input.payloadSha256&&found[0].source_event_type===input.eventType)
   return json(200,{receiptId:found[0].id,eventId:input.eventId,status:"already_received"});
   return json(409,{error:"Conflicting event"});
 }
 return json(502,{error:"Receipt write unavailable"});
 }catch{return json(502,{error:"Receipt storage unavailable"});}
};
