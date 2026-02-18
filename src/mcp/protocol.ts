export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export const RpcErrors = {
  PARSE_ERROR: { code: -32700, message: "Parse error" },
  INVALID_REQUEST: { code: -32600, message: "Invalid Request" },
  METHOD_NOT_FOUND: { code: -32601, message: "Method not found" },
  INVALID_PARAMS: { code: -32602, message: "Invalid params" },
  INTERNAL_ERROR: { code: -32603, message: "Internal error" },
} as const;

export function rpcSuccess(id: string | number | null, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

export function rpcError(id: string | number | null, error: JsonRpcError): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error };
}

export function parseRequest(body: string): JsonRpcRequest | JsonRpcError {
  try {
    const parsed = JSON.parse(body);
    if (parsed.jsonrpc !== "2.0" || typeof parsed.method !== "string") {
      return RpcErrors.INVALID_REQUEST;
    }
    return parsed as JsonRpcRequest;
  } catch {
    return RpcErrors.PARSE_ERROR;
  }
}
