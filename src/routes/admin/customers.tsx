import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCustomers,
  getStoredToken,
  logout,
  type Customer,
  type AdminUser,
} from "@/lib/api/admin";
import { getMe } from "@/lib/api/admin";
import { AdminLayout } from "./-layout";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (!getStoredToken()) {
      navigate({ to: "/admin/login" });
      return;
    }

    const load = async () => {
      try {
        const [adminData, customersData] = await Promise.all([
          getMe(),
          getCustomers(),
        ]);
        setAdmin(adminData);
        setCustomers(customersData);
        setFilteredCustomers(customersData);
      } catch (err: any) {
        if (err.message.includes("401")) {
          logout();
          navigate({ to: "/admin/login" });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  useEffect(() => {
    if (!search) {
      setFilteredCustomers(customers);
      return;
    }
    const q = search.toLowerCase();
    setFilteredCustomers(
      customers.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone_number.includes(q)
      )
    );
  }, [search, customers]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login" });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            View all registered customers
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Customers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setViewCustomer(customer)}
                    >
                      <TableCell className="font-medium">
                        {customer.full_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.email}
                      </TableCell>
                      <TableCell>{customer.phone_number}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(customer.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewCustomer(customer);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Customer Dialog */}
      <Dialog
        open={!!viewCustomer}
        onOpenChange={(open) => !open && setViewCustomer(null)}
      >
        <DialogContent>
          {viewCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Customer Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10">
                    <Users className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{viewCustomer.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Customer since {formatDate(viewCustomer.created_at)}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="size-4 text-muted-foreground" />
                    <span>{viewCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="size-4 text-muted-foreground" />
                    <span>{viewCustomer.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span>Registered: {formatDate(viewCustomer.created_at)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}