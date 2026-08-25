import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productSlug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productSlug: string) => void;
  updateQuantity: (productSlug: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productSlug === item.productSlug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productSlug === item.productSlug
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productSlug) =>
        set((state) => ({
          items: state.items.filter((i) => i.productSlug !== productSlug),
        })),
      updateQuantity: (productSlug, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productSlug === productSlug ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'nexiacore-cart',
    }
  )
);