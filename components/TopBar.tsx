import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type TopBarProps = {
  locale: Locale;
  dict: Dictionary;
};

export default function TopBar({ locale, dict }: TopBarProps) {
  const links = [
    { label: dict.nav.ticketsHospitality, href: `/${locale}/tickets` },
    { label: dict.nav.fifaPlus, href: "https://www.plus.fifa.com" },
    { label: dict.nav.fifaStore, href: "https://store.fifa.com" },
    { label: dict.nav.fifaCollect, href: "https://collect.fifa.com" },
    { label: "INSIDE FIFA", href: "https://inside.fifa.com" },
  ];

  return (
    <div className="bg-fifa-topbar text-white h-10 flex items-center justify-end w-full">
      <nav className="flex items-center h-full pr-6" aria-label="Utility navigation">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="flex items-center h-full px-5 text-xs font-medium tracking-wider uppercase text-white/90 transition-all duration-200 whitespace-nowrap hover:bg-white/15 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
