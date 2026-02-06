"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  dict: Dictionary;
};

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FIFALogo() {
  return (
    <svg width="100" height="32" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="26" fill="white" fontFamily="Arial Black, sans-serif" fontSize="28" fontWeight="900" letterSpacing="1">FIFAA</text>
    </svg>
  );
}

type SubmenuItem = {
  label: string;
  href?: string;
  isHeader?: boolean;
};

export default function Sidebar({ isOpen, onClose, locale, dict }: SidebarProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>("TOURNAMENTS");
  const [showLanguages, setShowLanguages] = useState(false);
  const router = useRouter();

  const mainNavItems = [
    { label: dict.nav.tournaments, href: `/${locale}/tournaments`, hasSubmenu: true, key: "TOURNAMENTS" },
    { label: dict.nav.matchCentre, href: `/${locale}/match-score`, hasSubmenu: false },
    { label: dict.nav.news, href: `/${locale}/news`, hasSubmenu: false },
    { label: dict.nav.rankings, href: `/${locale}/world-rankings`, hasSubmenu: false },
  ];

  // All submenu data
  const submenus: Record<string, SubmenuItem[]> = {
    TOURNAMENTS: [
      { label: dict.sidebar.overview, href: `/${locale}/tournaments` },
      { label: dict.sidebar.upcomingTournaments, isHeader: true },
      { label: "FIFA WORLD CUP 2026™", href: `/${locale}/tournaments/mens/worldcup/canadamexicousa2026` },
    ],
    WATCH: [
      { label: "OVERVIEW", href: "https://www.plus.fifa.com" },
      { label: "LIVE & UPCOMING", isHeader: true },
      { label: "LIVE MATCHES", href: "https://www.plus.fifa.com/live" },
      { label: "MATCH SCHEDULE", href: "https://www.plus.fifa.com/schedule" },
      { label: "ON DEMAND", isHeader: true },
      { label: "FULL MATCH REPLAYS", href: "https://www.plus.fifa.com/replays" },
      { label: "HIGHLIGHTS", href: "https://www.plus.fifa.com/highlights" },
      { label: "GOALS", href: "https://www.plus.fifa.com/goals" },
      { label: "CLASSIC MATCHES", href: "https://www.plus.fifa.com/classics" },
      { label: "ORIGINALS", isHeader: true },
      { label: "DOCUMENTARIES", href: "https://www.plus.fifa.com/documentaries" },
      { label: "SERIES", href: "https://www.plus.fifa.com/series" },
      { label: "FILMS", href: "https://www.plus.fifa.com/films" },
      { label: "PODCASTS", href: "https://www.plus.fifa.com/podcasts" },
    ],
    PLAY: [
      { label: "OVERVIEW", href: `/${locale}/play` },
      { label: "GAMES", isHeader: true },
      { label: "EA SPORTS FC™", href: "https://www.ea.com/games/ea-sports-fc" },
      { label: "FIFA MOBILE", href: `/${locale}/play/fifa-mobile` },
      { label: "FIFA ESPORTS", href: `/${locale}/play/esports` },
      { label: "COMMUNITY", isHeader: true },
      { label: "GRASSROOTS", href: `/${locale}/play/grassroots` },
      { label: "FOOTBALL FOR SCHOOLS", href: `/${locale}/play/football-for-schools` },
      { label: "FIFA FOUNDATION", href: `/${locale}/play/foundation` },
      { label: "EVENTS", isHeader: true },
      { label: "FIFE WORLD CUP™", href: `/${locale}/play/fife` },
      { label: "TOURNAMENT PREDICTOR", href: `/${locale}/play/predictor` },
      { label: "FANTASY", href: `/${locale}/play/fantasy` },
    ],
    SHOP: [
      { label: "OVERVIEW", href: "https://store.fifa.com" },
      { label: "COLLECTIONS", isHeader: true },
      { label: "FIFA WORLD CUP 2026™", href: "https://store.fifa.com/collections/world-cup-2026" },
      { label: "FIFA WOMEN'S WORLD CUP", href: "https://store.fifa.com/collections/womens-world-cup" },
      { label: "FIFA CLUB WORLD CUP", href: "https://store.fifa.com/collections/club-world-cup" },
      { label: "CATEGORIES", isHeader: true },
      { label: "JERSEYS & APPAREL", href: "https://store.fifa.com/collections/apparel" },
      { label: "ACCESSORIES", href: "https://store.fifa.com/collections/accessories" },
      { label: "COLLECTIBLES", href: "https://store.fifa.com/collections/collectibles" },
      { label: "HOME & OFFICE", href: "https://store.fifa.com/collections/home" },
      { label: "GIFTS", href: "https://store.fifa.com/collections/gifts" },
      { label: "SALE", href: "https://store.fifa.com/collections/sale" },
      { label: "OTHER STORES", isHeader: true },
      { label: "FIFA COLLECT", href: "https://collect.fifa.com" },
    ],
    INSIDE: [
      { label: "OVERVIEW", href: "https://inside.fifa.com" },
      { label: "ABOUT FIFA", isHeader: true },
      { label: "WHAT WE DO", href: "https://inside.fifa.com/about-fifa" },
      { label: "FIFA PRESIDENT", href: "https://inside.fifa.com/president" },
      { label: "FIFA COUNCIL", href: "https://inside.fifa.com/council" },
      { label: "ASSOCIATIONS", href: "https://inside.fifa.com/associations" },
      { label: "GOVERNANCE", isHeader: true },
      { label: "STATUTES & REGULATIONS", href: "https://inside.fifa.com/legal/statutes" },
      { label: "LEGAL", href: "https://inside.fifa.com/legal" },
      { label: "INTEGRITY", href: "https://inside.fifa.com/integrity" },
      { label: "SUSTAINABILITY", href: "https://inside.fifa.com/sustainability" },
      { label: "SOCIAL IMPACT", isHeader: true },
      { label: "WOMEN'S FOOTBALL", href: "https://inside.fifa.com/womens-football" },
      { label: "FIFA FOUNDATION", href: "https://inside.fifa.com/foundation" },
      { label: "DEVELOPMENT", href: "https://inside.fifa.com/development" },
      { label: "MEDIA & CAREERS", isHeader: true },
      { label: "MEDIA RELEASES", href: "https://inside.fifa.com/media-releases" },
      { label: "CAREERS", href: "https://inside.fifa.com/careers" },
    ],
  };

  const handleLanguageChange = (newLocale: Locale) => {
    router.push(`/${newLocale}`);
    onClose();
  };

  const handleMouseEnter = (key: string | undefined) => {
    if (key) {
      setActiveSubmenu(key);
      setShowLanguages(false);
    }
  };

  const handleLanguagesHover = () => {
    setShowLanguages(true);
    setActiveSubmenu(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[200] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className="fixed inset-y-0 left-0 z-[201] flex max-w-full">
        {/* Main Sidebar */}
        <div className="w-72 bg-fifa-header flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-4 p-5 border-b border-white/10">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={dict.nav.closeMenu}
            >
              <CloseIcon />
            </button>
            <FIFALogo />
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 py-2">
            {mainNavItems.map((item) => (
              <div key={item.label}>
                {item.hasSubmenu ? (
                  <button
                    onMouseEnter={() => handleMouseEnter(item.key)}
                    onClick={() => {
                      if (item.href && item.href !== "#") {
                        router.push(item.href);
                        onClose();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-6 py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors ${activeSubmenu === item.key
                        ? "bg-white/10 text-white"
                        : "text-white/90 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    {item.label}
                    <ChevronRight />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    onMouseEnter={() => {
                      setActiveSubmenu(null);
                      setShowLanguages(false);
                    }}
                    className="flex items-center justify-between px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white/90 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Preferences Section */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                {dict.sidebar.preferences}
              </div>
              <button
                onMouseEnter={handleLanguagesHover}
                className={`w-full flex items-center justify-between px-6 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors ${showLanguages
                    ? "bg-white/10 text-white"
                    : "text-white/90 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {dict.sidebar.languages}
                <ChevronRight />
              </button>
            </div>
          </nav>
        </div>

        {/* Submenu Panel */}
        {(activeSubmenu || showLanguages) && (
          <div className="w-80 bg-gray-100 h-full overflow-y-auto shadow-lg">
            <div className="py-4">
              {showLanguages ? (
                // Language Selection
                locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleLanguageChange(loc)}
                    className={`block w-full text-left px-6 py-3 text-sm font-medium uppercase tracking-wide transition-colors ${locale === loc
                        ? "text-blue-500 bg-blue-50"
                        : "text-navy-900 hover:bg-gray-200"
                      }`}
                  >
                    {localeNames[loc]}
                  </button>
                ))
              ) : activeSubmenu && submenus[activeSubmenu] ? (
                submenus[activeSubmenu].map((item, index) =>
                  item.isHeader ? (
                    <div
                      key={index}
                      className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 mt-4 first:mt-0"
                    >
                      {item.label}
                    </div>
                  ) : (
                    <Link
                      key={index}
                      href={item.href || "#"}
                      onClick={onClose}
                      className="block px-6 py-2.5 text-sm font-medium uppercase tracking-wide text-navy-900 hover:bg-gray-200 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )
                )
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
