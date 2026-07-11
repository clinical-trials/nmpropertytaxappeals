"use client";

import Link from "next/link";
import { Logo } from "./Logo";

export function AdminBar() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }
  return (
    <header className="border-b border-ink/10 bg-white/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo size={24} />
          <span className="font-display text-base font-semibold text-ink">
            NM Tax Appeals
          </span>
          <span className="text-xs text-ink-faint">back office</span>
        </Link>
        <button onClick={logout} className="text-sm text-ink-soft hover:text-ink">
          Sign out
        </button>
      </div>
    </header>
  );
}
