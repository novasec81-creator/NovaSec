const FORMATION_KEYS = {
  '01-phishing': 'PWD_01_PHISHING',
  '02-mots-de-passe': 'PWD_02_MOTS_DE_PASSE',
  '03-securiser-entreprise': 'PWD_03_SECURISER_ENTREPRISE',
  '04-wordpress': 'PWD_04_WORDPRESS',
  '05-arnaques': 'PWD_05_ARNAQUES',
  '06-guide-complet': 'PWD_06_GUIDE_COMPLET',
  'site-vulnerable': 'PWD_SITE_VULNERABLE',
};

export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json' };

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers });
  }

  try {
    const { formation, password } = await request.json();

    if (!formation || !password) {
      return new Response(JSON.stringify({ valid: false }), { status: 400, headers });
    }

    const envKey = FORMATION_KEYS[formation];
    if (!envKey) {
      return new Response(JSON.stringify({ valid: false }), { status: 404, headers });
    }

    const stored = env[envKey];
    if (!stored || password !== stored) {
      return new Response(JSON.stringify({ valid: false }), { status: 401, headers });
    }

    const secret = env.JWT_SECRET || 'nova-sec-fallback-change-me';
    const issued = Date.now();
    const payload = `${formation}|${issued}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const sigHex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
    const token = btoa(payload) + '.' + sigHex;

    return new Response(JSON.stringify({ valid: true, token }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ valid: false }), { status: 500, headers });
  }
}
