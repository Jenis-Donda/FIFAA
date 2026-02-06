"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type WorldCupSidebarProps = {
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

function WorldCupLogo() {
  return (
    <img
      src="https://digitalhub.fifa.com/transform/157d23bf-7e13-4d7b-949e-5d27d340987e/WC26_Logo?&io=transform:fill,height:210&quality=75"
      alt="FIFA World Cup 2026™"
      className="h-10 w-auto"
    />
  );
}

export default function WorldCupSidebar({ isOpen, onClose, locale, dict }: WorldCupSidebarProps) {
  const [showLanguages, setShowLanguages] = useState(false);
  const router = useRouter();

  const navItems = [
    { label: "SCORES & FIXTURES", href: `/${locale}/tournaments/mens/football/worldcup2026/scores-fixtures` },
    { label: "STANDINGS", href: `/${locale}/tournaments/mens/football/worldcup2026/standings` },
    { label: "TEAMS", href: `/${locale}/tournaments/mens/football/worldcup2026/teams` },
    { label: "HOST COUNTRIES AND CITIES", href: `/${locale}/tournaments/mens/football/worldcup2026/host-cities` },
  ];

  const handleLanguageChange = (newLocale: Locale) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[200] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-[201] w-80 bg-black flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <WorldCupLogo />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="block px-6 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:bg-white/10 transition-colors border-b border-white/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Language Selector */}
        <div className="border-t border-white/10 mt-auto">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="w-full px-6 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <span>Language</span>
            <svg
              className={`w-5 h-5 transition-transform ${showLanguages ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showLanguages && (
            <div className="bg-white/5">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLanguageChange(loc)}
                  className={`w-full px-8 py-3 text-sm text-left transition-colors ${
                    loc === locale
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {localeNames[loc]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}