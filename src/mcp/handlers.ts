import type { JsonRpcRequest, JsonRpcResponse } from "./protocol";
import { rpcSuccess, rpcError, RpcErrors } from "./protocol";
import { TOOL_DEFINITIONS, executeTool } from "./tools";

const SERVER_INFO = {
  name: "vericorp-mcp-server",
  version: "1.0.0",
};

const CAPABILITIES = {
  tools: {},
};

export async function handleMethod(
  req: JsonRpcRequest,
  api: Fetcher,
  proxySecret: string,
): Promise<JsonRpcResponse | null> {
  const id = req.id ?? null;

  switch (req.method) {
    case "initialize":
      return rpcSuccess(id, {
        protocolVersion: "2025-03-26",
        serverInfo: SERVER_INFO,
        capabilities: CAPABILITIES,
      });

    case "notifications/initialized":
      // Notification — no response
      return null;

    case "ping":
      return rpcSuccess(id, {});

    case "tools/list":
      return rpcSuccess(id, { tools: TOOL_DEFINITIONS });

    case "tools/call": {
      const params = req.params as { name?: string; arguments?: Record<string, unknown> } | undefined;
      if (!params?.name) {
        return rpcError(id, RpcErrors.INVALID_PARAMS);
      }

      const tool = TOOL_DEFINITIONS.find((t) => t.name === params.name);
      if (!tool) {
        return rpcError(id, { code: -32602, message: `Unknown tool: ${params.name}` });
      }

      const result = await executeTool(params.name, params.arguments ?? {}, api, proxySecret);
      return rpcSuccess(id, result);
    }

    default:
      return rpcError(id, RpcErrors.METHOD_NOT_FOUND);
  }
}
