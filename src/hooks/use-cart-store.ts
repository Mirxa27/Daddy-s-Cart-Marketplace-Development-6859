import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@prisma/client';
import toast from 'react-hot-toast';

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
  isLoading: boolean;
  addItem: (product: Partial<Product>, variant?: Partial<ProductVariant> | null, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      
      addItem: (product, variant = null, quantity = 1) => {
        const existingItemIndex = get().items.findIndex(
          (item) => item.productId === product.id && item.variantId === variant?.id
        );
        
        if (existingItemIndex > -1) {
          // Update quantity if item exists
          set((state) => {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          });
          
          toast.success(`${product.name} quantity updated in cart`);
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${product.id}-${variant?.id || 'default'}`,
            productId: product.id!,
            variantId: variant?.id || null,
            quantity,
            product,
            variant,
          };
          
          set((state) => ({ items: [...state.items, newItem] }));
          toast.success(`${product.name} added to cart`);
        }
        
        // Sync with server
        get().syncWithServer();
      },
      
      removeItem: (productId, variantId = null) => {
        const item = get().items.find(
          (item) => item.productId === productId && item.variantId === variantId
        );
        
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
        
        if (item) {
          toast.success(`${item.product.name} removed from cart`);
        }
        
        // Sync with server
        get().syncWithServer();
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
        
        // Sync with server
        get().syncWithServer();
      },
      
      clearCart: () => {
        set({ items: [] });
        toast.success('Cart cleared');
        get().syncWithServer();
      },
      
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.variant?.price || item.product.price || 0;
          return total + price * item.quantity;
        }, 0);
      },
      
      syncWithServer: async () => {
        try {
          set({ isLoading: true });
          
          // Check if user is authenticated
          const response = await fetch('/api/cart', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (response.ok) {
            // Sync local cart with server
            const { items } = get();
            
            if (items.length > 0) {
              // Send cart items to server
              for (const item of items) {
                await fetch('/api/cart', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                  }),
                  credentials: 'include',
                });
              }
            }
          }
        } catch (error) {
          // Silently fail if user is not authenticated or server is unavailable
          console.log('Cart sync failed:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);