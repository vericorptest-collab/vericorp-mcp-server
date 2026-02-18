export const TOOL_DEFINITIONS = [
  {
    name: "vericorp_company_lookup",
    description: "Look up a European company by tax ID. Returns company name, address, legal form, status, directors, and more. Supports 28 countries (27 EU + UK).",
    inputSchema: {
      type: "object" as const,
      properties: {
        tax_id: {
          type: "string",
          description: "Tax ID with country prefix, e.g. PT502011378, DK10150817, GB00445790",
        },
      },
      required: ["tax_id"],
    },
  },
  {
    name: "vericorp_validate_vat",
    description: "Validate a European VAT number. Checks format locally and verifies against VIES (EU VAT validation service). Returns validity status and company name if valid.",
    inputSchema: {
      type: "object" as const,
      properties: {
        tax_id: {
          type: "string",
          description: "VAT number with country prefix, e.g. PT502011378, DE123456789",
        },
      },
      required: ["tax_id"],
    },
  },
  {
    name: "vericorp_supported_countries",
    description: "List all countries supported by VeriCorp. Shows which countries have full enrichment vs VAT-only validation.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
];

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  api: Fetcher,
  proxySecret: string,
): Promise<{ content: Array<{ type: string; text: string }> }> {
  let path: string;
  let method = "GET";
  let body: string | undefined;

  switch (name) {
    case "vericorp_company_lookup":
      path = `/v1/company/${encodeURIComponent(args.tax_id as string)}`;
      break;
    case "vericorp_validate_vat":
      path = `/v1/validate/${encodeURIComponent(args.tax_id as string)}`;
      break;
    case "vericorp_supported_countries":
      path = "/v1/countries";
      break;
    default:
      return { content: [{ type: "text", text: `Unknown tool: ${name}` }] };
  }

  try {
    const response = await api.fetch(
      new Request(`https://vericorp${path}`, {
        method,
        body,
        headers: { "X-RapidAPI-Proxy-Secret": proxySecret },
      }),
    );

    const data = await response.text();

    if (!response.ok) {
      return { content: [{ type: "text", text: `API error (${response.status}): ${data}` }] };
    }

    return { content: [{ type: "text", text: data }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Failed to reach VeriCorp API: ${(err as Error).message}` }] };
  }
}
