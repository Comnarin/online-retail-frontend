"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import Drawer from "@/components/shared/Drawer";
import EmptyState from "@/components/shared/EmptyState";
import { ListTree, Plus, Search, ChevronLeft, Loader2 } from "lucide-react";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState<{name_th: string, name_en: string}>({ name_th: "", name_en: "" });

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await productsApi.categories()).data,
  });

  const categories = categoriesData || [];
  
  const filteredCategories = categories.filter((c: any) => 
    c.name_th.toLowerCase().includes(search.toLowerCase()) || 
    (c.name_en && c.name_en.toLowerCase().includes(search.toLowerCase()))
  );

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
      closeDrawer();
    },
    onError: (err: any) => toast.error("Failed to create category", err.response?.data?.message || err.message),
  });

  const openDrawer = () => {
    setCategory({ name_th: "", name_en: "" });
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(category);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-4">
        <button 
          onClick={() => window.location.href = "/admin/products"}
          className="flex items-center gap-1 text-[12px] font-bold text-text-muted hover:text-main-text transition-colors uppercase tracking-[1px]"
        >
          <ChevronLeft size={14} /> Back to Products
        </button>
      </div>

      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-[24px] font-extrabold text-main-text tracking-[-0.4px] leading-[1.2]">Categories</h1>
          <p className="text-[13px] text-text-muted mt-[3px]">Organize your products into collections</p>
        </div>
        <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={openDrawer}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" size={14} />
          <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 pl-[34px] text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-xs">
        <table className="w-full border-collapse">
          <thead className="bg-surface-low">
            <tr>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Name</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">System ID</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-surface-border last:border-0 border-collapse">
                  <td colSpan={2} className="px-5 py-[14px]">
                    <div className="animate-pulse bg-surface-border rounded-md h-5" />
                  </td>
                </tr>
              ))
            ) : filteredCategories.length === 0 ? (
              <tr className="border-b border-surface-border last:border-0 border-collapse">
                <td colSpan={2} className="border-none">
                  <EmptyState 
                    icon={ListTree} 
                    title="No categories found" 
                    description={search ? "Try adjusting your search terms." : "Create your first category to start organizing products."}
                    action={!search && <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={openDrawer}><Plus size={15} /> Add Category</button>} 
                  />
                </td>
              </tr>
            ) : (
              filteredCategories.map((c: any) => (
                <tr key={c.id} className="transition-colors hover:bg-surface-low cursor-default border-b border-surface-border last:border-0 border-collapse">
                  <td className="px-5 py-[14px] text-[13px] text-main-text align-middle font-semibold">{c.name_th} {c.name_en && <span className="text-text-faint font-normal">({c.name_en})</span>}</td>
                  <td className="px-5 py-[14px] align-middle text-text-muted text-[13px] font-mono">{c.id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Drawer 
        open={drawerOpen} 
        onClose={closeDrawer} 
        title="Add Category" 
        subtitle="Create a new collection" 
        icon={<ListTree size={18} />}
        footer={
          <div className="flex gap-2 w-full justify-end">
            <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-transparent text-text-muted hover:bg-surface-hover hover:text-main-text" onClick={closeDrawer} type="button">Cancel</button>
            <button form="category-form" type="submit" className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : "Create Category"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} id="category-form">
          <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Category Name (TH)</label>
            <input 
              className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" 
              placeholder="e.g. คอลเลกชันฤดูร้อน" 
              value={category.name_th} 
              onChange={e => setCategory({ ...category, name_th: e.target.value })} 
              required 
            />
          </div>
          <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Category Name (EN)</label>
            <input 
              className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" 
              placeholder="e.g. Summer Collection" 
              value={category.name_en} 
              onChange={e => setCategory({ ...category, name_en: e.target.value })} 
            />
          </div>
        </form>
      </Drawer>
    </div>
  );
}
