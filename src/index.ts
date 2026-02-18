import { parseRequest, rpcError, RpcErrors, type JsonRpcResponse } from "./mcp/protocol";
import { handleMethod } from "./mcp/handlers";
import { checkRateLimit, incrementCounters } from "./rate-limit";

interface Env {
  MCP_KV: KVNamespace;
  VERICORP_API: Fetcher;
  RAPIDAPI_PROXY_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only POST /mcp
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "") {
      return Response.json({
        name: "vericorp-mcp-server",
        version: "1.0.0",
        description: "MCP server for European company verification via VeriCorp API",
        endpoint: "/mcp",
      });
    }

    if (url.pathname !== "/mcp") {
      return Response.json({ error: "Not Found" }, { status: 404 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed. Use POST." }, { status: 405, headers: corsHeaders() });
    }

    // Parse JSON-RPC request
    const body = await request.text();
    const parsed = parseRequest(body);

    if ("code" in parsed) {
      return jsonRpc(rpcError(null, parsed));
    }

    const req = parsed;

    // Rate limit only tool calls (not initialize, ping, etc.)
    if (req.method === "tools/call") {
      const limitError = await checkRateLimit(env.MCP_KV);
      if (limitError) {
        return jsonRpc(rpcError(req.id ?? null, { code: -32000, message: limitError }));
      }
    }

    // Handle the method
    const response = await handleMethod(req, env.VERICORP_API, env.RAPIDAPI_PROXY_SECRET);

    // Increment counters after successful tool call
    if (req.method === "tools/call" && response && !response.error) {
      await incrementCounters(env.MCP_KV);
    }

    // Notifications don't get a response
    if (response === null) {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    return jsonRpc(response);
  },
} satisfies ExportedHandler<Env>;

function jsonRpc(response: JsonRpcResponse): Response {
  return new Response(JSON.stringify(response), {
    status: response.error ? 200 : 200, // JSON-RPC always returns 200
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id",
    "Access-Control-Expose-Headers": "Mcp-Session-Id",
  };
}
