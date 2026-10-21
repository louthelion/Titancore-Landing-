// Draft coordinator tests: fake transactional adapter; no production writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ingestVerifiedSubmission } from './ingest-verified-submission.mjs';

const submission = () => ({ id:'submission_123456',form_name:'titancore-contact',data:{name:'Test Person',email:'person@example.com',message:'Please contact me.'} });
function db() {
  const receipts=new Map(),leads=[]; let next=1; let gate=Promise.resolve();
  const adapter={
    async withTransaction(fn) {
      let release; const waiting=new Promise(r=>release=r);
      const previous=gate; gate=waiting; await previous;
      const snapshot=new Map(receipts),count=leads.length,startId=next;
      try{return await fn({
        async lockExternalSubmission(_id){},
        async findReceipt(id){return receipts.has(id)?{leadId:receipts.get(id)}:null},
        async insertLead(lead){leads.push(lead); return next++},
        async insertReceipt({id,leadId}){if(receipts.has(id)) throw Error('duplicate');receipts.set(id,leadId)}
      })}catch(e){receipts.clear();for(const [k,v] of snapshot)receipts.set(k,v);leads.length=count;next=startId;throw e}
      finally{release()}
    }
  };
  return {adapter,receipts,leads};
}

test('first verified delivery creates exactly one lead and receipt',async()=>{
 const d=db();const result=await ingestVerifiedSubmission(submission(),d.adapter);
 assert.deepEqual(result,{leadId:1,created:true});assert.equal(d.leads.length,1);assert.equal(d.receipts.size,1);
});
test('repeat delivery returns same lead, without insertion',async()=>{
 const d=db();await ingestVerifiedSubmission(submission(),d.adapter);
 const result=await ingestVerifiedSubmission(submission(),d.adapter);
 assert.deepEqual(result,{leadId:1,created:false});assert.equal(d.leads.length,1);
});
test('simultaneous duplicate requests serialize without duplicate lead',async()=>{
 const d=db();const [a,b]=await Promise.all([ingestVerifiedSubmission(submission(),d.adapter),ingestVerifiedSubmission(submission(),d.adapter)]);
 assert.equal([a.created,b.created].filter(Boolean).length,1);assert.equal(d.leads.length,1);
});
test('failed receipt insert rolls back lead in adapter transaction',async()=>{
 const d=db();const original=d.adapter.withTransaction;
 d.adapter.withTransaction=(cb)=>original.call(d.adapter,tx=>cb({...tx,insertReceipt:async()=>{throw Error('receipt failure')}}));
 await assert.rejects(ingestVerifiedSubmission(submission(),d.adapter),/receipt failure/);
 assert.equal(d.leads.length,0);assert.equal(d.receipts.size,0);
});
test('invalid form is rejected before a transaction',async()=>{
 const d=db(),value=submission();value.form_name='other';
 await assert.rejects(ingestVerifiedSubmission(value,d.adapter),/Unexpected form/);
 assert.equal(d.leads.length,0);
});
test('invalid adapters and returned IDs are rejected',async()=>{
 await assert.rejects(ingestVerifiedSubmission(submission(),{}),/transactional database adapter/);
 const d=db();d.adapter.withTransaction=async fn=>fn({lockExternalSubmission:async()=>{},findReceipt:async()=>null,insertLead:async()=>0,insertReceipt:async()=>{}});
 await assert.rejects(ingestVerifiedSubmission(submission(),d.adapter),/Invalid returned lead ID/);
});
