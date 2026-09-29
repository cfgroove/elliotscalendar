import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { ArrowLeft, DatabaseBackup } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const db = supabase as any;
const TZ = "America/Chicago";
const fmt = (d: string | Date) =>
  new Date(d).toLocaleString("en-US", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" }) + " CT";

function nextRun() {
  const now = new Date();
  let d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 13));
  if (d <= now) d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 13));
  return d;
}

export default function AdminBackups() {
  const qc = useQueryClient();
  const [result, setResult] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const { data: me } = useQuery({
    queryKey: ["is-owner"],
    queryFn: async () => (await db.rpc("is_owner")).data === true,
  });
  const { data: settings } = useQuery({
    queryKey: ["automation-settings"],
    queryFn: async () => {
      const { data } = await db.from("automation_settings").select("key, enabled");
      return new Map<string, boolean>((data ?? []).map((s: any) => [s.key, s.enabled]));
    },
  });
  const { data: runs } = useQuery({
    queryKey: ["db-backup-runs"],
    queryFn: async () => {
      const { data } = await db
        .from("automation_run_log")
        .select("*")
        .eq("automation_key", "db_backup")
        .order("ran_at", { ascending: false })
        .limit(24);
      return data ?? [];
    },
  });

  const isOwner = me === true;
  const masterOn = settings?.get("master") !== false;
  const enabled = settings?.get("db_backup") !== false;
  const last = runs?.[0];

  const toggle = async (v: boolean) => {
    await db.from("automation_settings").update({ enabled: v, updated_at: new Date().toISOString(), updated_by: (await supabase.auth.getUser()).data.user?.id }).eq("key", "db_backup");
    qc.invalidateQueries({ queryKey: ["automation-settings"] });
  };

  const sendTest = async () => {
    setSending(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("send-db-backup", { body: {} });
    if (error) {
      const details = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
      setResult(`Error: ${details}`);
    } else {
      setResult(data?.subject ?? (data?.skipped ? `Skipped: ${data.reason}` : JSON.stringify(data)));
    }
    setSending(false);
    qc.invalidateQueries({ queryKey: ["db-backup-runs"] });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-5xl mx-auto space-y-4">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Users
      </Link>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <DatabaseBackup className="h-6 w-6 text-primary" />
          <CardTitle>Database Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Monthly backup email</p>
              {!isOwner && <p className="text-xs text-muted-foreground">Managed by CFGroove</p>}
              {!masterOn && <p className="text-xs text-warning">Paused by master switch</p>}
            </div>
            <Switch checked={enabled} disabled={!isOwner} onCheckedChange={toggle} />
          </div>
          <div className="text-sm space-y-1">
            <p>Last run: {last ? `${fmt(last.ran_at)} — ${last.status}` : "Never"}</p>
            <p>Next run: 1st of each month at {nextRun().toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" })} US Central</p>
          </div>
          {isOwner && (
            <div className="space-y-2">
              <Button onClick={sendTest} disabled={sending}>{sending ? "Sending…" : "Send test backup"}</Button>
              {result && <p className="text-sm break-all">{result}</p>}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date & time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs?.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">{fmt(r.ran_at)}</TableCell>
                  <TableCell><Badge variant={r.status === "error" ? "destructive" : "secondary"}>{r.status}</Badge></TableCell>
                  <TableCell>{r.detail?.startsWith("Scheduled: ") ? "Scheduled" : "Manual"}</TableCell>
                  <TableCell className="text-xs">{r.detail?.replace(/^(Scheduled|Manual): /, "")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
