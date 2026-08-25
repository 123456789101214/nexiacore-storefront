"use client";

import { Check, Package, Truck, Home, Clock } from "lucide-react";
import type { OrderStatus, DeliveryStatus } from "@/types/checkout";

interface OrderStatusTimelineProps {
  status: OrderStatus;
  deliveryStatus: DeliveryStatus | null;
  createdAt: string;
}

export function OrderStatusTimeline({ status, deliveryStatus, createdAt }: OrderStatusTimelineProps) {
  const isPendingPayment = status === "pending_payment";
  const isCancelled = status === "cancelled";

  const isProcessing = deliveryStatus === "processing" || deliveryStatus === "out_for_delivery" || deliveryStatus === "delivered" || status === "processing" || status === "shipped";
  const isOut = deliveryStatus === "out_for_delivery" || deliveryStatus === "delivered" || status === "shipped";
  const isDelivered = deliveryStatus === "delivered";

  const dateStr = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 font-medium">
        This order has been cancelled.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible no-scrollbar">
      <div className="relative min-w-[500px] flex justify-between">
        <div className="absolute left-6 right-6 top-6 h-1 -translate-y-1/2 rounded bg-gray-100" />
        <div 
          className="absolute left-6 top-6 h-1 -translate-y-1/2 rounded bg-blue-600 transition-all duration-500" 
          style={{ width: isDelivered ? 'calc(100% - 3rem)' : isOut ? '66%' : isProcessing ? '33%' : '0%' }}
        />

        <div className="relative flex flex-col items-center w-24 text-center z-10">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-white ${isPendingPayment ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
             {isPendingPayment ? <Clock className="h-5 w-5" /> : <Check className="h-6 w-6" />}
          </div>
          <span className="mt-3 text-sm font-bold text-gray-900">{isPendingPayment ? "Awaiting Payment" : "Placed"}</span>
          <span className="text-xs text-gray-500">{dateStr}</span>
        </div>

        <div className="relative flex flex-col items-center w-24 text-center z-10">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-white transition-colors ${isProcessing ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
             <Package className="h-5 w-5" />
          </div>
          <span className={`mt-3 text-sm font-bold ${isProcessing ? 'text-gray-900' : 'text-gray-400'}`}>Processing</span>
          <span className="text-xs text-gray-500">{isProcessing ? "Active" : "Pending"}</span>
        </div>

        <div className="relative flex flex-col items-center w-24 text-center z-10">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-white transition-colors ${isOut ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
             <Truck className="h-5 w-5" />
          </div>
          <span className={`mt-3 text-sm font-bold ${isOut ? 'text-gray-900' : 'text-gray-400'}`}>Out for Delivery</span>
          <span className="text-xs text-gray-500">{isOut ? "On the way" : "Pending"}</span>
        </div>

        <div className="relative flex flex-col items-center w-24 text-center z-10">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-white transition-colors ${isDelivered ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
             <Home className="h-5 w-5" />
          </div>
          <span className={`mt-3 text-sm font-bold ${isDelivered ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</span>
          <span className="text-xs text-gray-500">{isDelivered ? "Complete" : "Pending"}</span>
        </div>
      </div>
    </div>
  );
}