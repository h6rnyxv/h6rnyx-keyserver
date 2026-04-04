# h6rnyx-keyserver

Sistema de gestión de API Keys construido con Next.js, TypeScript, Supabase y Tailwind CSS.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Base de datos**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS
- **Package manager**: pnpm

## Endpoints

### `POST /api/generatekey`
Genera una nueva API key y la guarda en Supabase.

**Body (opcional):**
```json
{ "label": "nombre descriptivo" }
```

**Respuesta:**
```json
{ "key": "h6x-abc123...", "message": "Key generada exitosamente" }
```

### `POST /api/checkkey`
Verifica si una API key existe y está activa.

**Body:**
```json
{ "key": "h6x-abc123..." }
```

**Respuesta (válida):**
```json
{ "valid": true, "message": "Key válida y activa", "label": "...", "created_at": "..." }
```

## Setup en Supabase

Ejecuta este SQL en el SQL Editor de tu proyecto Supabase:

```sql
CREATE TABLE api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  label text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  last_used_at timestamp with time zone
);

CREATE INDEX idx_api_keys_key ON api_keys(key);
```

## Variables de entorno

Crea un archivo `.env.local` con:

```
NEXT_PUBLIC_SUPABASE_URL=https://jiisrjtigelzncwrtovk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_-EqKFQ0pStuE4K8bMx5G8g_hkdeEWXK
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## Instalación local

```bash
pnpm install
pnpm dev
```

## Deploy en Vercel

1. Sube el proyecto a GitHub como `h6rnyx-keyserver`
2. Ve a [vercel.com](https://vercel.com) → New Project → importa el repo
3. En "Environment Variables" agrega las 3 variables de arriba
4. Haz clic en Deploy
