"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MapPin, Truck, Phone, ChevronRight, Package, Info } from "lucide-react";
import { useTrackOrder } from "@/hooks/useOrderTracking";
import { useShop } from "@/hooks/useStorefront";
import { OrderStatusTimeline } from "@/components/storefront/OrderStatusTimeline";

export default function OrderTrackPage() {
  const params = useParams();
  const shopSlug = params.shopSlug as string;
  const orderId = params.orderId as string;

  const { data: shop } = useShop(shopSlug);
  const { data: order, isLoading, isError } = useTrackOrder(shopSlug, orderId);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24 px-4 text-center animate-pulse">
        <div className="h-16 w-16 rounded-full bg-gray-200 mb-6" />
        <div className="h-8 w-64 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-6">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
        <p className="mt-2 text-gray-500 mb-8 max-w-md">
          We couldn't find an order with this reference number. Please check your link or contact support.
        </p>
        <Link
          href={`/${shopSlug}`}
          className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  const itemSubtotal = order.items.reduce((acc, item) => acc + item.subTotal, 0);
  const deliveryFee = order.totalAmount - itemSubtotal;
  
  const createdDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-1">
      {/* Hero Header */}
      <div className="text-center mb-16">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-3">Order Confirmed</h1>
        <p className="text-gray-600">Thank you! Your order has been received.</p>
        
        <div className="mt-6 inline-flex flex-col items-center rounded-2xl bg-gray-50 px-8 py-4 border border-gray-100 shadow-sm">
          <span className="text-sm font-medium text-gray-900 mb-1">Order #{order.billNumber}</span>
          <span className="text-xs text-gray-500">{createdDate}</span>
        </div>
      </div>

      {/* Timeline Component */}
      <div className="mb-12">
        <OrderStatusTimeline 
          status={order.status} 
          deliveryStatus={order.deliveryStatus} 
          createdAt={order.createdAt} 
        />
      </div>

      {/* Dynamic Status Alert based on order status */}
      {order.status === "pending_payment" ? (
        <div className="mb-12 rounded-xl border border-orange-200 bg-orange-50 p-4 flex gap-3 text-orange-800">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Awaiting Payment Confirmation</p>
            <p className="text-sm mt-1">Your order is on hold until we confirm your bank transfer. Please follow the instructions sent to your email.</p>
          </div>
        </div>
      ) : order.deliveryStatus === "processing" ? (
        <div className="mb-12 rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3 text-blue-800">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Good news! Your order is being packed.</p>
            <p className="text-sm mt-1">We'll update this page when it's out for delivery.</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Order Summary */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Order summary</h2>
            <span className="text-sm font-medium text-blue-600">{order.items.length} items</span>
          </div>

          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  {/* Fallback image placeholder because `OrderItemView` contract lacks an image field */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 font-medium">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</span>
                    <span className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 shrink-0">Rs. {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">Rs. {itemSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery {order.deliveryMethod === 'pickup' ? '(Pickup)' : ''}</span>
              <span className="font-medium text-gray-900">
                {deliveryFee === 0 ? "Free" : `Rs. ${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-100 text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>Rs. {order.totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500">Incl. taxes</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Delivery & Customer Details */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm flex flex-col space-y-6">
          <h2 className="text-lg font-bold text-gray-900 pb-4 border-b border-gray-200">Delivery details</h2>
          
          <div className="space-y-6 flex-1">
            <div className="flex gap-4">
              <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  {order.deliveryMethod === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
                </p>
                {order.shippingDetails ? (
                  <p className="text-sm text-gray-900 leading-relaxed">
                    <span className="font-medium">{order.shippingDetails.fullName}</span><br />
                    {order.shippingDetails.addressLine1}, {order.shippingDetails.addressLine2 && `${order.shippingDetails.addressLine2}, `}
                    {order.shippingDetails.city}, {order.shippingDetails.district}
                  </p>
                ) : (
                  <p className="text-sm text-gray-900">{shop?.address || "Store Location"}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Truck className="h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Method</p>
                <p className="text-sm text-gray-900 font-medium">
                  {order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Standard Delivery'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Payment: {order.paymentMethod}</p>
              </div>
            </div>

            {order.shippingDetails?.phone && (
              <div className="flex gap-4">
                <Phone className="h-5 w-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Contact Number</p>
                  <p className="text-sm text-gray-900">{order.shippingDetails.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center pb-12">
        <p className="text-sm text-gray-500 mb-6">Need help with your order? <a href={`mailto:hello@${shopSlug}.lk`} className="text-blue-600 hover:underline font-medium">Contact our support team.</a></p>
        <Link 
          href={`/${shopSlug}/products`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          Continue Shopping <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}