"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Finding } from "@/types";
import { Search } from "lucide-react";

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    api.get<Finding[]>("/v1/findings")
      .then(setFindings)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleSuppress = async (id: string, suppressed: boolean) => {
    try {
      await api.patch(`/v1/findings/${id}`, { is_suppressed: !suppressed });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = findings.filter((f) =>
    !filter || f.severity.toLowerCase() === filter.toLowerCase() || f.rule_id.toLowerCase().includes(filter.toLowerCase())
  );

  const severityColor: Record<string, any> = {
    Critical: "critical", High: "high", Medium: "medium", Low: "low", Info: "info",
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Findings</h1>
          <p className="text-muted-foreground mt-1">Review and manage security findings</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10 w-64"
            placeholder="Filter by severity or rule..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{findings.length === 0 ? "No findings yet. Run a scan to discover vulnerabilities." : "No findings match your filter."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <Card key={f.id} className={f.is_suppressed ? "opacity-50" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={severityColor[f.severity] || "default"}>{f.severity}</Badge>
                      <span className="text-sm font-mono text-muted-foreground">{f.rule_id}</span>
                      <Badge variant="secondary">{f.category}</Badge>
                      {f.is_suppressed && <Badge variant="outline">Suppressed</Badge>}
                    </div>
                    <p className="text-sm">{f.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {f.file_path}:{f.line}:{f.column}
                    </p>
                    {f.recommendation && (
                      <p className="text-xs text-accent mt-1">{f.recommendation}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSuppress(f.id, f.is_suppressed)}
                  >
                    {f.is_suppressed ? "Unsuppress" : "Suppress"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
