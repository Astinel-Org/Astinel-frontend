"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Notification } from "@/types";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get<Notification[]>("/v1/notifications")
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    try {
      await api.post(`/v1/notifications/${id}/read`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/v1/notifications/read-all");
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const severityColor: Record<string, "info" | "medium" | "destructive" | "success"> = {
    info: "info", warning: "medium", error: "destructive", success: "success",
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">System alerts and events</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.is_read ? "opacity-60" : "border-primary/30"}>
              <CardContent className="p-5 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <Badge variant={(severityColor[n.severity] || "secondary") as "info" | "medium" | "destructive" | "success" | "secondary"}>{n.event_type}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                    Mark Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
