import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

async function validateWorkInkToken(token: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://work.ink/_api/v2/token/isValid/${token}?deleteToken=1`,
      { cache: "no-store" }
    );
    if (!res.ok) return { valid: false, error: "Error al contactar work.ink" };
    const data = await res.json();
    if (!data.valid) return { valid: false, error: "Token inválido o expirado" };
    return { valid: true };
  } catch {
    return { valid: false, error: "No se pudo verificar el token" };
  }
}

function getExpiresAt(expires_in: string): string | null {
  if (!expires_in || expires_in === "lifetime") return null;
  const now = new Date();
  const match = expires_in.match(/^(\d+)(h|d|m)$/);
  if (!match) return null;
  const amount = parseInt(match[1]);
  const unit = match[2];
  if (unit === "h") now.setHours(now.getHours() + amount);
  else if (unit === "d") now.setDate(now.getDate() + amount);
  else if (unit === "m") now.setMinutes(now.getMinutes() + amount);
  return now.toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const label: string = body.label || "";
    const workinkToken: string = body.workink_token || "";
    const adminKey: string = body.admin_key || "";
    const expiresIn: string = body.expires_in || "lifetime";

    const isAdminRequest = adminKey && adminKey === process.env.ADMIN_KEY;

    if (!isAdminRequest) {
      if (workinkToken) {
        const validation = await validateWorkInkToken(workinkToken);
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error || "Token de work.ink inválido" },
            { status: 403 }
          );
        }
      }
    }

    const key = `h6x-${uuidv4().replace(/-/g, "").slice(0, 32)}`;
    const expires_at = isAdminRequest ? getExpiresAt(expiresIn) : getExpiresAt("2h");

    const { error } = await supabaseAdmin.from("api_keys").insert({
      key,
      label: label || (isAdminRequest ? `Bot | ${expiresIn}` : "work.ink | 2h"),
      is_active: true,
      expires_at,
    });

    if (error) {
      console.error("Error inserting key:", error);
      return NextResponse.json(
        { error: "Error al guardar la key en la base de datos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      key,
      message: "Key generada exitosamente",
      expires_in: expiresIn,
      expires_at: expires_at || "never",
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
