import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type FooterProps = {
  dict: Dictionary;
  locale: Locale;
};

export default function Footer({ dict, locale }: FooterProps) {
  // First section: FIFA - Links from home page header
  const fifaLinks = [
    { label: dict.nav.tournaments, href: `/${locale}/tournaments` },
    { label: dict.nav.matchCentre, href: `/${locale}/match-score` },
    { label: dict.nav.news, href: `/${locale}/news` },
    { label: dict.nav.rankings, href: `/${locale}/world-rankings` },
  ];

  // Second section: FIFA World Cup - Links from World Cup page header
  const worldCupLinks = [
    { label: "SCORES & FIXTURES", href: `/${locale}/tournaments/mens/football/worldcup2026/scores-fixtures` },
    { label: "STANDINGS", href: `/${locale}/tournaments/mens/football/worldcup2026/standings` },
    { label: "TEAMS", href: `/${locale}/tournaments/mens/football/worldcup2026/teams` },
    { label: "HOST COUNTRIES AND CITIES", href: `/${locale}/tournaments/mens/football/worldcup2026/host-cities` },
  ];

  return (
    <footer className="bg-navy-950 text-white mt-16 border-t border-white/10">
      <div className="container-main">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20">
            {/* First Section: FIFAA */}
            <div>
              <h4 className="font-display font-semibold mb-6 tracking-[0.08em] uppercase text-base text-white">
                FIFAA
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
                {fifaLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-all duration-200 text-sm leading-relaxed inline-block relative group"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-200 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Second Section: FIFA World Cup */}
            <div>
              <h4 className="font-display font-semibold mb-6 tracking-[0.08em] uppercase text-base text-white">
                FIFA WORLD CUP 2026
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
                {worldCupLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-all duration-200 text-sm leading-relaxed inline-block relative group"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-200 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="border-t border-white/10 py-8">
          <p className="text-white/50 text-xs tracking-wide">
            {dict.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
