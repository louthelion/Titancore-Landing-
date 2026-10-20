// DRAFT: Transaction coordinator, independent of network and credentials.
// Only call after independently verifying trusted Netlify submission authenticity.
// adapter.withTransaction(callback) MUST create a real single DB transaction.
// tx.lockExternalSubmission(id) MUST lock for the duration of that transaction.
// tx.findReceipt(id), tx.insertLead(lead), tx.insertReceipt({id,leadId}) must
// all execute inside that same transaction; never use separate REST requests.
import { normalizeTitanCoreSubmission } from './normalize-submission.mjs';

export async function ingestVerifiedSubmission(submission, adapter) {
  if (!adapter || typeof adapter.withTransaction !== 'function')
    throw new TypeError('A transactional database adapter is required');

  const mapped = normalizeTitanCoreSubmission(submission);
  return adapter.withTransaction(async tx => {
    if (!tx || ['lockExternalSubmission', 'findReceipt', 'insertLead', 'insertReceipt']
      .some(name => typeof tx[name] !== 'function'))
      throw new TypeError('Missing transactional operations');

    await tx.lockExternalSubmission(mapped.external_submission_id);
    const existing = await tx.findReceipt(mapped.external_submission_id);
    if (existing) return { leadId: existing.leadId, created: false };

    const leadId = await tx.insertLead(mapped.lead);
    if (!Number.isSafeInteger(leadId) || leadId <= 0)
      throw new Error('Invalid returned lead ID');
    await tx.insertReceipt({ id: mapped.external_submission_id, leadId });
    return { leadId, created: true };
  });
}
