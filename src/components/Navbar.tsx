import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Shield, TestTube } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, loading, login, logout, isAdmin } = useAuth();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if in offline admin mode
  const isOfflineAdmin = typeof window !== "undefined" && localStorage.getItem("admin-logged-in") === "true";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const NavigationLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const linkClass = mobile 
      ? "block px-3 py-2 text-base font-medium hover:bg-muted rounded-lg transition-colors" 
      : "text-sm font-medium hover:text-primary transition-colors";

    if (user) {
      return (
        <>
          <Link to="/dashboard" className={linkClass} onClick={mobile ? closeMobileMenu : undefined}>
            Dashboard
          </Link>
          <Link to="/submit" className={linkClass} onClick={mobile ? closeMobileMenu : undefined}>
            Submit
          </Link>
          <Link to="/queue" className={linkClass} onClick={mobile ? closeMobileMenu : undefined}>
            Queue
          </Link>
          <Link to="/points" className={linkClass} onClick={mobile ? closeMobileMenu : undefined}>
            Points
          </Link>
          <Link to="/analytics" className={linkClass} onClick={mobile ? closeMobileMenu : undefined}>
            Analytics
          </Link>

          {/* Admin-only links */}
          {(isAdmin || isOfflineAdmin) && (
            <>
              <div className={mobile ? "border-t pt-3 mt-3" : ""}>
                {mobile && <p className="text-sm font-medium text-muted-foreground mb-2">Admin Tools</p>}
              </div>
              <Link to="/admin/dashboard" className={linkClass} onClick={mobile ? closeMobileMenu : undefined}>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </div>
              </Link>
              <Link to="/admin/test" className={linkClass} onClick={mobile ? closeMobileMenu : undefined}>
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Test Suite
                </div>
              </Link>
            </>
          )}
        </>
      );
    }

    return (
      <>
        <Link to="/pricing" className={linkClass} onClick={mobile ? closeMobileMenu : undefined}>
          {t("nav.pricing")}
        </Link>
        <Link to="/demo" className={linkClass} onClick={mobile ? closeMobileMenu : undefined}>
          {t("nav.demo")}
        </Link>
      </>
    );
  };

  // Function to get user display info
  const getUserDisplayInfo = () => {
    if (isOfflineAdmin) {
      return {
        name: "Admin User",
        type: "Offline Admin",
        variant: "default" as const
      };
    }

    if (user?.user_metadata?.is_admin) {
      return {
        name: user.user_metadata.name || "Admin User",
        type: "Admin",
        variant: "default" as const
      };
    }

    if (user?.id === "demo-user") {
      return {
        name: "Demo User",
        type: "Demo Mode",
        variant: "secondary" as const
      };
    }

    return {
      name: user?.user_metadata?.name || user?.email || "User",
      type: "User",
      variant: "secondary" as const
    };
  };
  return (
    <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link to="/" className="text-lg sm:text-xl font-bold text-primary">
            EngagePods
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-6">
            <NavigationLinks />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Status Badge - Desktop & Tablet */}
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              {(isAdmin || isOfflineAdmin) && (
                <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              {user.id === "demo-user" && !isOfflineAdmin && (
                <Badge variant="secondary" className="text-xs">Demo</Badge>
              )}
            </div>
          )}

          {/* Theme & Language - Desktop Only */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {/* Login/Logout Button */}
          {loading ? (
            <div className="w-16 sm:w-20 h-8 sm:h-9 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <Button onClick={logout} variant="outline" size="sm" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">{t("nav.signout")}</span>
              <span className="sm:hidden">Logout</span>
            </Button>
          ) : (
            <Button onClick={login} size="sm" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">{t("nav.signin")}</span>
              <span className="sm:hidden">Login</span>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="sm" className="p-2">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-6 py-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-primary">EngagePods</h2>
                  {user && (
                    <div className="flex items-center gap-2">
                      {(isAdmin || isOfflineAdmin) && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {user.id === "demo-user" && !isOfflineAdmin && (
                        <Badge variant="secondary" className="text-xs">Demo</Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <NavigationLinks mobile />
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Settings</span>
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>

                {user && (
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          Connected as
                        </div>
                        <Badge 
                          variant={getUserDisplayInfo().variant}
                          className={`text-xs ${
                            (isAdmin || isOfflineAdmin) ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" : ""
                          }`}
                        >
                          {(isAdmin || isOfflineAdmin) && <Shield className="h-3 w-3 mr-1" />}
                          {getUserDisplayInfo().type}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-muted-foreground truncate">
                        {getUserDisplayInfo().name}
                      </div>
                      <Button 
                        onClick={() => { logout(); closeMobileMenu(); }} 
                        variant="outline" 
                        className="w-full"
                        size="sm"
                      >
                        Sign out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}