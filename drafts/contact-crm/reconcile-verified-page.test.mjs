// Review-only tests: fake adapter; no live database or Netlify calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileVerifiedContactPage } from './reconcile-verified-page.mjs';

const make = id => ({ id, form_name: 'titancore-contact', data: { name: 'Test Person', email: 'test@example.com', message: 'Test inquiry' } });
const store = () => {
  const receipts = new Map(), leads = [];
  return {
    receipts, leads,
    adapter: { async withTransaction(fn) {
      const before = leads.length;
      const saved = new Map(receipts);
      try {
        return await fn({
          async lockExternalSubmission() {},
          async findReceipt(id) { return receipts.has(id) ? { leadId: receipts.get(id) } : null; },
          async insertLead(lead) { leads.push(lead); return leads.length; },
          async insertReceipt({ id, leadId }) { receipts.set(id, leadId); }
        });
      } catch (e) {
        leads.length = before;
        receipts.clear();
        for (const [k,v] of saved) receipts.set(k,v);
        throw e;
      }
    } }
  };
};

test('new and duplicate submissions are counted separately', async () => {
  const s = store(), a = make('submission_123456'), b = make('submission_654321');
  assert.deepEqual(await reconcileVerifiedContactPage([a,b,a], s.adapter), { created: 2, existing: 1 });
  assert.equal(s.leads.length, 2);
});

test('invalid entry stops the page without processing later entries', async () => {
  const s = store(), invalid = make('submission_invalid'), later = make('submission_later');
  invalid.form_name = 'other';
  await assert.rejects(reconcileVerifiedContactPage([make('submission_first'), invalid, later], s.adapter), /Unexpected form/);
  assert.equal(s.leads.length, 1);
  assert.equal(s.receipts.has(later.id), false);
});

test('rejects non-arrays and oversized pages before any writes', async () => {
  const s = store();
  await assert.rejects(reconcileVerifiedContactPage({}, s.adapter), /submission page/);
  await assert.rejects(reconcileVerifiedContactPage(Array.from({ length: 101 }, (_, i) => make('submission_' + i)), s.adapter), /safe batch size/);
  assert.equal(s.leads.length, 0);
});

test('empty page is a no-op', async () => {
  const s = store();
  assert.deepEqual(await reconcileVerifiedContactPage([], s.adapter), { created: 0, existing: 0 });
});
