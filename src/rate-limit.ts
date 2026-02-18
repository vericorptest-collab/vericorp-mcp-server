const DAILY_LIMIT = 50;
const MINUTE_LIMIT = 5;

export async function checkRateLimit(kv: KVNamespace): Promise<string | null> {
  const now = new Date();
  const dayKey = `mcp:budget:${now.toISOString().slice(0, 10)}`;
  const minKey = `mcp:min:${now.toISOString().slice(0, 16)}`;

  const [dayCount, minCount] = await Promise.all([
    kv.get(dayKey).then((v) => parseInt(v || "0", 10)),
    kv.get(minKey).then((v) => parseInt(v || "0", 10)),
  ]);

  if (minCount >= MINUTE_LIMIT) {
    return "Rate limit: max 5 requests per minute. Please wait and try again.";
  }

  if (dayCount >= DAILY_LIMIT) {
    return "Daily limit reached (50 calls/day). Get your own API key at https://rapidapi.com/vericorp/api/vericorp-api";
  }

  return null;
}

export async function incrementCounters(kv: KVNamespace): Promise<void> {
  const now = new Date();
  const dayKey = `mcp:budget:${now.toISOString().slice(0, 10)}`;
  const minKey = `mcp:min:${now.toISOString().slice(0, 16)}`;

  const [dayCount, minCount] = await Promise.all([
    kv.get(dayKey).then((v) => parseInt(v || "0", 10)),
    kv.get(minKey).then((v) => parseInt(v || "0", 10)),
  ]);

  await Promise.all([
    kv.put(dayKey, String(dayCount + 1), { expirationTtl: 86400 }),
    kv.put(minKey, String(minCount + 1), { expirationTtl: 120 }),
  ]);
}
