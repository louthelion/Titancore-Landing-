// DRAFT ONLY. This is not a deployed worker and does not make network requests.
// Accepts submissions fetched by an independently authenticated Netlify API client.
// Each item is processed by the existing transaction coordinator. Fail closed:
// errors stop the batch so the caller can retry without losing submissions.
import { ingestVerifiedSubmission } from './ingest-verified-submission.mjs';

export async function reconcileVerifiedContactPage(submissions, adapter) {
  if (!Array.isArray(submissions)) throw new TypeError('Expected a submission page');
  if (submissions.length > 100) throw new RangeError('Page exceeds safe batch size');
  const result = { created: 0, existing: 0 };
  for (const submission of submissions) {
    const outcome = await ingestVerifiedSubmission(submission, adapter);
    if (outcome.created) result.created += 1;
    else result.existing += 1;
  }
  return result;
}
