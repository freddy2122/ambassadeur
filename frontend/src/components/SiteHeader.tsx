"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useClientTokenSnapshot } from "@/lib/useClientTokenSnapshot";

const navLinks = [
  { href: "/#comment", label: "Comment ça marche" },
  { href: "/#recompenses", label: "Récompenses" },
  { href: "/formations", label: "Formations" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { hasToken: isAuthenticated } = useClientTokenSnapshot();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/eig-logo.svg" alt="EIG Ambassadors" width={108} height={35} priority />
        </Link>

        <div className="hidden items-center gap-5 text-sm font-medium text-slate-700 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-eig-blue">
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <>
              <Link
                href="/partenaires/inscription"
                className="rounded-xl bg-eig-blue px-4 py-2 text-white transition-colors hover:bg-eig-blue-light"
              >
                S&apos;inscrire
              </Link>
              <Link
                href="/connexion"
                className="rounded-xl border border-slate-300 px-4 py-2 transition-colors hover:border-eig-blue hover:text-eig-blue"
              >
                Se connecter
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="rounded-xl bg-eig-blue px-4 py-2 text-white transition-colors hover:bg-eig-blue-light"
            >
              Mon espace
            </Link>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Ouvrir le menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  href="/partenaires/inscription"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-eig-blue px-4 py-2 text-center text-white"
                >
                  Devenir Ambassadeur
                </Link>
                <Link
                  href="/connexion"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-center"
                >
                  Se connecter
                </Link>
              </div>
            ) : (
              <div className="mt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full justify-center rounded-xl bg-eig-blue px-4 py-2 text-white"
                >
                  Mon espace
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
