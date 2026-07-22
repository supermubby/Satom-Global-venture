import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  Search,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Trash2,
  Loader2,
  ArrowLeft,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  getOrders,
  updateOrderStatus,
  updateOrderStatusSimple,
  deleteOrder,
  getStoredToken,
  logout,
  type OrderSummary,
  type AdminUser,
} from "@/lib/api/admin";
import { getMe } from "@/lib/api/admin";
import { AdminLayout } from "./-layout";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  successful: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const SIMPLE_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "successful", label: "Successful" },
];

function AdminOrdersPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewOrder, setViewOrder] = useState<OrderSummary | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!getStoredToken()) {
      navigate({ to: "/admin/login" });
      return;
    }

    const load = async () => {
      try {
        const [adminData, ordersData] = await Promise.all([
          getMe(),
          getOrders(),
        ]);
        setAdmin(adminData);
        setOrders(ordersData);
        setFilteredOrders(ordersData);
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

  // Filter orders when search or filters change
  useEffect(() => {
    let result = orders;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.customer.full_name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.service_name.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((o) => o.order_status === statusFilter);
    }

    setFilteredOrders(result);
  }, [search, statusFilter, orders]);

  const handleSimpleStatusUpdate = async (
    orderId: string,
    value: string
  ) => {
    setSavingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
      const result = await updateOrderStatusSimple(orderId, value);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? result.order : o))
      );
      if (viewOrder?.id === orderId) {
        setViewOrder(result.order);
      }
      toast.success("Order status updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    } finally {
      setSavingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    value: string
  ) => {
    try {
      const updated = await updateOrderStatus(orderId, { order_status: value });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      if (viewOrder?.id === orderId) {
        setViewOrder(updated);
      }
    } catch (err: any) {
      console.error("Failed to update order:", err);
    }
  };

  const handlePriceUpdate = async (orderId: string) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) return;

    setSavingPrice(true);
    try {
      const updated = await updateOrderStatus(orderId, { total_price: price });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      setViewOrder(updated);
    } catch (err: any) {
      console.error("Failed to update price:", err);
    } finally {
      setSavingPrice(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteOrder(deleteId);
      setOrders((prev) => prev.filter((o) => o.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      console.error("Failed to delete order:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login" });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openOrderDetails = (order: OrderSummary) => {
    setViewOrder(order);
    setEditPrice(order.total_price.toString());
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
          <h1 className="text-3xl font-bold tracking-tight">Service Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage all customer solar installation and service requests
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, order ID, or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No service requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer.full_name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{order.service_name}</p>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₦{order.total_price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs font-medium ${
                              ORDER_STATUS_COLORS[order.order_status] || ""
                            }`}
                          >
                            {order.order_status.replace("_", " ")}
                          </Badge>
                          <Select
                            value={order.order_status}
                            onValueChange={(v) => handleSimpleStatusUpdate(order.id, v)}
                            disabled={savingStatus[order.id]}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              {savingStatus[order.id] ? (
                                <Loader2 className="size-3 animate-spin mr-1" />
                              ) : null}
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SIMPLE_STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openOrderDetails(order)}>
                              <Eye className="size-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                            {ORDER_STATUS_OPTIONS.map((opt) => (
                              <DropdownMenuItem
                                key={opt.value}
                                onClick={() =>
                                  handleStatusUpdate(order.id, opt.value)
                                }
                                disabled={order.order_status === opt.value}
                              >
                                <div
                                  className={`size-2 rounded-full mr-2 ${
                                    opt.value === "pending"
                                      ? "bg-yellow-400"
                                      : opt.value === "confirmed"
                                      ? "bg-blue-400"
                                      : opt.value === "in_progress"
                                      ? "bg-indigo-400"
                                      : opt.value === "completed"
                                      ? "bg-green-400"
                                      : "bg-red-400"
                                  }`}
                                />
                                Set as {opt.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(order.id)}
                            >
                              <Trash2 className="size-4 mr-2" /> Delete Request
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {viewOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Service Request Details</DialogTitle>
                <DialogDescription>
                  Request ID: {viewOrder.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-2">Customer</h3>
                  <div className="rounded-lg border p-4 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {viewOrder.customer.full_name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {viewOrder.customer.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {viewOrder.customer.phone_number}</p>
                  </div>
                </div>

                {/* Service Details */}
                <div>
                  <h3 className="font-semibold mb-2">Service Details</h3>
                  <div className="rounded-lg border p-4 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Service:</span> {viewOrder.service_name}</p>
                    {viewOrder.service_description && (
                      <p><span className="text-muted-foreground">Description:</span></p>
                    )}
                    {viewOrder.service_description && (
                      <pre className="mt-1 whitespace-pre-wrap text-sm bg-muted/50 rounded p-3">{viewOrder.service_description}</pre>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Select
                    value={viewOrder.order_status}
                    onValueChange={(v) => handleStatusUpdate(viewOrder.id, v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div>
                  <h3 className="font-semibold mb-2">Total Price</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">₦</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="max-w-[200px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePriceUpdate(viewOrder.id)}
                      disabled={savingPrice || editPrice === viewOrder.total_price.toString()}
                    >
                      {savingPrice ? (
                        <Loader2 className="size-3 animate-spin mr-1" />
                      ) : (
                        <Pencil className="size-3 mr-1" />
                      )}
                      Update
                    </Button>
                  </div>
                </div>

                {/* Installation Address */}
                <div>
                  <h3 className="font-semibold mb-2">Installation Address</h3>
                  <div className="rounded-lg border p-4 text-sm">
                    <p>{viewOrder.installation_address}</p>
                    <p className="text-muted-foreground mt-1">{viewOrder.state_city}</p>
                  </div>
                </div>

                {/* Special Instructions */}
                {viewOrder.special_instructions && (
                  <div>
                    <h3 className="font-semibold mb-2">Special Instructions</h3>
                    <div className="rounded-lg border p-4 text-sm">
                      <p>{viewOrder.special_instructions}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 text-xs text-muted-foreground">
                  <p>Created: {formatDate(viewOrder.created_at)}</p>
                  <p>Updated: {formatDate(viewOrder.updated_at)}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}