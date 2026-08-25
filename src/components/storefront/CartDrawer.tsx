"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ShieldCheck, ChevronRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartLineItem } from "./CartLineItem";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shopSlug: string;
}

export function CartDrawer({ isOpen, onClose, shopSlug }: CartDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  // Note: This subtotal is strictly for client display convenience per Data Integrity §4. 
  // It is never transmitted as an authoritative number to the backend.
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (!mounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Sliding Panel */}
      <div 
        className={`absolute inset-y-0 right-0 w-[90%] max-w-[400px] bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b px-6">
          <h2 className="text-xl font-bold text-gray-900">
            Your Cart {totalItems > 0 && `(${totalItems})`}
          </h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                <ShoppingBag className="h-8 w-8 text-gray-300" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                <p className="mt-1 text-sm text-gray-500">Looks like you haven&apos;t added anything yet.</p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 rounded-md bg-blue-50 px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((item) => (
                <CartLineItem 
                  key={item.productSlug} 
                  item={item} 
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-gray-50 px-6 py-6 shrink-0">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-medium text-gray-900">Subtotal</span>
              <span className="text-lg font-bold text-gray-900">Rs. {subtotal.toFixed(2)}</span>
            </div>
            <p className="mb-6 text-xs text-gray-500">
              Shipping and taxes calculated at checkout
            </p>
            <Link
              href={`/${shopSlug}/checkout`}
              onClick={onClose}
              className="flex w-full items-center justify-between rounded-lg bg-blue-600 px-6 py-4 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
            >
              <span>Checkout</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
            
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4" />
              <span><strong className="text-gray-700 font-medium">Secure checkout</strong><br className="sm:hidden" /> 100% secure payments with SSL encryption</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}