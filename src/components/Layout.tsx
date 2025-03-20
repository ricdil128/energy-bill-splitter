
import { Link, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, History, LayoutDashboard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import UserMenu from "./UserMenu";

const navItems = [
  {
    title: "Home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Cronologia",
    href: "/history",
    icon: <History className="h-5 w-5" />,
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const mobile = useIsMobile();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Link to="/">
              <span className="hidden sm:inline-block">
                Ripartizione
              </span>{" "}
              Bollette
            </Link>
          </div>

          {mobile ? (
            <div className="flex items-center gap-2">
              <UserMenu />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="grid gap-2 py-6">
                    {navItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 font-medium hover:text-primary",
                          location.pathname === item.href
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-2">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 font-medium hover:text-primary",
                      location.pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>
              <Separator orientation="vertical" className="h-6" />
              <UserMenu />
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

function Menu(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
