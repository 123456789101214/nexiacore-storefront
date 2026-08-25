"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Package, LogOut, ChevronRight, ShoppingBag } from "lucide-react";
import { useMyOrders } from "@/hooks/useOrderTracking";
import { useCustomerLogout } from "@/hooks/useCustomerAuth";
import { OrderStatusTimeline } from "@/components/storefront/OrderStatusTimeline";
import { ApiError } from "@/lib/api/client";

export default function OrderHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const shopSlug = params.shopSlug as string;

  // Pass true to explicitly trigger the fetch. If it 401s, we catch it below.
  const { data: orders, isLoading, error } = useMyOrders(shopSlug, true);
  const logout = useCustomerLogout(shopSlug);

  // Security Gate: Redirect to login strictly on 401 Unauthorized
  useEffect(() => {
    if (error && (error as ApiError).status === 401) {
      router.push(`/${shopSlug}/account/login`);
    }
  }, [error, router, shopSlug]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.push(`/${shopSlug}`);
      }
    });
  };

  // If loading or hitting a 401 (meaning we are about to redirect), show skeleton
  if (isLoading || (error && (error as ApiError).status === 401)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 w-full animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded mb-8" />
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 w-full bg-gray-100 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  // Handle other unexpected errors (e.g., 500)
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-red-500">
        Failed to load order history. Please try again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-1">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">View and track your recent purchases</p>
        </div>
        <button 
          onClick={handleLogout}
          disabled={logout.isPending}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" /> {logout.isPending ? "Signing out..." : "Sign Out"}
        </button>
      </div>

      {/* Empty State */}
      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border border-gray-100">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't made any purchases with us yet.</p>
          <Link 
            href={`/${shopSlug}/products`}
            className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        /* Order List */
        <div className="space-y-8">
          {orders.map((order) => {
            const itemSubtotal = order.items.reduce((acc, item) => acc + item.subTotal, 0);
            const deliveryFee = order.totalAmount - itemSubtotal;
            const createdDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            });

            return (
              <div key={order.billNumber} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-0.5">Order Number</p>
                      <p className="text-sm font-bold text-gray-900">{order.billNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-0.5">Date Placed</p>
                      <p className="text-sm font-medium text-gray-900">{createdDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-0.5">Total Amount</p>
                      <p className="text-sm font-bold text-gray-900">Rs. {order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Reuse the public tracking page for the detailed view! */}
                  <Link 
                    href={`/${shopSlug}/orders/${order.billNumber}/track`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm shrink-0"
                  >
                    View Details <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Timeline & Summary */}
                <div className="p-6">
                  <div className="mb-8">
                    {/* Reusing the beautiful timeline we built for order-confirm.png! */}
                    <OrderStatusTimeline 
                      status={order.status} 
                      deliveryStatus={order.deliveryStatus} 
                      createdAt={order.createdAt} 
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-6 border-t border-gray-100 text-sm text-gray-600">
                    <Package className="h-5 w-5 text-gray-400" />
                    <span>Contains {order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span>Method: <strong className="font-medium text-gray-900">{order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Delivery'}</strong></span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}