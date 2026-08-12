/**
 * Echoes X-Request-ID the way a compliant ASPSP does, because the habit of
 * correlating on it is the single most useful thing to learn early.
 */
export const onRequest: PagesFunction = async (context) => {
  const requestId = context.request.headers.get('X-Request-ID') ?? crypto.randomUUID();

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(requestId),
    });
  }

  let response: Response;
  try {
    response = await context.next();
  } catch (error) {
    return json(
      {
        tppMessages: [
          {
            category: 'ERROR',
            code: 'INTERNAL_SERVER_ERROR',
            text: error instanceof Error ? error.message : 'Unhandled error',
          },
        ],
      },
      500,
      requestId,
    );
  }

  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(requestId))) headers.set(k, v);
  headers.set('X-Content-Type-Options', 'nosniff');

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

function corsHeaders(requestId: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Request-ID, Consent-ID, PSU-IP-Address, Authorization',
    'Access-Control-Max-Age': '86400',
    'X-Request-ID': requestId,
  };
}

export function json(body: unknown, status = 200, requestId?: string): Response {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (requestId) headers['X-Request-ID'] = requestId;
  return new Response(JSON.stringify(body, null, 2), { status, headers });
}
