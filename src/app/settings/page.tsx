"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and organization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage your API access keys for CI/CD integration</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">API key management coming soon.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Manage your organization settings and members</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Organization settings coming soon.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GitHub Integration</CardTitle>
          <CardDescription>Connect your GitHub repositories for automated scanning</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">GitHub integration settings coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
