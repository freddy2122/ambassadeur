"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Home, Phone } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(12);
    }
  };

  const items = [
    { href: "/", label: "Accueil", icon: Home, active: pathname === "/" },
    { href: "/formations", label: "Formations", icon: GraduationCap, active: pathname.startsWith("/formations") },
    { href: "/contact", label: "Contact", icon: Phone, active: pathname.startsWith("/contact") },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="grid grid-cols-3 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-[0_8px_30px_rgba(11,46,122,0.16)] backdrop-blur">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={triggerHaptic}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-all duration-250 active:scale-95 ${
                  item.active ? "text-[#0b2e7a]" : "text-slate-600"
                }`}
              >
                <Icon size={16} className={`transition-transform duration-250 ${item.active ? "scale-110" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
