// Isolated tests for the DRAFT mapper. Run: node --test drafts/contact-crm/normalize-submission.test.mjs
// No network calls, credentials, or database writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTitanCoreSubmission } from './normalize-submission.mjs';

const base = () => ({
  id: 'submission_123456',
  form_name: 'titancore-contact',
  data: {
    name: ' Alex Example ',
    email: 'Alex@Example.com',
    phone: '+1 (407) 555-0123',
    organization: 'Sample Company',
    'inquiry-type': 'General Question',
    message: 'Please send more information.'
  }
});

test('maps the exact website fields into lead columns', () => {
  const mapped = normalizeTitanCoreSubmission(base());
  assert.equal(mapped.external_submission_id, 'submission_123456');
  assert.deepEqual(mapped.lead, {
    full_name: 'Alex Example', email: 'alex@example.com', phone: '+1 (407) 555-0123',
    company: 'Sample Company', service: 'General Question',
    notes: 'Please send more information.', status: 'new'
  });
});

test('supports all five inquiry choices in contact.html', () => {
  for (const option of ['General Question', 'Professional Inquiry', 'Media Request', 'Institution Question', 'Other']) {
    const value = base(); value.data['inquiry-type'] = option;
    assert.equal(normalizeTitanCoreSubmission(value).lead.service, option);
  }
});

test('allows optional organization and phone', () => {
  const value = base(); delete value.data.organization; delete value.data.phone;
  const lead = normalizeTitanCoreSubmission(value).lead;
  assert.equal(lead.company, null); assert.equal(lead.phone, null);
});

test('rejects a different form', () => {
  const value = base(); value.form_name = 'another-form';
  assert.throws(() => normalizeTitanCoreSubmission(value), /Unexpected form/);
});

test('rejects missing or malformed submission ID', () => {
  for (const id of ['', 'bad id', '../bad']) {
    const value = base(); value.id = id;
    assert.throws(() => normalizeTitanCoreSubmission(value), /Invalid submission ID/);
  }
});

test('rejects malformed email', () => {
  const value = base(); value.data.email = 'not-an-email';
  assert.throws(() => normalizeTitanCoreSubmission(value), /Invalid email/);
});

test('rejects absent required fields', () => {
  for (const key of ['name', 'email', 'message']) {
    const value = base(); delete value.data[key];
    assert.throws(() => normalizeTitanCoreSubmission(value), /Missing/);
  }
});

test('rejects messages over 4000 characters', () => {
  const value = base(); value.data.message = 'x'.repeat(4001);
  assert.throws(() => normalizeTitanCoreSubmission(value), /Invalid message/);
});

test('rejects unsupported inquiry types', () => {
  const value = base(); value.data['inquiry-type'] = 'Administrator';
  assert.throws(() => normalizeTitanCoreSubmission(value), /Unexpected inquiry type/);
});

test('rejects invalid phone characters and nonstring names', () => {
  const badPhone = base(); badPhone.data.phone = '<script>';
  assert.throws(() => normalizeTitanCoreSubmission(badPhone), /Invalid phone/);
  const badName = base(); badName.data.name = { value: 'injected' };
  assert.throws(() => normalizeTitanCoreSubmission(badName), /Invalid name/);
});
