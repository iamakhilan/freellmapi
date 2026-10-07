  intelligenceRank?: number;
  speedRank?: number;
  sizeLabel?: string;
  monthlyTokenBudget?: string;
  contextWindow?: number | null;
  supportsVision?: boolean;
  supportsTools?: boolean;
  fallbackEnabled?: boolean;
}

function normalizeLoadedConfig(value: unknown): unknown {
  // The dashboard's authenticated JSON export wraps the actual key list in
  // { version, exportedAt, source, keys }. Accept that format directly so a
  // user can paste the export into FREEAPI_CONFIG_JSON without hand-editing it.
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Array.isArray((value as { keys?: unknown }).keys) &&
    !('customProviders' in (value as object)) &&
    !('models' in (value as object)) &&
    !('fallback' in (value as object)) &&
    !('routing' in (value as object))
  ) {
    return { keys: (value as { keys: unknown[] }).keys };
  }
  return value;
}

function readConfigFromEnv(): { source: string; value: unknown } | null {
  const inline = process.env.FREEAPI_CONFIG_JSON?.trim();
  if (inline) return { source: 'FREEAPI_CONFIG_JSON', value: normalizeLoadedConfig(JSON.parse(inline)) };

  const configPath = process.env.FREEAPI_CONFIG_PATH?.trim();
  if (configPath) {
    return { source: configPath, value: normalizeLoadedConfig(JSON.parse(fs.readFileSync(configPath, 'utf8'))) };
  }

  return null;
}

function encryptedKey(raw: string) {
  const { encrypted, iv, authTag } = encrypt(raw);
  return { encrypted, iv, authTag };
}

// Boot-time skip guard for `keys` entries (#600). When a platform stops being
// keyless (pollinations lost `keyless: true` in #573), a legacy declarative
// config still carries an entry with no `key` — applyDeclarativeConfigFromEnv()