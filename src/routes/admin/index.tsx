import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  ArrowRight,
  Loader2,
  Wrench,
  Ban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getStoredToken, getMe, logout, type DashboardStats, type AdminUser } from "@/lib/api/admin";
import { AdminLayout } from "./-layout";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getStoredToken()) {
      navigate({ to: "/admin/login" });
      return;
    }

    const load = async () => {
      try {
        const [adminData, statsData] = await Promise.all([
          getMe(),
          getDashboardStats(),
        ]);
        setAdmin(adminData);
        setStats(statsData);
      } catch (err: any) {
        setError(err.message);
        if (err.message.includes("401") || err.message.includes("Could not validate")) {
          logout();
          navigate({ to: "/admin/login" });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login" });
  };

  if (loading) {
    return (
      <AdminLayout admin={null} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout admin={null} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate({ to: "/admin/login" })}>
              Go to Login
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats?.total_orders ?? 0,
      icon: Package,
      color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950",
    },
    {
      title: "Total Revenue",
      value: `₦${(stats?.total_revenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950",
    },
    {
      title: "Pending",
      value: stats?.pending_orders ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950",
    },
    {
      title: "Confirmed",
      value: stats?.confirmed_orders ?? 0,
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950",
    },
    {
      title: "In Progress",
      value: stats?.in_progress_orders ?? 0,
      icon: Wrench,
      color: "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950",
    },
    {
      title: "Completed",
      value: stats?.completed_orders ?? 0,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950",
    },
    {
      title: "Cancelled",
      value: stats?.cancelled_orders ?? 0,
      icon: Ban,
      color: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950",
    },
    {
      title: "Total Customers",
      value: stats?.total_customers ?? 0,
      icon: Users,
      color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950",
    },
  ];

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {admin?.full_name || "Admin"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <Card key={card.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${card.color}`}>
                  <card.icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and manage all customer service requests. Update order status and pricing.
              </p>
              <Button asChild variant="default">
                <Link to="/admin/orders">
                  View Orders <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse customer profiles and their order history.
              </p>
              <Button asChild variant="default">
                <Link to="/admin/customers">
                  View Customers <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}