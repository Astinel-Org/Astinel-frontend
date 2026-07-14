"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { api } from "@/lib/api";
import type { Project, Scan, ApiResponse } from "@/types";
import { ArrowLeft, Play, Trash2 } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const id = params.id as string;
    Promise.all([
      api.get<ApiResponse<Project>>(`/v1/projects/${id}`).then(r => r.data),
      api.get<Scan[]>("/v1/scans"),
    ])
      .then(([p, s]) => {
        setProject(p);
        setScans(s.filter(sc => sc.project_id === id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const triggerScan = async () => {
    try {
      await api.post("/v1/scans", { project_id: params.id });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProject = async () => {
    if (!confirm("Delete this project?")) return;
    try {
      await api.delete(`/v1/projects/${params.id}`);
      router.push("/projects");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!project) return <p className="text-muted-foreground">Project not found</p>;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.slug}</p>
        </div>
        <Button onClick={triggerScan}><Play className="h-4 w-4 mr-2" />Scan</Button>
        <Button variant="destructive" size="icon" onClick={deleteProject}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Language</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-semibold">{project.language}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Default Branch</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-semibold">{project.default_branch}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Scans</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-semibold">{scans.length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Scan History</CardTitle></CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <p className="text-muted-foreground">No scans yet. Click &quot;Scan&quot; to start one.</p>
          ) : (
            <div className="space-y-2">
              {scans.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{s.branch}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.score !== null && <span className="text-sm font-mono">{s.score}/100</span>}
                    <Badge variant={s.status === "completed" ? "success" : s.status === "failed" ? "destructive" : "secondary"}>
                      {s.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
