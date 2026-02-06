"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Loader from "./Loader";

export default function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathnameRef = useRef<string | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect pathname changes (Next.js navigation)
  useEffect(() => {
    // If pathname changed, show loader briefly then hide
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      setIsLoading(true);
      
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Hide loader after a short delay (page should be loaded by then)
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
    
    prevPathnameRef.current = pathname;
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [pathname]);

  // Detect searchParams changes
  useEffect(() => {
    if (prevPathnameRef.current !== null) {
      setIsLoading(true);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [searchParams]);

  useEffect(() => {
    // Handle link clicks for internal navigation
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Only show loader for internal navigation (same origin, different path)
        if (
          url.origin === currentUrl.origin && 
          url.pathname !== currentUrl.pathname &&
          !link.hasAttribute("target") // Don't show for external links
        ) {
          setIsLoading(true);
          
          // Clear any existing timeout
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          
          // Hide loader after navigation completes or timeout
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        }
      }
    };

    // Handle browser back/forward navigation
    const handlePopState = () => {
      setIsLoading(true);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("popstate", handlePopState);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  if (!isLoading) return null;

  return <Loader />;
}

