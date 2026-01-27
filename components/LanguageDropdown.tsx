"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

type LanguageDropdownProps = {
  currentLocale: Locale;
};

function GlobeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3C12 3 7 7 7 12C7 17 12 21 12 21" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3C12 3 17 7 17 12C17 17 12 21 12 21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function LanguageDropdown({ currentLocale }: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLanguageChange = (newLocale: Locale) => {
    // Replace the current locale in the pathname with the new one
    const segments = pathname.split("/");
    segments[1] = newLocale; // The locale is always the first segment after /
    const newPath = segments.join("/") || `/${newLocale}`;
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-11 h-11 text-white cursor-pointer rounded-md transition-all duration-200 hover:bg-white/15 hover:scale-105 active:scale-95"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <GlobeIcon />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-fifa-header rounded-lg shadow-xl border border-white/10 overflow-hidden z-[150]">
          <ul role="listbox" aria-label="Select language" className="py-2">
            {locales.map((locale) => (
              <li key={locale}>
                <button
                  onClick={() => handleLanguageChange(locale)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    currentLocale === locale
                      ? "text-blue-400 bg-white/5 font-semibold"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                  role="option"
                  aria-selected={currentLocale === locale}
                >
                  {localeNames[locale]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
