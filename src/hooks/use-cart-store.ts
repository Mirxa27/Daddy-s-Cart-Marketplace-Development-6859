import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@prisma/client';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: Partial<Product>;
  variant?: Partial<ProductVariant> | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Partial<Product>, variant?: Partial<ProductVariant> | null, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, variant = null, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === product.id && item.variantId === variant?.id
          );
          
          if (existingItemIndex > -1) {
            // Update quantity if item exists
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          }
          
          // Add new item
          const newItem: CartItem = {
            id: `${product.id}-${variant?.id || 'default'}`,
            productId: product.id!,
            variantId: variant?.id || null,
            quantity,
            product,
            variant,
          };
          
          return { items: [...state.items, newItem] };
        });
      },
      
      removeItem: (productId, variantId = null) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },
      
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          ),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.variant?.price || item.product.price || 0;
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);