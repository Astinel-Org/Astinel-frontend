"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Scan } from "@/types";
import { RotateCw } from "lucide-react";

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get<Scan[]>("/v1/scans")
      .then(setScans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancelScan = async (id: string) => {
    try {
      await api.post(`/v1/scans/${id}/cancel`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const retryScan = async (id: string) => {
    try {
      await api.post(`/v1/scans/${id}/retry`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scans</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage security scans</p>
        </div>
        <Button variant="outline" size="icon" onClick={load}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : scans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No scans yet. Trigger a scan from a project page.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {scans.map((s) => (
            <Link key={s.id} href={`/scans/${s.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{s.branch}</span>
                      <Badge variant="secondary">{s.trigger}</Badge>
                      <Badge variant={s.status === "completed" ? "success" : s.status === "failed" ? "destructive" : s.status === "running" ? "secondary" : "outline"}>
                        {s.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.score !== null && (
                        <span className="text-sm font-mono font-bold">{s.score}/100</span>
                      )}
                    </div>
                  </div>
                  {s.status === "running" || s.status === "queued" ? (
                    <Progress value={s.progress} className="mt-2" />
                  ) : null}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </p>
                    <div className="flex gap-1" onClick={(e) => e.preventDefault()}>
                      {s.status !== "completed" && s.status !== "failed" && s.status !== "cancelled" && (
                        <Button variant="ghost" size="sm" onClick={() => cancelScan(s.id)}>Cancel</Button>
                      )}
                      {(s.status === "failed" || s.status === "cancelled") && (
                        <Button variant="ghost" size="sm" onClick={() => retryScan(s.id)}>Retry</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
