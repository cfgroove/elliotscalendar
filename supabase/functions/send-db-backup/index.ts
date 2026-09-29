import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SITE_URL = "https://elliotscalendar.lovable.app";
const SITE_DOMAIN = new URL(SITE_URL).hostname;
const FROM = "CFG Reports <reports@cfgroove.com>";
const TO = "chase@cfgroove.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const PAGE = 1000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function toBase64(str: string) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Authorize: cron secret or signed-in owner
  let trigger: "Scheduled" | "Manual" | null = null;
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret) {
    const { data } = await admin.rpc("verify_cron_secret", { _secret: cronSecret });
    if (data === true) trigger = "Scheduled";
  }
  if (!trigger) {
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: auth } },
      });
      const { data: u } = await userClient.auth.getUser();
      if (u?.user) {
        const { data: owner } = await userClient.rpc("is_owner");
        if (owner === true) trigger = "Manual";
      }
    }
  }
  if (!trigger) return json({ error: "Unauthorized" }, 401);

  const prefix = `${trigger}: `;
  const log = (status: "ok" | "skipped" | "error", detail: string) =>
    admin.from("automation_run_log").insert({ automation_key: "db_backup", status, detail: prefix + detail });

  try {
    // Toggle contract incl. master switch
    const { data: settings } = await admin
      .from("automation_settings")
      .select("key, enabled")
      .in("key", ["master", "db_backup"]);
    const map = new Map((settings ?? []).map((s) => [s.key, s.enabled]));
    if (map.get("master") === false || map.get("db_backup") === false) {
      const why = map.get("master") === false ? "paused by master switch" : "db_backup disabled";
      await log("skipped", why);
      return json({ skipped: true, reason: why });
    }

    const { data: tableNames, error: tErr } = await admin.rpc("list_public_tables");
    if (tErr) throw new Error(`list tables: ${tErr.message}`);

    const tables: Record<string, { row_count: number; rows: unknown[] }> = {};
    for (const name of (tableNames as string[]) ?? []) {
      const rows: unknown[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await admin.from(name).select("*").range(from, from + PAGE - 1);
        if (error) throw new Error(`${name}: ${error.message}`);
        rows.push(...(data ?? []));
        if (!data || data.length < PAGE) break;
      }
      tables[name] = { row_count: rows.length, rows };
    }

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const payload = { exported_at: now.toISOString(), site: SITE_URL, tables };
    const counts = Object.entries(tables).map(([t, v]) => `${t}: ${v.row_count}`);
    const subject = `[CFG Backup] ${SITE_DOMAIN} ${date}`;
    const filename = `db-backup-${SITE_DOMAIN}-${date}.json`;

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!lovableKey || !resendKey) throw new Error("Email service not configured");

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject,
        text: counts.join("\n"),
        attachments: [{ filename, content: toBase64(JSON.stringify(payload, null, 2)) }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend [${res.status}]: ${body}`);
    }

    await log("ok", counts.join(", "));
    return json({ ok: true, subject, counts });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("send-db-backup failed:", msg);
    await log("error", msg);
    return json({ error: msg }, 500);
  }
});
