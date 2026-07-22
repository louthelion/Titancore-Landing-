const VALIDATION_PROJECT_REF = 'tyegetjvohkzdzcyrpmm';
const PRODUCTION_PROJECT_REF = 'jgpvrblzyznyprtffirw';

const pick = (...names) => {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return '';
};

exports.handler = async () => {
  const configuredUrl = pick('FF_V3_VALIDATION_SUPABASE_URL', 'VITE_VALIDATION_SUPABASE_URL', 'SUPABASE_URL');
  const anonymousKey = pick('FF_V3_VALIDATION_SUPABASE_ANON_KEY', 'VITE_VALIDATION_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');
  const fallbackUrl = `https://${VALIDATION_PROJECT_REF}.supabase.co`;
  const supabaseUrl = configuredUrl || fallbackUrl;
  const projectRef = (() => {
    try {
      return new URL(supabaseUrl).hostname.split('.')[0];
    } catch (_error) {
      return '';
    }
  })();

  if (projectRef === PRODUCTION_PROJECT_REF) {
    return {
      statusCode: 409,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      body: JSON.stringify({ error: 'Validation auth is blocked because production Supabase is configured.' })
    };
  }

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify({
      supabaseUrl,
      anonymousKey,
      projectRef,
      expectedProjectRef: VALIDATION_PROJECT_REF,
      productionProjectRef: PRODUCTION_PROJECT_REF,
      siteUrl: process.env.URL || '',
      authCallbackPath: '/family-first-acquisition-platform-v3.html',
      environmentVariableNames: {
        supabaseUrl: ['FF_V3_VALIDATION_SUPABASE_URL', 'VITE_VALIDATION_SUPABASE_URL', 'SUPABASE_URL'],
        anonymousKey: ['FF_V3_VALIDATION_SUPABASE_ANON_KEY', 'VITE_VALIDATION_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY']
      }
    })
  };
};
