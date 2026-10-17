/**
 * The request/response shape every handler in server/handlers is written
 * against. It is the classic Lambda-proxy shape the handlers grew up with on
 * Netlify; server/aws/api.ts and server/dev.ts adapt their own events into it.
 */
export interface HandlerEvent {
  httpMethod: string;
  path: string;
  /** Header names are lowercased. */
  headers: Record<string, string | undefined>;
  queryStringParameters: Record<string, string | undefined> | null;
  body: string | null;
}

export interface HandlerResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
}

export type Handler = (event: HandlerEvent) => Promise<HandlerResponse>;
