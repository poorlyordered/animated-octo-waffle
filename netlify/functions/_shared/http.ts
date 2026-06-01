export interface FunctionResponse {
  statusCode: number;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body: string;
}

const jsonHeaders = {
  'content-type': 'application/json'
};

export function jsonResponse(statusCode: number, payload: unknown): FunctionResponse {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  };
}

export function safeErrorResponse(message: string, statusCode = 500): FunctionResponse {
  return jsonResponse(statusCode, { error: message });
}

export function redirectResponse(location: string, cookies: string[] = []): FunctionResponse {
  return {
    statusCode: 302,
    headers: { location },
    multiValueHeaders: cookies.length > 0 ? { 'set-cookie': cookies } : undefined,
    body: ''
  };
}
