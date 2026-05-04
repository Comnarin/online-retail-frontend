"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import Drawer from "@/components/shared/Drawer";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import { Package, Plus, Search, Trash2, ChevronRight, Loader2, ImageIcon } from "lucide-react";

function InventoryBar({ inventory }: { inventory: number }) {
  const pct = Math.min((inventory / 100) * 100, 100);
  const colorClass = inventory > 10 ? "bg-[#16A34A]" : inventory > 0 ? "bg-[#F59E0B]" : "bg-[#DC2626]";
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-[13px]">{inventory}</span>
      <div className="h-1.5 w-12 bg-surface-border rounded-full overflow-hidden shrink-0">
        <div className={`h-full rounded-full transition-all duration-300 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch]       = useState("");
  const [product, setProduct]     = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [isUploadingPending, setIsUploadingPending] = useState(false);

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ["products", search],
    queryFn: async () => await productsApi.list({ search }),
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await productsApi.categories()).data,
  });

  const products   = productsData?.data || [];
  const categories = categoriesData   || [];

  const upsertMutation = useMutation({
    mutationFn: (data: any) => product?.id ? productsApi.update(product.id, data) : productsApi.create(data),
    onSuccess: async (res) => {
      const newProduct = res.data;
      const productId = product?.id || newProduct.id;

      if (pendingImages.length > 0) {
        setIsUploadingPending(true);
        try {
          await Promise.all(pendingImages.map(file => productsApi.uploadImage(productId, file)));
          toast.success("Product and images saved successfully");
        } catch (err) {
          toast.error("Product saved, but some images failed to upload");
        } finally {
          setIsUploadingPending(false);
          setPendingImages([]);
        }
      } else {
        toast.success(product?.id ? "Product updated" : "Product created");
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeDrawer();
    },
    onError: (err: any) => toast.error("Failed to save product", err.response?.data?.message || err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      setDeleteTarget(null);
      closeDrawer();
    },
    onError: (err: any) => { toast.error("Failed to delete", err.response?.data?.message || err.message); setDeleteTarget(null); },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => productsApi.uploadImage(id, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Image uploaded");
      // Optionally append to current product to update UI immediately
      if (product) {
        setProduct({ ...product, images: [...(product.images || []), data.data] });
      }
    },
    onError: (err: any) => toast.error("Failed to upload image", err.response?.data?.message || err.message),
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ id, imageId }: { id: string; imageId: string }) => productsApi.deleteImage(id, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Image deleted");
      if (product) {
        setProduct({ ...product, images: product.images.filter((img: any) => img.id !== variables.imageId) });
      }
    },
    onError: (err: any) => toast.error("Failed to delete image", err.response?.data?.message || err.message),
  });

  const openDrawer = (p: any = null) => {
    setProduct(p || { name_th: "", name_en: "", description_th: "", description_en: "", price: 0, inventory: 0, category_id: "", status: "active" });
    setPendingImages([]);
    setDrawerOpen(true);
  };
  const closeDrawer = () => { 
    setDrawerOpen(false); 
    setProduct(null);
    setPendingImages([]);
  };
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    
    // Sanitize payload: convert empty category_id string back to null for the API
    const payload = { 
      ...product,
      category_id: product.category_id === "" ? null : product.category_id 
    };
    
    upsertMutation.mutate(payload); 
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-[24px] font-extrabold text-main-text tracking-[-0.4px] leading-[1.2]">Products</h1>
          <p className="text-[13px] text-text-muted mt-[3px]">Manage your product catalog and inventory</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-transparent text-text-muted hover:bg-surface-hover hover:text-main-text" onClick={() => (window.location.href = "/admin/products/categories")}>
            Manage Categories
          </button>
          <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={() => openDrawer()}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" size={14} />
          <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 pl-[34px] text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-bg text-red-tx text-[13px] font-medium mb-4"><span>Failed to load products. Please try again.</span></div>}

      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden shadow-xs">
        <table className="w-full border-collapse">
          <thead className="bg-surface-low">
            <tr>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap" style={{ width: "35%" }}>Product</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Price</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Inventory</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Category</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap">Status</th>
              <th className="text-[11px] font-bold text-text-faint uppercase tracking-[0.6px] px-5 py-3 text-left border-b border-surface-border whitespace-nowrap" style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-surface-border last:border-0 border-collapse">
                    <td colSpan={6} className="px-5 py-[14px]"><div className="animate-pulse bg-surface-border rounded-md h-5" /></td>
                  </tr>
                ))
              : products.length === 0
              ? (
                <tr className="border-b border-surface-border last:border-0 border-collapse">
                  <td colSpan={6} className="border-none">
                    <EmptyState icon={Package} title="No products yet" description="Start by adding your first product to the catalog."
                      action={<button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={() => openDrawer()}><Plus size={15} /> Add Product</button>} />
                  </td>
                </tr>
              )
              : products.map((p: any) => (
                <tr key={p.id} onClick={() => openDrawer(p)} className="transition-colors hover:bg-surface-low cursor-pointer border-b border-surface-border last:border-0 border-collapse">
                  <td className="px-5 py-[14px] text-[13px] text-main-text align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[34px] h-[34px] rounded-md bg-primary-light flex items-center justify-center text-[12px] font-bold text-primary overflow-hidden shrink-0">
                        {p.images?.[0] ? <img src={p.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <ImageIcon size={14} />}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-main-text">{p.name_th} {p.name_en && <span className="text-text-faint font-normal">({p.name_en})</span>}</div>
                        <div className="text-[11px] text-text-faint">{p.sku || "No SKU"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-[14px] text-[13px] text-main-text align-middle font-bold">฿{p.price?.toLocaleString()}</td>
                  <td className="px-5 py-[14px] text-[13px] text-main-text align-middle"><InventoryBar inventory={p.inventory} /></td>
                  <td className="px-5 py-[14px] text-[13px] align-middle text-text-muted text-[12px]">{p.category?.name_th || "—"}</td>
                  <td className="px-5 py-[14px] text-[13px] text-main-text align-middle">
                    <span className={`inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap tracking-[0.2px] ${p.status === "active" ? "bg-green-bg text-green-tx" : p.status === "draft" ? "bg-gray-bg text-gray-tx" : "bg-red-bg text-red-tx"}`}>
                      {p.status === "active" ? "Active" : p.status === "draft" ? "Draft" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-[14px] text-[13px] text-main-text align-middle"><ChevronRight size={16} className="text-text-faint" /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} title={product?.id ? "Edit Product" : "Add Product"} subtitle="Product details" icon={<Package size={18} />}
        footer={
          <div className="flex justify-between w-full">
            <div>{product?.id && <button type="button" className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-red-bg text-red-tx hover:opacity-85" onClick={() => setDeleteTarget(product)}><Trash2 size={15} /> Delete</button>}</div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] bg-transparent text-text-muted hover:bg-surface-hover hover:text-main-text" onClick={closeDrawer}>Cancel</button>
              <button className="inline-flex items-center gap-[6px] px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.975] disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(232,87,42,0.30)]" onClick={handleSubmit} disabled={upsertMutation.isPending || isUploadingPending}>
                {upsertMutation.isPending || isUploadingPending ? <Loader2 size={15} className="animate-spin" /> : product?.id ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Product Name (TH)</label>
              <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="e.g. นาฬิกาพรีเมียม" value={product?.name_th || ""} onChange={e => setProduct({ ...product, name_th: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Product Name (EN)</label>
              <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="e.g. Premium Watch" value={product?.name_en || ""} onChange={e => setProduct({ ...product, name_en: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Description (TH)</label>
              <textarea className="w-full bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none h-auto py-2.5 resize-y min-h-[80px]" placeholder="รายละเอียดสินค้า…" value={product?.description_th || ""} onChange={e => setProduct({ ...product, description_th: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Description (EN)</label>
              <textarea className="w-full bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none h-auto py-2.5 resize-y min-h-[80px]" placeholder="Describe this product…" value={product?.description_en || ""} onChange={e => setProduct({ ...product, description_en: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Price (฿)</label>
              <input type="number" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="0" value={product?.price || 0} onChange={e => setProduct({ ...product, price: Number(e.target.value) })} required />
            </div>
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Inventory</label>
              <input type="number" className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="0" value={product?.inventory || 0} onChange={e => setProduct({ ...product, inventory: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Category</label>
              <select className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none cursor-pointer" value={product?.category_id || ""} onChange={e => setProduct({ ...product, category_id: e.target.value })}>
                <option value="">No Category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name_th}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 last:mb-0">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">Status</label>
              <select className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none cursor-pointer" value={product?.status || "active"} onChange={e => setProduct({ ...product, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.5px]">SKU (Optional)</label>
            <input className="w-full h-10 bg-surface border border-surface-border rounded-md px-3 text-[13px] font-medium text-main-text outline-none transition-colors focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] placeholder:text-text-faint appearance-none" placeholder="e.g. PROD-001" value={product?.sku || ""} onChange={e => setProduct({ ...product, sku: e.target.value })} />
          </div>
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-surface-border">
            <div className="flex justify-between items-center">
              <label className="text-[13px] font-bold text-main-text">Product Images</label>
              <div className="relative">
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;
                    
                    if (product?.id) {
                      // Immediate upload if editing
                      Array.from(files).forEach(file => uploadImageMutation.mutate({ id: product.id, file }));
                    } else {
                      // Stage images if creating
                      setPendingImages([...pendingImages, ...Array.from(files)]);
                    }
                  }}
                  disabled={uploadImageMutation.isPending || isUploadingPending}
                />
                <button type="button" className="inline-flex items-center gap-[6px] px-3 py-1.5 rounded-md text-[12px] font-semibold cursor-pointer transition-all bg-surface-low text-text-muted hover:bg-surface-hover hover:text-main-text border border-surface-border">
                  {uploadImageMutation.isPending || isUploadingPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Upload Image
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {/* Existing Images (Edit mode) */}
              {product?.images?.map((img: any) => (
                <div key={img.id} className="relative aspect-square rounded-md overflow-hidden bg-surface-low border border-surface-border group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => deleteImageMutation.mutate({ id: product.id, imageId: img.id })}
                    className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              
              {/* Pending Images (Create mode) */}
              {pendingImages.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-surface-low border border-surface-border group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-main-text bg-white/80 px-1.5 py-0.5 rounded shadow-sm">Pending</span>
                  </div>
                  <button type="button" onClick={() => setPendingImages(pendingImages.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {(!product?.id || (!product.images || product.images.length === 0)) && pendingImages.length === 0 && (
                <div className="col-span-4 py-8 flex flex-col items-center justify-center text-text-faint bg-surface-low/50 rounded-lg border border-dashed border-surface-border">
                  <ImageIcon size={24} className="mb-2 opacity-50" />
                  <span className="text-[12px]">No images selected</span>
                </div>
              )}
            </div>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog open={!!deleteTarget} title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name_th}"? This cannot be undone.`}
        confirmLabel="Delete" variant="danger" loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
