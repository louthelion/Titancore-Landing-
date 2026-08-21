const SCRIPT = '<script src="/live-news.js" defer></script>';

export default async function handler(request, context) {
  const response = await context.next();
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  const html = await response.text();
  const updated = html.includes('/live-news.js')
    ? html
    : (html.includes('</body>') ? html.replace('</body>', `${SCRIPT}</body>`) : `${html}${SCRIPT}`);

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('cache-control', 'no-cache');
  return new Response(updated, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
