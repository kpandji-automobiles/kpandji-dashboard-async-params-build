"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { SignInButtonWithFallback } from "./SignInButtonWithFallback";
import { Button } from "./ui/button";
import { MenuIcon, Settings } from "lucide-react";
import Image from "next/image";
import FloatingNotifications from "./FloatingNotifications";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SETTINGS_SECTIONS = new Set([
  "admin",
  "assistante",
  "chefequipe",
  "chefusine",
  "commercial",
  "communication",
  "communityManager",
  "comptable",
  "designer",
  "finance",
  "infographie",
  "juridique",
  "magasinier",
  "manager",
  "marketing",
  "responsablecommercial",
  "rh",
  "sav",
  "superviseur",
]);

const Header = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const section = pathname.split("/")[1];
  const homeHref = SETTINGS_SECTIONS.has(section) ? `/${section}` : "/";
  const settingsHref = SETTINGS_SECTIONS.has(section)
    ? `/${section}/parametres`
    : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Logo and Menu */}
          <div className="flex items-center gap-4">
            {toggleSidebar && (
              <button
                onClick={toggleSidebar}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 h-9 w-9"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </button>
            )}

            <Link
              href={homeHref}
              className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Retour à la page principale"
            >
              <Image
                src="/LogoKpandjiNoir.svg"
                alt="Logo Kpandji"
                width={64}
                height={49}
                className="h-12 w-auto shrink-0 object-contain"
                priority
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  Kpandji Management
                </h1>
                <p className="text-xs text-gray-500">Board de gestion</p>
              </div>
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Right Section - User Info and Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}

            <FloatingNotifications placement="header" />

            {/* Settings */}
            {settingsHref && (
              <Link
                href={settingsHref}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Paramètres"
              >
                <Settings className="h-5 w-5" />
              </Link>
            )}

            {/* User Welcome Message */}
            <div className="hidden sm:block text-right">
              {mounted && isLoaded && user ? (
                <>
                  <p className="text-sm font-medium text-gray-900">
                    Bienvenue, {user.firstName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </>
              ) : (
                <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
              )}
            </div>

            {/* User Authentication — mount after hydration to avoid Clerk UserButton SSR mismatch */}
            <div className="ml-2 flex h-8 min-w-8 items-center justify-center">
              {!mounted ? (
                <div
                  className="h-8 w-8 shrink-0 rounded-full bg-gray-100 animate-pulse"
                  aria-hidden
                />
              ) : (
                <>
                  <SignedIn>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8",
                        },
                      }}
                    />
                  </SignedIn>
                  <SignedOut>
                    <Button size="sm" variant="outline" asChild>
                      <SignInButtonWithFallback href="/sign-in">
                        Se connecter
                      </SignInButtonWithFallback>
                    </Button>
                  </SignedOut>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
