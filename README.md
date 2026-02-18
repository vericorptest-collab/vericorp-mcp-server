# VeriCorp MCP Server

MCP (Model Context Protocol) server for European company verification via the [VeriCorp API](https://rapidapi.com/vericorptestcollab/api/vericorp).

Use this server to give AI assistants (Claude, ChatGPT, etc.) the ability to look up and validate European companies.

## Tools

| Tool | Description |
|------|-------------|
| `vericorp_company_lookup` | Look up a company by tax ID (28 countries) |
| `vericorp_validate_vat` | Validate a VAT number via VIES |
| `vericorp_supported_countries` | List supported countries |

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vericorp": {
      "url": "https://vericorp-mcp-server.vericorptest.workers.dev/mcp"
    }
  }
}
```

## Rate Limits

- 50 tool calls per day
- 5 tool calls per minute

Need more? Get your own API key at [RapidAPI](https://rapidapi.com/vericorptestcollab/api/vericorp).

## License

MIT
