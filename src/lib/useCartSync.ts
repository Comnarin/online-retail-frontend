import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { liffCartApi, Cart, Product } from "./api";
import { useCartStore } from "./cartStore";
import { useEffect, useRef } from "react";
import { toast } from "./toast";

export function useCartSync() {
  const queryClient = useQueryClient();
  const { setItems, addItem: localAddItem, updateQty: localUpdateQty, removeItem: localRemoveItem, toggleSelect: localToggleSelect } = useCartStore();

  // 1. Fetch Cart from DB
  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => liffCartApi.get(),
    staleTime: 30000, // 30 seconds
  });


  // 2. Sync DB -> Store & Migration
  useEffect(() => {
    if (cartData?.data) {
      const items = cartData.data.items || [];
      const dbItems = items.map(item => ({
        id: item.product_id,
        name_th: item.product.name_th,
        name_en: item.product.name_en,
        price: item.product.price,
        image_url: item.product.image_url || item.product.images?.[0]?.url,
        qty: item.quantity,
        selected: item.selected,
        cart_item_id: item.id,
        inventory: item.product.inventory
      }));

      // Simplified Sync: Always use DB items as the source of truth
      setItems(dbItems);
    }
  }, [cartData, setItems]);

  // 3. Mutations for Real-time Sync
  const addMutation = useMutation({
    mutationFn: ({ product, quantity }: { product: Product; quantity: number }) => 
      liffCartApi.addItem(product.id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemID, quantity }: { itemID: string; quantity: number }) => 
      liffCartApi.updateItem(itemID, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ itemID, selected }: { itemID: string; selected: boolean }) => 
      liffCartApi.toggleSelection(itemID, selected),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (itemID: string) => liffCartApi.removeItem(itemID),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  // 4. Wrapped Actions (Optimistic logic can be added here)
  const syncAddItem = (product: Product) => {
    localAddItem(product);
    addMutation.mutate({ product, quantity: 1 });
  };

  const syncUpdateQty = (productID: string, delta: number, itemID?: string) => {
    localUpdateQty(productID, delta);
    if (itemID) {
      // Find current qty to send new total qty
      const item = useCartStore.getState().items.find(i => i.id === productID);
      if (item) {
        updateMutation.mutate({ itemID, quantity: item.qty });
      }
    }
  };

  const syncToggleSelect = (productID: string, selected: boolean, itemID?: string) => {
    localToggleSelect(productID, selected);
    if (itemID) {
      toggleMutation.mutate({ itemID, selected });
    }
  };

  const syncRemoveItem = (productID: string, itemID?: string) => {
    localRemoveItem(productID);
    if (itemID) {
      removeMutation.mutate(itemID);
    }
  };

  return {
    isLoading,
    addItem: syncAddItem,
    updateQty: syncUpdateQty,
    removeItem: syncRemoveItem,
    toggleSelect: syncToggleSelect,
  };
}
