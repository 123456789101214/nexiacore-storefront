"use client";

import { useState } from "react";
import { CartDrawer } from "./CartDrawer";

interface CartDrawerProviderProps {
  shopSlug: string;
}

export function CartDrawerProvider({
  shopSlug,
}: CartDrawerProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CartDrawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      shopSlug={shopSlug}
    />
  );
}