import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from './api';

interface CartItem {
  id: string;
  name_th: string;
  name_en?: string;
  price: number;
  image_url?: string;
  qty: number;
  selected?: boolean; // New property for selective checkout
  cart_item_id?: string; // ID from the database for sync
  inventory?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void; 
  updateQty: (id: string, delta: number) => void;
  toggleSelect: (id: string, selected: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name_th: product.name_th,
                name_en: product.name_en,
                price: product.price,
                image_url: product.image_url || product.images?.[0]?.url,
                qty: 1,
                selected: true,
              },
            ],
          };
        });
      },

      toggleSelect: (id, selected) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, selected } : i
          ),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQty: (id, delta) => {
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
            .filter((i) => i.qty > 0),
        }));
      },

      getTotal: () => {
        return get().items
          .filter(i => i.selected !== false)
          .reduce((sum, i) => sum + i.price * i.qty, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },

      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'curator-shopping-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
