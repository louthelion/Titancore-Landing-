const SMS_PRIVACY = `
<section id="sms-privacy" style="padding:64px 24px;background:#101710;border-top:2px solid #d8b45a;border-bottom:2px solid rgba(216,180,90,.38);color:#fff;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:1120px;margin:0 auto">
    <div style="border:4px solid #d8b45a;background:rgba(0,0,0,.58);padding:38px">
      <h2 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:clamp(34px,6vw,48px);margin:0 0 22px;color:#fff">SMS Privacy &amp; Consent</h2>
      <p style="font-size:20px;line-height:1.7">TitanCore Holdings may collect a mobile phone number when a person voluntarily provides it through our contact form or another direct interaction. We use that number only for the communication purpose described at the time of consent, including customer-care conversations and follow-up related to an inquiry.</p>
      <p style="font-size:20px;line-height:1.7"><strong>No mobile opt-in or text message consent will be shared with third parties or affiliates for marketing or promotional purposes.</strong></p>
      <p style="font-size:20px;line-height:1.7">SMS consent is voluntary and is not a condition of purchase. Message frequency may vary. Message and data rates may apply. Reply STOP to opt out at any time. Reply HELP for assistance.</p>
      <p style="font-size:20px;line-height:1.7">TitanCore Holdings may use service providers only as necessary to deliver communications and operate our systems, subject to appropriate privacy and security obligations.</p>
    </div>
  </div>
</section>`;

const SMS_TERMS = `
<section id="sms-terms" style="padding:64px 24px;background:#101710;border-top:2px solid #d8b45a;border-bottom:2px solid rgba(216,180,90,.38);color:#fff;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:1120px;margin:0 auto">
    <div style="border:4px solid #d8b45a;background:rgba(0,0,0,.58);padding:38px">
      <h2 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:clamp(34px,6vw,48px);margin:0 0 22px;color:#fff">SMS Terms of Service</h2>
      <p style="font-size:20px;line-height:1.7">By voluntarily consenting to receive customer-care SMS messages from TitanCore Holdings, you agree to receive conversational and informational text messages related to your inquiry or requested follow-up.</p>
      <ul style="font-size:20px;line-height:1.7;padding-left:26px">
        <li>Reply STOP to opt out at any time.</li>
        <li>Reply HELP for assistance.</li>
        <li>Message and data rates may apply.</li>
        <li>Message frequency may vary.</li>
        <li>Consent is not a condition of purchase.</li>
      </ul>
      <p style="font-size:20px;line-height:1.7">For privacy information, review the TitanCore Holdings Privacy Policy. Mobile opt-in information and text message consent are not shared with third parties or affiliates for marketing or promotional purposes.</p>
    </div>
  </div>
</section>`;

export default async function handler(request, context) {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  const url = new URL(request.url);
  const isPrivacy = url.pathname.endsWith("/privacy-policy.html") || url.pathname.endsWith("/privacy-policy");
  const isTerms = url.pathname.endsWith("/terms-of-use.html") || url.pathname.endsWith("/terms-of-use");
  if (!isPrivacy && !isTerms) return response;

  let html = await response.text();
  const block = isPrivacy ? SMS_PRIVACY : SMS_TERMS;
  const marker = isPrivacy ? 'id="sms-privacy"' : 'id="sms-terms"';
  if (!html.includes(marker)) {
    if (html.includes("<footer")) html = html.replace("<footer", block + "<footer");
    else if (html.includes("</main>")) html = html.replace("</main>", block + "</main>");
    else html = html.replace("</body>", block + "</body>");
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "no-cache");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
}
