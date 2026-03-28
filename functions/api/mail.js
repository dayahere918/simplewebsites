/**
 * Temp Mail — Cloudflare Pages Function (API Proxy)
 * Proxies requests to 1secmail and guerrillamail APIs to bypass CORS restrictions
 * Free tier — no cost
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || '';
  const provider = url.searchParams.get('provider') || 'secmail';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    if (provider === 'secmail') {
      const SECMAIL_API = 'https://www.1secmail.com/api/v1/';

      if (action === 'generate') {
        const res = await fetch(`${SECMAIL_API}?action=genRandomMailbox&count=1`);
        const data = await res.json();
        return new Response(JSON.stringify(data), { status: 200, headers });
      }

      if (action === 'getMessages') {
        const login = url.searchParams.get('login') || '';
        const domain = url.searchParams.get('domain') || '';
        const res = await fetch(`${SECMAIL_API}?action=getMessages&login=${login}&domain=${domain}`);
        const data = await res.json();
        return new Response(JSON.stringify(data), { status: 200, headers });
      }

      if (action === 'readMessage') {
        const login = url.searchParams.get('login') || '';
        const domain = url.searchParams.get('domain') || '';
        const id = url.searchParams.get('id') || '';
        const res = await fetch(`${SECMAIL_API}?action=readMessage&login=${login}&domain=${domain}&id=${id}`);
        const data = await res.json();
        return new Response(JSON.stringify(data), { status: 200, headers });
      }
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
