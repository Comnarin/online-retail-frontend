"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, ProductCategory } from "@/lib/api";
import { toast } from "@/lib/toast";
import Drawer from "@/components/shared/Drawer";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { 
  Plus, Search, Edit2, Trash2, 
  Layers, ChevronRight, MoreVertical 
} from "lucide-react";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [category, setCategory] = useState<Partial<ProductCategory>>({ name_th: "", name_en: "", sort_order: 0, parent_id: undefined });

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["admin_categories"],
    queryFn: async () => await productsApi.categories(),
  });

  const categories = categoriesData?.data || [];
  const filteredCategories = (categories as ProductCategory[]).filter((c) => 
    (c.name_th?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (c.name_en?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const upsertMutation = useMutation({
    mutationFn: (data: Partial<ProductCategory>) => selectedCategory?.id 
      ? productsApi.updateCategory(selectedCategory.id, data) 
      : productsApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
      toast.success(`Category ${selectedCategory?.id ? "updated" : "created"} successfully`);
      closeDrawer();
    },
    onError: (err: { message: string }) => toast.error(err.message || "Failed to save category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
      toast.success("Category deleted");
      setDeleteDialogOpen(false);
    },
    onError: (err: { message: string }) => toast.error(err.message || "Failed to delete category"),
  });

  const openDrawer = (c: ProductCategory | null = null) => {
    setSelectedCategory(c);
    setCategory(c || { name_th: "", name_en: "", sort_order: 0, parent_id: undefined });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedCategory(null);
    setCategory({ name_th: "", name_en: "", sort_order: 0, parent_id: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate(category);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-main-text tracking-tight flex items-center gap-3">
            <Layers className="text-primary" size={24} />
            Categories
          </h1>
          <p className="text-[13px] text-text-muted mt-1 font-medium">Organize your products with categories and hierarchies</p>
        </div>
        <button 
          onClick={() => openDrawer()}
          className="h-11 px-5 bg-primary text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(232,87,42,0.25)] hover:shadow-[0_6px_16px_rgba(232,87,42,0.35)] hover:-translate-y-0.5 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Stats/Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-surface-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-text-faint uppercase tracking-[0.5px]">Total Categories</div>
            <div className="text-xl font-display font-bold text-main-text">{categories.length}</div>
          </div>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint transition-colors group-focus-within:text-primary" size={18} />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="w-full h-[58px] bg-surface border-2 border-surface-border rounded-2xl pl-12 pr-4 text-[14px] font-medium text-main-text outline-none transition-all focus:border-primary/30 group-hover:border-surface-border-hover placeholder:text-text-faint"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-surface border border-surface-border rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-surface-border bg-surface-alt/50">
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-[1px] w-[100px]">Order</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-[1px]">Category Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-[1px]">Hierarchy</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-[1px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-4 h-16 bg-surface-alt/20"></td>
                  </tr>
                ))
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center text-text-faint">
                        <Layers size={24} />
                      </div>
                      <p className="text-[13px] text-text-muted font-medium">No categories found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c: ProductCategory) => {
                  const parent = categories.find((p: ProductCategory) => p.id === c.parent_id);
                  return (
                    <tr key={c.id} className="group hover:bg-surface-alt/30 transition-colors">
                      <td className="px-6 py-[18px] align-middle">
                        <span className="text-[13px] font-mono font-bold text-text-faint bg-surface-border/30 px-2 py-1 rounded-md">
                          #{c.sort_order}
                        </span>
                      </td>
                      <td className="px-6 py-[18px] align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-border/40 flex items-center justify-center text-text-muted shrink-0">
                            <Layers size={14} />
                          </div>
                          <span className="text-[14px] font-bold text-main-text group-hover:text-primary transition-colors">
                            {c.name_th} {c.name_en && <span className="text-text-faint font-normal">({c.name_en})</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-[18px] align-middle">
                        {parent ? (
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted">
                            <span className="text-text-faint">{parent.name_th}</span>
                            <ChevronRight size={12} className="text-text-faint" />
                            <span className="text-main-text font-bold">{c.name_th}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-text-faint uppercase px-2 py-1 bg-surface-border/20 rounded-md">Root</span>
                        )}
                      </td>
                      <td className="px-6 py-[18px] align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openDrawer(c)}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => { setSelectedCategory(c); setDeleteDialogOpen(true); }}
                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        title={selectedCategory ? "Edit Category" : "New Category"}
        icon={<Layers size={20} />}
        footer={
          <div className="flex gap-3 w-full">
            <button 
              onClick={closeDrawer}
              className="flex-1 h-11 rounded-xl font-bold text-[13px] text-text-muted border border-surface-border hover:bg-surface-alt transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={upsertMutation.isPending}
              className="flex-1 h-11 bg-primary text-white rounded-xl font-bold text-[13px] hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all"
            >
              {upsertMutation.isPending ? "Saving..." : "Save Category"}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 p-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Category Name (TH)</label>
              <input 
                type="text" 
                className="w-full h-11 bg-surface border border-surface-border rounded-xl px-4 text-[14px] font-medium text-main-text outline-none focus:border-primary transition-colors placeholder:text-text-faint"
                placeholder="e.g. เสื้อผ้า, อุปกรณ์ไฟฟ้า"
                value={category.name_th}
                onChange={(e) => setCategory({ ...category, name_th: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Category Name (EN)</label>
              <input 
                type="text" 
                className="w-full h-11 bg-surface border border-surface-border rounded-xl px-4 text-[14px] font-medium text-main-text outline-none focus:border-primary transition-colors placeholder:text-text-faint"
                placeholder="e.g. Clothing, Electronics"
                value={category.name_en}
                onChange={(e) => setCategory({ ...category, name_en: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Parent Category</label>
            <select 
              className="w-full h-11 bg-surface border border-surface-border rounded-xl px-4 text-[14px] font-medium text-main-text outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
              value={category.parent_id || ""}
              onChange={(e) => setCategory({ ...category, parent_id: e.target.value || undefined })}
            >
              <option value="">None (Root Category)</option>
              {categories
                .filter((c: ProductCategory) => c.id !== selectedCategory?.id)
                .map((c: ProductCategory) => (
                <option key={c.id} value={c.id}>{c.name_th}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Sort Order</label>
            <input 
              type="number" 
              className="w-full h-11 bg-surface border border-surface-border rounded-xl px-4 text-[14px] font-medium text-main-text outline-none focus:border-primary transition-colors"
              value={category.sort_order}
              onChange={(e) => setCategory({ ...category, sort_order: parseInt(e.target.value) || 0 })}
            />
            <p className="text-[10px] text-text-faint mt-1">Lower numbers appear first in the list.</p>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={() => selectedCategory?.id && deleteMutation.mutate(selectedCategory.id)}
        title="Delete Category?"
        message={`This will permanently delete the category "${selectedCategory?.name_th}". This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
