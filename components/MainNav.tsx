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
    { label: dict.nav.matchCentre, href: `/${locale}/match-score`, hasDropdown: false },
    { label: dict.nav.news, href: `/${locale}/news`, hasDropdown: false },
    { label: dict.nav.rankings, href: `/${locale}/world-rankings`, hasDropdown: false },
  ];

  const tournamentSubNavItems = [
    { label: dict.sidebar.overview, href: `/${locale}/tournaments` },
    { label: "FIFA WORLD CUP 2026™", href: `/${locale}/tournaments/mens/football/worldcup2026` },
  ];

  return (
    <>
      <div className="relative">
        <div className="bg-fifa-header text-white sticky top-0 z-[100] w-full shadow-md">
          {/* Main Navigation Bar */}
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 max-w-full">
            {/* Left section: Hamburger + Logo */}
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 text-white cursor-pointer rounded-md transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
                aria-label={dict.nav.openMenu}
              >
                <HamburgerIcon />
              </button>
              <Link href={`/${locale}`} className="flex items-center h-full [&_svg]:h-8 [&_svg]:w-auto sm:[&_svg]:h-9 transition-opacity duration-200 hover:opacity-90" aria-label="FIFAA Home">
                <FIFALogo />
              </Link>
            </div>

            {/* Center: Navigation links */}
            <nav className="hidden lg:flex items-center h-full ml-4 xl:ml-10 flex-1 relative" aria-label="Primary navigation">
              {navItems.map((item) => {
                if (item.hasDropdown && item.label === dict.nav.tournaments) {
                  return (
                    <div
                      key={item.label}
                      onMouseEnter={() => setTournamentsOpen(true)}
                      onMouseLeave={() => setTournamentsOpen(false)}
                      className="relative"
                    >
                      <a
                        href={item.href}
                        className={`relative flex items-center h-16 px-3 xl:px-5 text-xs xl:text-sm font-semibold tracking-wide uppercase text-white transition-all duration-200 whitespace-nowrap hover:bg-fifa-header-hover after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[3px] after:bg-white after:transition-all after:duration-200 hover:after:w-3/4 ${
                          tournamentsOpen ? "bg-fifa-header-hover after:w-3/4" : ""
                        }`}
                      >
                        {item.label}
                      </a>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="relative flex items-center h-16 px-3 xl:px-5 text-xs xl:text-sm font-semibold tracking-wide uppercase text-white transition-all duration-200 whitespace-nowrap hover:bg-fifa-header-hover after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[3px] after:bg-white after:transition-all after:duration-200 hover:after:w-3/4"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right section: Language */}
            <div className="flex items-center gap-2 shrink-0">
              <LanguageDropdown currentLocale={locale} />
            </div>
          </div>
        </div>

        {/* Full-width Sub-header Bar for Tournaments - Absolutely positioned overlay */}
        {tournamentsOpen && (
          <div
            ref={tournamentsRef}
            onMouseEnter={() => setTournamentsOpen(true)}
            onMouseLeave={() => setTournamentsOpen(false)}
            className="absolute top-16 left-0 right-0 w-full bg-surface-100 border-t border-gray-200 shadow-lg z-[101]"
          >
            <div className="container-main">
              <nav className="flex items-center h-14 gap-8" aria-label="Tournaments sub-navigation">
                {tournamentSubNavItems.map((subItem) => (
                  <Link
                    key={subItem.label}
                    href={subItem.href}
                    onClick={() => setTournamentsOpen(false)}
                    className="text-sm font-medium text-navy-900 uppercase tracking-wide hover:text-brand-blue transition-colors duration-200 whitespace-nowrap"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} locale={locale} dict={dict} />
    </>
  );
}
