// DRAFT ONLY. Not a Netlify function; not deployed. No secrets or database access.
// This module validates a previously authenticated Netlify submission.
// Authentication, deduplication and persistence MUST be implemented separately.
export function normalizeTitanCoreSubmission(submission) {
  if (!submission || typeof submission !== "object" || Array.isArray(submission)) throw new Error("Invalid submission");
  if (submission.form_name !== "titancore-contact") throw new Error("Unexpected form");
  if (typeof submission.id !== "string" || !/^[A-Za-z0-9_-]{6,128}$/.test(submission.id)) throw new Error("Invalid submission ID");
  const data=submission.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid fields");
  const field=(key,max,required=false)=>{
    const v=data[key];
    if(v==null || v===""){if(required)throw new Error("Missing "+key);return null;}
    if(typeof v!=="string")throw new Error("Invalid "+key);
    const clean=v.trim();
    if(!clean){if(required)throw new Error("Missing "+key);return null;}
    if(clean.length>max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(clean))throw new Error("Invalid "+key);
    return clean;
  };
  const name=field("name",160,true),email=field("email",254,true),message=field("message",4000,true);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("Invalid email");
  const phone=field("phone",40);
  if(phone && !/^[+0-9().\-\s]{7,40}$/.test(phone))throw new Error("Invalid phone");
  const company=field("organization",200);
  const inquiry=field("inquiry-type",100);
  const allowed=["General Question","Professional Inquiry","Media Request","Institution Question","Other"];
  if(inquiry && !allowed.includes(inquiry))throw new Error("Unexpected inquiry type");
  return {external_submission_id:submission.id,lead:{full_name:name,email:email.toLowerCase(),phone,company,service:inquiry||"General Question",notes:message,status:"new"}};
}
