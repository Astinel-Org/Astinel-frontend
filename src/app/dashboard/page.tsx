"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { Dashboard, ApiResponse } from "@/types";
import { Shield, Bug, ScanSearch, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<Dashboard>>("/v1/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (!data) return <p className="text-muted-foreground">Failed to load dashboard</p>;

  const severityColor: Record<string, string> = {
    Critical: "critical",
    High: "high",
    Medium: "medium",
    Low: "low",
    Info: "info",
  };

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your security posture</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Shield} label="Projects" value={data.total_projects} />
        <StatCard icon={ScanSearch} label="Total Scans" value={data.total_scans} />
        <StatCard icon={Bug} label="Findings" value={data.total_findings} />
        <StatCard icon={TrendingUp} label="Avg Score" value={`${data.average_score.toFixed(0)}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Findings by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.findings_by_severity.map((s) => (
                <div key={s.severity} className="flex items-center gap-3">
                  <Badge variant={(severityColor[s.severity] || "default") as "critical" | "high" | "medium" | "low" | "info" | "default"}>
                    {s.severity}
                  </Badge>
                  <Progress value={Math.min(100, (s.count / Math.max(1, data.total_findings)) * 100)} className="flex-1" />
                  <span className="text-sm w-8 text-right">{s.count}</span>
                </div>
              ))}
              {data.findings_by_severity.length === 0 && (
                <p className="text-sm text-muted-foreground">No findings yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recent_scans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{scan.project_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(scan.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {scan.score !== null && (
                      <span className="text-sm font-mono">{scan.score}/100</span>
                    )}
                    <Badge variant={scan.status === "completed" ? "success" : scan.status === "failed" ? "destructive" : "secondary"}>
                      {scan.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {data.recent_scans.length === 0 && (
                <p className="text-sm text-muted-foreground">No scans yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Critical" value={data.critical_findings} variant="critical" />
        <MetricCard label="High" value={data.high_findings} variant="high" />
        <MetricCard label="Medium" value={data.medium_findings} variant="medium" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: number; variant: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </div>
  );
}
