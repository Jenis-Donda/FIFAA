"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import LanguageDropdown from "./LanguageDropdown";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type MainNavProps = {
  locale: Locale;
  dict: Dictionary;
};

function HamburgerIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FIFALogo() {
  return (
    <svg width="150" height="36" viewBox="0 0 90 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="30" fill="white" fontFamily="Arial Black, sans-serif" fontSize="32" fontWeight="900" letterSpacing="1">FIFAA</text>
    </svg>
  );
}

export default function MainNav({ locale, dict }: MainNavProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tournamentsOpen, setTournamentsOpen] = useState(false);
  const tournamentsRef = useRef<HTMLDivElement | null>(null);
  // attach outside click handler to tournamentsRef
  useEffect(() => {
    const el = tournamentsRef.current;
    if (!el) return;

    const onDocClick = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) {
        setTournamentsOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [tournamentsRef]);

  const navItems = [
    { label: dict.nav.tournaments, href: `/${locale}/tournaments`, hasDropdown: true },
    { label: dict.nav.matchCentre, href: `/${locale}/match-centre`, hasDropdown: false },
    { label: dict.nav.news, href: `/${locale}/news`, hasDropdown: false },
    { label: dict.nav.rankings, href: `/${locale}/world-rankings`, hasDropdown: false },
    { label: dict.nav.watchOnFifa, href: "#", hasDropdown: true },
    { label: dict.nav.play, href: "#", hasDropdown: true },
    { label: dict.nav.shop, href: "#", hasDropdown: true },
    { label: dict.nav.insideFifa, href: "#", hasDropdown: true },
  ];

  return (
    <>
      <div className="bg-fifa-header text-white h-16 sticky top-0 z-[100] w-full shadow-md">
        <div className="flex items-center justify-between h-full px-6 max-w-full">
          {/* Left section: Hamburger + Logo */}
          <div className="flex items-center gap-5 shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center justify-center w-11 h-11 text-white cursor-pointer rounded-md transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
              aria-label={dict.nav.openMenu}
            >
              <HamburgerIcon />
            </button>
            <Link href={`/${locale}`} className="flex items-center h-full [&_svg]:h-9 [&_svg]:w-auto transition-opacity duration-200 hover:opacity-90" aria-label="FIFA Home">
              <FIFALogo />
            </Link>
          </div>

          {/* Center: Navigation links */}
          <nav className="hidden lg:flex items-center h-full ml-10 flex-1 relative" aria-label="Primary navigation">
            {navItems.map((item) => {
              if (item.hasDropdown && item.label === dict.nav.tournaments) {
                return (
                  <div
                    key={item.label}
                    ref={tournamentsRef}
                    onMouseEnter={() => setTournamentsOpen(true)}
                    className="relative"
                  >
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setTournamentsOpen((s) => !s);
                      }}
                      className="relative flex items-center h-16 px-5 text-sm font-semibold tracking-wide uppercase text-white transition-all duration-200 whitespace-nowrap hover:bg-fifa-header-hover after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[3px] after:bg-white after:transition-all after:duration-200 hover:after:w-3/4"
                    >
                      {item.label}
                    </a>

                    {/* Child navbar that appears below */}
                    {tournamentsOpen && (
                      <div className="absolute left-0 right-0 top-full mt-0 bg-surface-100 z-40 border-t border-gray-200">
                        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="h-14 flex items-center">
                            <Link href={`/${locale}/tournaments/mens/worldcup/canadamexicousa2026`} onClick={() => setTournamentsOpen(false)} className="text-sm font-medium text-navy-900 uppercase">
                              FIFA WORLD CUP 2026™
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative flex items-center h-16 px-5 text-sm font-semibold tracking-wide uppercase text-white transition-all duration-200 whitespace-nowrap hover:bg-fifa-header-hover after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[3px] after:bg-white after:transition-all after:duration-200 hover:after:w-3/4"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right section: Language & Account */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageDropdown currentLocale={locale} />
            <button
              className="flex items-center justify-center w-11 h-11 text-white cursor-pointer rounded-md transition-all duration-200 hover:bg-white/15 hover:scale-105 active:scale-95"
              aria-label={dict.nav.myAccount}
            >
              <UserIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} locale={locale} dict={dict} />
    </>
  );
}

// Close tournaments dropdown when clicking outside
// (placed after component to ensure hooks in top-level component remain valid)
function useOutsideClick(ref: React.RefObject<HTMLElement> | null, handler: () => void, when = true) {
  useEffect(() => {
    if (!when || !ref) return;
    const el = ref.current;
    if (!el) return;

    const onDocClick = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [ref, handler, when]);
}
