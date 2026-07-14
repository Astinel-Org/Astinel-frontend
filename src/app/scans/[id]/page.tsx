"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";


import { api } from "@/lib/api";
import type { Scan, ScanResult, Finding, ApiResponse } from "@/types";
import { ArrowLeft, RotateCw, XCircle } from "lucide-react";

export default function ScanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [scan, setScan] = useState<Scan | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const id = params.id as string;
    Promise.all([
      api.get<ApiResponse<Scan>>(`/v1/scans/${id}`).then(r => r.data),
      api.get<ApiResponse<ScanResult>>(`/v1/scans/${id}/result`).catch(() => null),
      api.get<Finding[]>(`/v1/findings?scan_id=${id}`).catch(() => []),
    ])
      .then(([s, r, f]) => {
        setScan(s);
        setResult(r ? r.data : null);
        setFindings(f);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const cancel = async () => {
    await api.post(`/v1/scans/${params.id}/cancel`);
    load();
  };

  const retry = async () => {
    await api.post(`/v1/scans/${params.id}/retry`);
    router.push("/scans");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!scan) return <p className="text-muted-foreground">Scan not found</p>;

  const severityColor: Record<string, string> = {
    Critical: "critical", High: "high", Medium: "medium", Low: "low", Info: "info",
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Scan Details</h1>
          <p className="text-muted-foreground font-mono text-sm">{scan.id}</p>
        </div>
        <Badge variant={scan.status === "completed" ? "success" : scan.status === "failed" ? "destructive" : "secondary"} className="text-sm">
          {scan.status}
        </Badge>
        {scan.status === "running" && (
          <Button variant="outline" onClick={cancel}><XCircle className="h-4 w-4 mr-2" />Cancel</Button>
        )}
        {(scan.status === "failed" || scan.status === "cancelled") && (
          <Button onClick={retry}><RotateCw className="h-4 w-4 mr-2" />Retry</Button>
        )}
      </div>

      {scan.status === "running" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{scan.progress}%</span>
            </div>
            <Progress value={scan.progress} />
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardHeader><CardTitle className="text-sm">Score</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{result.score}/100</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Files</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{result.total_files}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Findings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{result.total_findings}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Duration</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{(result.duration_ms / 1000).toFixed(1)}s</p></CardContent></Card>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <Card className="border-red-500/30"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Critical</p><p className="text-xl font-bold text-red-400">{result.critical}</p></CardContent></Card>
            <Card className="border-orange-500/30"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">High</p><p className="text-xl font-bold text-orange-400">{result.high}</p></CardContent></Card>
            <Card className="border-yellow-500/30"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Medium</p><p className="text-xl font-bold text-yellow-400">{result.medium}</p></CardContent></Card>
            <Card className="border-blue-500/30"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Low</p><p className="text-xl font-bold text-blue-400">{result.low}</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Info</p><p className="text-xl font-bold">{result.info}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Findings ({findings.length})</CardTitle></CardHeader>
            <CardContent>
              {findings.length === 0 ? (
                <p className="text-muted-foreground">No findings in this scan</p>
              ) : (
                <div className="space-y-2">
                  {findings.map((f) => (
                    <div key={f.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={severityColor[f.severity] || "default"}>{f.severity}</Badge>
                        <span className="text-sm font-mono text-muted-foreground">{f.rule_id}</span>
                      </div>
                      <p className="text-sm">{f.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {f.file_path}:{f.line}:{f.column}
                      </p>
                      {f.recommendation && (
                        <p className="text-xs text-accent mt-1">{f.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
