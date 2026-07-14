import Link from "next/link";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-8 text-center max-w-lg">
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Astinel</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Enterprise-grade security scanning platform for Stellar Soroban smart contracts.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-muted"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
