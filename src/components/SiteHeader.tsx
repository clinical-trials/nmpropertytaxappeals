import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5">
      <Link href="/" className="flex items-center gap-2">
        <Logo size={28} />
        <span className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
          NM Tax Appeals
        </span>
        <span className="hidden text-xs text-ink-faint sm:inline">
          New Mexico
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm sm:gap-5">
        <Link href="/how-it-works" className="hidden text-ink-soft hover:text-ink sm:inline">
          How it works
        </Link>
        <Link href="/resources" className="hidden text-ink-soft hover:text-ink sm:inline">
          Resources
        </Link>
        {cta && (
          <Link href="/intake" className="btn-primary whitespace-nowrap px-4 py-2 text-sm">
            Start an appeal
          </Link>
        )}
      </nav>
    </header>
  );
}
