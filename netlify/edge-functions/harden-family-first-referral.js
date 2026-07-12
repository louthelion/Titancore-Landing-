const FAMILY_FIRST_URL='https://familyfirstequitygroup.netlify.app/';
const FAMILY_FIRST_REFERRAL_URL=FAMILY_FIRST_URL+'?source=titancore_referral';

export default async function handler(request,context){
  const response=await context.next();
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html'))return response;
  const html=await response.text();
  const hardened=html.replaceAll(FAMILY_FIRST_URL,FAMILY_FIRST_REFERRAL_URL);
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  headers.set('cache-control','no-cache');
  return new Response(hardened,{status:response.status,statusText:response.statusText,headers});
}
