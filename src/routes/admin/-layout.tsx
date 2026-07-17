import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  LogOut,
  Sun,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/lib/api/admin";

interface AdminLayoutProps {
  children: ReactNode;
  admin: AdminUser | null;
  onLogout: () => void;
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminLayout({ children, admin, onLogout }: AdminLayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2 group">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[image:var(--gradient-sun)] shadow-[var(--shadow-glow)] group-hover:scale-105 transition">
              <Sun className="size-4 text-[color:var(--sun-foreground)]" />
            </span>
            <span className="font-bold tracking-tight text-foreground text-sm">
              Satom <span className="text-primary">Admin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          {admin && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{admin.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 justify-start text-muted-foreground hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="size-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[image:var(--gradient-sun)] shadow-[var(--shadow-glow)]">
              <Sun className="size-4 text-[color:var(--sun-foreground)]" />
            </span>
            <span className="font-bold text-sm">Admin</span>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`p-2 rounded-lg transition-colors ${
                  isActive(item.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="size-4" />
              </Link>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={onLogout}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}