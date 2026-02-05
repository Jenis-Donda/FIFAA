"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import LanguageDropdown from "@/components/LanguageDropdown";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = { locale: Locale; dict: Dictionary };

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
        <img
            decoding="async"
            loading="lazy"
            src="https://digitalhub.fifa.com/transform/157d23bf-7e13-4d7b-949e-5d27d340987e/WC26_Logo?&io=transform:fill,height:210&quality=75"
            alt="FIFA"
            title="FIFA World Cup 2026™"
            style={{ height: 50, width: "auto", display: "block" }}
            className="image_img__pNjkh global-menu-top-nav_fifaLogoVertical__Wjbxc global-menu-top-nav_headerMobileVerticalLogo__NnR2S"
        />
    );
}

export default function WorldCupHeader({ locale, dict }: Props) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { label: "SCORES & FIXTURES", href: `/${locale}/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures` },
        {
            label: "STANDINGS",
            href: `/${locale}/tournaments/mens/worldcup/canadamexicousa2026/standings`
        },
        { label: "TEAMS", href: `/${locale}/tournaments/mens/worldcup/canadamexicousa2026/teams` },
        { label: "HOST COUNTRIES AND CITIES", href: `/${locale}/tournaments/mens/worldcup/canadamexicousa2026/host-cities` },
    ];

    return (
        <header>
            {/* Top thin black utility bar */}
            <div className="bg-black text-white h-9 flex items-center justify-between w-full">
                <div className="pl-4">
                    <Link href={`/${locale}/tournaments/mens/worldcup/canadamexicousa2026`} className="flex items-center h-full [&_svg]:h-5 [&_svg]:w-auto">
                        <svg width="100" height="20" viewBox="0 0 90 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <text x="0" y="14" fill="white" fontFamily="Arial Black, sans-serif" fontSize="14" fontWeight="900" letterSpacing="0.5">FIFAA</text>
                        </svg>
                    </Link>
                </div>
                <nav className="flex items-center h-full pr-6" aria-label="Utility navigation">
                    <Link href={`/${locale}/tickets`} className="flex items-center h-full px-4 text-xs font-medium tracking-wider uppercase text-white/90 hover:text-white">
                        {dict.nav.ticketsHospitality}
                    </Link>
                    <Link href="https://www.plus.fifa.com" className="flex items-center h-full px-4 text-xs font-medium tracking-wider uppercase text-white/90 hover:text-white">
                        {dict.nav.fifaPlus}
                    </Link>
                    <Link href="https://store.fifa.com" className="flex items-center h-full px-4 text-xs font-medium tracking-wider uppercase text-white/90 hover:text-white">
                        {dict.nav.fifaStore}
                    </Link>
                </nav>
            </div>

            {/* Divider between top utility bar and main nav */}
            <div className="w-full h-px bg-white" />

            {/* Main black nav */}
            <div className="bg-black text-white h-16 sticky top-0 z-[100] w-full shadow-md">
                <div className="flex items-center justify-between h-full px-6 max-w-full">
                    <div className="flex items-center gap-5 shrink-0">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex items-center justify-center w-11 h-11 text-white cursor-pointer rounded-md transition-all duration-200 hover:bg-white/5"
                            aria-label={dict.nav.openMenu}
                        >
                            <HamburgerIcon />
                        </button>

                        <Link href={`/${locale}/tournaments/mens/worldcup/canadamexicousa2026`} className="flex items-center h-full [&_svg]:h-9 [&_svg]:w-auto transition-opacity duration-200 hover:opacity-90" aria-label="FIFA Home">
                            <FIFALogo />
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center h-full ml-10 flex-1" aria-label="Primary navigation">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="relative flex items-center h-16 px-5 text-sm font-semibold tracking-wide uppercase text-white transition-all duration-200 whitespace-nowrap hover:text-gray-200"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 shrink-0">
                        <LanguageDropdown currentLocale={locale} />
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5" />
                                <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} locale={locale} dict={dict} />
        </header>
    );
}