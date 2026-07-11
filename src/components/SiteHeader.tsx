import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo size={30} />
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          NM Tax Appeals
        </span>
        <span className="hidden text-xs text-ink-faint sm:inline">
          Bernalillo County
        </span>
      </Link>
      <nav className="flex items-center gap-5 text-sm">
        <Link href="/how-it-works" className="hidden text-ink-soft hover:text-ink sm:inline">
          How it works
        </Link>
        <Link href="/resources" className="hidden text-ink-soft hover:text-ink sm:inline">
          Resources
        </Link>
        {cta && (
          <Link href="/intake" className="btn-primary">
            Start an appeal
          </Link>
        )}
      </nav>
    </header>
  );
}
