"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, CreditCard, Banknote, Building, Truck, Store, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useCheckoutMutation } from "@/hooks/useCheckout";
import { useCustomerSession } from "@/hooks/useCustomerAuth";
import { useShop } from "@/hooks/useStorefront";
import { CartLineItem } from "@/components/storefront/CartLineItem";
import { ApiError } from "@/lib/api/client";
import type { DeliveryMethodInput, PaymentMethodInput, ShippingDetails } from "@/types/checkout";
import type { Shop } from "@/types/storefront";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const shopSlug = params.shopSlug as string;

  // 💡 Pull shop data to retrieve dynamic delivery fee
  const { data: shop } = useShop(shopSlug);

  const { items, clearCart, updateQuantity, removeItem } = useCartStore();
  const { data: isSessionActive } = useCustomerSession(shopSlug);
  const checkoutMutation = useCheckoutMutation(shopSlug);

  const [mounted, setMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodInput>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodInput>("cod");
  
  const [affectedItems, setAffectedItems] = useState<string[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    email: "",
    phone: "",
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    postalCode: "",
    instructions: "",
  });

  useEffect(() => {
    setMounted(true);
    if (items.length === 0 && !isSuccess) {
      router.push(`/${shopSlug}/products`);
    }
  }, [items.length, router, shopSlug, isSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAffectedItems([]);
    setGeneralError(null);

    const payload = {
      items: items.map(i => ({ productSlug: i.productSlug, quantity: i.quantity })),
      deliveryMethod,
      paymentMethod,
      ...((deliveryMethod === "delivery" || !isSessionActive) && { 
        shippingDetails: {
          fullName: shippingDetails.fullName || "Guest Customer",
          addressLine1: shippingDetails.addressLine1 || "Store Pickup",
          city: shippingDetails.city || "N/A",
          district: shippingDetails.district || "N/A",
          postalCode: shippingDetails.postalCode || "00000",
          phone: shippingDetails.phone,
          email: shippingDetails.email,
        }
      }),
    };

    checkoutMutation.mutate(payload, {
      onSuccess: (data) => {
        setIsSuccess(true);
        clearCart();
        router.push(`/${shopSlug}/orders/${data.orderId}/track`);
      },
      onError: (error) => {
        const apiErr = error as ApiError;
        const info = apiErr.info as any;
        
        if (info?.code === "INSUFFICIENT_STOCK") {
          setAffectedItems(info.affectedItems || []);
          setGeneralError("Some items in your cart are out of stock. Please review the highlighted items below.");
        } else {
          setGeneralError(apiErr.message || "Failed to process checkout. Please try again.");
        }
      }
    });
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // 💡 Safe type extension since types/storefront.ts is strictly locked and cannot be modified.
  const extendedShop = shop as (Shop & { deliveryFee?: number }) | undefined;
  const dynamicDeliveryFee = extendedShop?.deliveryFee || 0;
  
  // Apply fee ONLY if method is delivery
  const deliveryFee = deliveryMethod === "delivery" ? dynamicDeliveryFee : 0;
  const total = subtotal + deliveryFee;

  if (!mounted || (items.length === 0 && !isSuccess)) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b pb-6">
        <div>
          <div className="text-sm text-gray-500 mb-2">
            <Link href={`/${shopSlug}`} className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Checkout</h1>
          <p className="mt-2 text-gray-600">Fill in your details and place your order</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-500">
          <Lock className="h-4 w-4" /> Secure checkout
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* LEFT COLUMN: Forms */}
        <div className="flex-1 space-y-10">
          <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-10">
            
            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address {isSessionActive ? "" : "(optional)"}</label>
                  <input type="email" name="email" value={shippingDetails.email} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone number <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" required value={shippingDetails.phone} onChange={handleInputChange} placeholder="+94 77 123 4567" className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors" />
                </div>
              </div>
            </section>

            {/* Delivery Toggle */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery or pickup</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${deliveryMethod === "delivery" ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <input type="radio" name="deliveryMethod" value="delivery" checked={deliveryMethod === "delivery"} onChange={() => setDeliveryMethod("delivery")} className="sr-only" />
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${deliveryMethod === "delivery" ? "border-blue-600 border-[6px]" : "border-gray-300"}`} />
                    <Truck className={`h-5 w-5 ${deliveryMethod === "delivery" ? "text-blue-600" : "text-gray-500"}`} />
                    <span className={`font-medium ${deliveryMethod === "delivery" ? "text-blue-900" : "text-gray-900"}`}>Deliver to my address</span>
                  </div>
                </label>

                <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${deliveryMethod === "pickup" ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <input type="radio" name="deliveryMethod" value="pickup" checked={deliveryMethod === "pickup"} onChange={() => setDeliveryMethod("pickup")} className="sr-only" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${deliveryMethod === "pickup" ? "border-blue-600 border-[6px]" : "border-gray-300"}`} />
                      <Store className={`h-5 w-5 ${deliveryMethod === "pickup" ? "text-blue-600" : "text-gray-500"}`} />
                      <span className={`font-medium ${deliveryMethod === "pickup" ? "text-blue-900" : "text-gray-900"}`}>Pickup from store</span>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {/* Delivery Address Form */}
            {deliveryMethod === "delivery" && (
              <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full name <span className="text-red-500">*</span></label>
                    <input type="text" name="fullName" required value={shippingDetails.fullName} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address line 1 <span className="text-red-500">*</span></label>
                      <input type="text" name="addressLine1" required value={shippingDetails.addressLine1} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address line 2 (optional)</label>
                      <input type="text" name="addressLine2" value={shippingDetails.addressLine2} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                      <input type="text" name="city" required value={shippingDetails.city} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
                      <input type="text" name="district" required value={shippingDetails.district} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal code <span className="text-red-500">*</span></label>
                      <input type="text" name="postalCode" required value={shippingDetails.postalCode} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery instructions (optional)</label>
                    <textarea name="instructions" rows={2} placeholder="E.g. Leave at the front door" value={shippingDetails.instructions} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none" />
                  </div>
                </div>
              </section>
            )}

            {/* Payment Method */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment method</h2>
              <div className="space-y-3">
                <label className="relative flex cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-75">
                  <input type="radio" name="paymentMethod" disabled className="sr-only" />
                  <div className="flex w-full items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-gray-200" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-500">PayHere</span>
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-500">Coming soon</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">Pay securely with your card, bank transfer or eZ Cash via PayHere.</p>
                    </div>
                  </div>
                </label>

                <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${paymentMethod === "cod" ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="sr-only" />
                  <div className="flex items-start gap-3 w-full">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${paymentMethod === "cod" ? "border-blue-600 border-[6px]" : "border-gray-300"}`} />
                    <div>
                      <span className={`font-semibold ${paymentMethod === "cod" ? "text-blue-900" : "text-gray-900"}`}>Cash on delivery</span>
                      <p className={`mt-1 text-sm ${paymentMethod === "cod" ? "text-blue-700/80" : "text-gray-500"}`}>Pay in cash when your order is delivered.</p>
                    </div>
                    <Banknote className="ml-auto h-6 w-6 text-gray-400" />
                  </div>
                </label>

                <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${paymentMethod === "bank_transfer" ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} className="sr-only" />
                  <div className="flex items-start gap-3 w-full">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${paymentMethod === "bank_transfer" ? "border-blue-600 border-[6px]" : "border-gray-300"}`} />
                    <div>
                      <span className={`font-semibold ${paymentMethod === "bank_transfer" ? "text-blue-900" : "text-gray-900"}`}>Bank transfer</span>
                      <p className={`mt-1 text-sm ${paymentMethod === "bank_transfer" ? "text-blue-700/80" : "text-gray-500"}`}>Transfer directly to our account. Order processes after confirmation.</p>
                    </div>
                    <Building className="ml-auto h-6 w-6 text-gray-400" />
                  </div>
                </label>
              </div>
            </section>
            
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary (Sticky) */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="sticky top-28 rounded-2xl bg-gray-50 p-6 border border-gray-100 shadow-sm">
            
            {generalError && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3 text-red-800">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{generalError}</p>
                </div>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Order summary <span className="text-gray-500 font-normal">({items.length})</span></h2>
            </div>
            
            <div className="max-h-[40vh] overflow-y-auto pr-2 mb-6">
              {items.map((item) => (
                <CartLineItem 
                  key={item.productSlug} 
                  item={item}
                  readonly={false}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  stockError={affectedItems.includes(item.productSlug)}
                />
              ))}
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery {deliveryMethod === "pickup" && "(Pickup)"}</span>
                <span className="font-medium text-gray-900">
                  {deliveryMethod === "pickup" ? "Free" : `Rs. ${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">Incl. taxes</p>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={checkoutMutation.isPending || affectedItems.length > 0}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutMutation.isPending ? "Processing..." : (
                <>
                  <Lock className="h-4 w-4" /> Place Order
                </>
              )}
            </button>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <Lock className="h-3 w-3" />
              <span>By placing this order, you agree to our <Link href={`/${shopSlug}/terms`} className="text-blue-600 hover:underline">Terms & Conditions</Link></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}