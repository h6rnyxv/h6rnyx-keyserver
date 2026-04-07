-- Tabla para tokens de verificación Discord
  -- Ejecutar en Supabase SQL Editor: https://supabase.com/dashboard/project/jiisrjtigelzncwrtovk/sql/new

  CREATE TABLE IF NOT EXISTS discord_verify_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       TEXT        NOT NULL UNIQUE,
    discord_user_id TEXT    NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Índice para búsquedas rápidas por token
  CREATE INDEX IF NOT EXISTS idx_discord_verify_tokens_token ON discord_verify_tokens (token);

  -- Limpiar tokens expirados automáticamente (opcional, ejecutar con pg_cron si está disponible)
  -- SELECT cron.schedule('cleanup-verify-tokens', '*/30 * * * *', $$
  --   DELETE FROM discord_verify_tokens WHERE expires_at < NOW() - INTERVAL '1 hour';
  -- $$);
  