/**
 * Vercel Edge Function — returns the visitor's country from Vercel's geo
 * headers (https://vercel.com/docs/edge-network/headers#x-vercel-ip-country).
 *
 * First-party: the IP is resolved at Vercel's edge and never sent to a third
 * party. Locally (plain `vite dev`) this route doesn't exist, so the client
 * falls back to the browser locale — see src/i18n/countries.ts.
 */
export const config = { runtime: 'edge' };

export default function handler(request: Request): Response {
  const country = request.headers.get('x-vercel-ip-country') ?? '';
  return new Response(JSON.stringify({ country }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}
