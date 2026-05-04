import { httpClient } from "./httpClient";

// ─── Shared Types ──────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ─── Domain Types ──────────────────────────────

export interface Product {
  id: string;
  name_th: string;
  name_en?: string;
  sku?: string;
  description_th: string;
  description_en?: string;
  price: number;
  inventory: number;
  status: 'active' | 'inactive';
  images: ProductImage[];
  category?: ProductCategory;
  category_id?: string;
  image_url?: string;
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface ProductCategory {
  id: string;
  name_th: string;
  name_en?: string;
  parent_id?: string;
  sort_order?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'tenant_admin';
  is_active: boolean;
  tenant_id?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  is_active: boolean;
  tenant_id: string;
  points_balance?: number;
  membership_tier?: string;
  voucher_count?: number;
  favorites_count?: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  status: string;
  payment_deadline?: string;
  payment_method_id?: string;
  slip_image_url?: string;
  created_at: string;
  items: OrderItem[];
  shipping_address: OrderAddress;
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  product_id: string;
  name_th: string;
  name_en?: string;
  price: number;
  quantity: number;
  subtotal: number;
  product?: Product;
}

export interface OrderAddress {
  name: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  zip_code: string;
}

export interface Coupon {
  id: string;
  tenant_id: string;
  code: string;
  description: string;
  discount_type: 'fixed' | 'percent';
  discount_value: number;
  min_order_value: number;
  max_discount: number;
  usage_limit: number;
  used_count: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  tier_id: string | null;
}

export interface CustomerAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  zip_code: string;
  is_default: boolean;
}

export interface Transaction {
  id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  payment_method: string;
  created_at: string;
  order?: Order;
  customer?: Customer;
}

export interface MembershipTier {
  id: string;
  name: string;
  level: number;
  min_points: number;
  discount_rate: number;
  color: string;
  is_active?: boolean;
}

export interface Appearance {
  tenant_id: string;
  logo_url: string;
  primary_color: string;
  banner_url: string;
  theme: string;
  shop_title: string;
  shop_description: string;
  shop_hero_url: string;
}

export interface StoreAppearance {
  name: string;
  order_code?: string;
  appearance: Appearance;
  features: TenantFeatures;
}

export interface TenantFeatures {
  enable_membership: boolean;
  enable_coupons: boolean;
  enable_points: boolean;
  enable_reviews: boolean;
  enable_delivery: boolean;
  point_exchange_rate: number;
}

export interface PointTransaction {
  id: string;
  customer_id: string;
  points: number;
  type: "earn" | "redeem" | "admin";
  description: string;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  features: TenantFeatures;
  domain: string;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  icon: string;
  description: string;
  expiry_minutes: number;
  qr_code_url?: string;
}

export interface CustomerPaymentMethod {
  id: string;
  payment_method_id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  payment_method?: PaymentMethod;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  selected: boolean;
}

// ─── API Clients ──────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    httpClient.post<ApiResponse<{ token: string; user: User }>>("/auth/login", { email, password }),
  logout: () => httpClient.post<ApiResponse<null>>("/auth/logout"),
  loginWithLine: (data: { tenant_id: string; line_user_id: string; id_token: string; display_name?: string; picture_url?: string }) =>
    httpClient.post<ApiResponse<{ token: string; customer: Customer }>>("/auth/line/login", data),
  devLiffLogin: (tenantId: string) =>
    httpClient.get<ApiResponse<{ token: string; customer: Customer }>>(`/auth/dev-liff/${tenantId}`),
};

export const productsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    httpClient.get<PaginatedResponse<Product>>("/admin/products", { params }),
  get: (id: string) => httpClient.get<ApiResponse<Product>>(`/admin/products/${id}`),
  create: (data: Partial<Product>) => httpClient.post<ApiResponse<Product>>("/admin/products", data),
  update: (id: string, data: Partial<Product>) => httpClient.put<ApiResponse<Product>>(`/admin/products/${id}`, data),
  delete: (id: string) => httpClient.delete<ApiResponse<null>>(`/admin/products/${id}`),
  categories: () => httpClient.get<ApiResponse<ProductCategory[]>>("/admin/products/categories"),
  createCategory: (data: Partial<ProductCategory>) => 
    httpClient.post<ApiResponse<ProductCategory>>("/admin/products/categories", data),
  updateCategory: (id: string, data: Partial<ProductCategory>) =>
    httpClient.put<ApiResponse<ProductCategory>>(`/admin/products/categories/${id}`, data),
  deleteCategory: (id: string) =>
    httpClient.delete<ApiResponse<null>>(`/admin/products/categories/${id}`),
  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return httpClient.post<ApiResponse<ProductImage>>(`/admin/products/${id}/images`, formData);
  },
  deleteImage: (id: string, imageId: string) =>
    httpClient.delete<ApiResponse<null>>(`/admin/products/${id}/images/${imageId}`),
};

export const couponsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    httpClient.get<ApiResponse<Coupon[]>>("/admin/coupons", { params }),
  get: (id: string) => httpClient.get<ApiResponse<Coupon>>(`/admin/coupons/${id}`),
  create: (data: Partial<Coupon>) => httpClient.post<ApiResponse<Coupon>>("/admin/coupons", data),
  update: (id: string, data: Partial<Coupon>) => httpClient.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, data),
  toggle: (id: string) => httpClient.patch<ApiResponse<Coupon>>(`/admin/coupons/${id}/toggle`),
  delete: (id: string) => httpClient.delete<ApiResponse<null>>(`/liff/m/coupons/${id}`), // Admin delete
};

export const ordersApi = {
  list: (params?: Record<string, any>) =>
    httpClient.get<PaginatedResponse<Order>>("/admin/orders", { params }),
  get: (id: string) => httpClient.get<ApiResponse<Order>>(`/admin/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    httpClient.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status }),
  confirmPayment: (id: string) =>
    httpClient.post<ApiResponse<null>>(`/admin/orders/${id}/confirm-payment`),
  rejectPayment: (id: string) =>
    httpClient.post<ApiResponse<null>>(`/admin/orders/${id}/reject-payment`),
};

export const addressesApi = {
  list: () => httpClient.get<ApiResponse<CustomerAddress[]>>("/liff/addresses"),
  create: (data: Partial<CustomerAddress>) => httpClient.post<ApiResponse<CustomerAddress>>("/liff/addresses", data),
  update: (id: string, data: Partial<CustomerAddress>) => httpClient.put<ApiResponse<CustomerAddress>>(`/liff/addresses/${id}`, data),
  delete: (id: string) => httpClient.delete<ApiResponse<null>>(`/liff/addresses/${id}`),
};

export const membershipApi = {
  listTiers: () => httpClient.get<ApiResponse<MembershipTier[]>>("/admin/membership/tiers"),
  createTier: (data: Partial<MembershipTier>) => httpClient.post<ApiResponse<MembershipTier>>("/admin/membership/tiers", data),
  updateTier: (id: string, data: Partial<MembershipTier>) =>
    httpClient.put<ApiResponse<MembershipTier>>(`/admin/membership/tiers/${id}`, data),
  deleteTier: (id: string) =>
    httpClient.delete<ApiResponse<null>>(`/admin/membership/tiers/${id}`),
  listTransactions: (params?: Record<string, any>) =>
    httpClient.get<ApiResponse<PointTransaction[]>>("/admin/membership/transactions", { params }),
};

export interface UpdateAppearancePayload {
  name: string;
  order_code: string;
  appearance: Partial<Appearance>;
  features: TenantFeatures;
}

export const appearanceApi = {
  get: () => httpClient.get<ApiResponse<StoreAppearance>>("/admin/appearance"),
  update: (data: UpdateAppearancePayload) => httpClient.put<ApiResponse<UpdateAppearancePayload>>("/admin/appearance", data),
};

export const customersApi = {
  list: (params?: Record<string, any>) =>
    httpClient.get<PaginatedResponse<Customer>>("/admin/customers", { params }),
  get: (id: string) => httpClient.get<ApiResponse<Customer>>(`/admin/customers/${id}`),
};

export const dashboardApi = {
  stats: () => httpClient.get<ApiResponse<any>>("/admin/dashboard/stats"),
};

export const liffApi = {
  products: (params?: any) => 
    httpClient.get<ApiResponse<Product[]>>("/liff/products", { params }),
  categories: (params?: any) => 
    httpClient.get<ApiResponse<ProductCategory[]>>("/liff/categories", { params }),
  createOrder: (data: {
    items: { product_id: string; quantity: number }[];
    shipping_address: OrderAddress;
    coupon_code?: string;
    points_to_redeem?: number;
    save_address?: boolean;
    address_label?: string;
    payment_method_id: string;
    note?: string;
  }) => httpClient.post<ApiResponse<Order>>("/liff/orders", data),
  profile: () => httpClient.get<ApiResponse<Customer>>("/liff/profile"),
  orders: (params?: Record<string, any>) => httpClient.get<ApiResponse<Order[]>>("/liff/orders", { params }),
  getActivePendingOrder: () => httpClient.get<ApiResponse<Order>>("/liff/orders/active-pending"),
  updateOrderPaymentMethod: (id: string, paymentMethodId: string) => httpClient.post<ApiResponse<Order>>(`/liff/orders/${id}/payment-method`, { payment_method_id: paymentMethodId }),
  cancelOrder: (id: string) => httpClient.post<ApiResponse<null>>(`/liff/orders/${id}/cancel`),
  appearance: () => httpClient.get<ApiResponse<StoreAppearance>>("/liff/appearance"),
  uploadSlip: (orderId: string, file: File) => {
    const formData = new FormData();
    formData.append('slip', file);
    return httpClient.post<ApiResponse<{ slip_image_url: string }>>(`/liff/orders/${orderId}/upload-slip`, formData);
  },
};

export const liffPaymentApi = {
  listMethods: () => httpClient.get<ApiResponse<PaymentMethod[]>>("/liff/payment-methods"),
  listSavedMethods: () => httpClient.get<ApiResponse<CustomerPaymentMethod[]>>("/liff/customer/payment-methods"),
  createSavedMethod: (data: any) => httpClient.post<ApiResponse<CustomerPaymentMethod>>("/liff/customer/payment-methods", data),
  updateSavedMethod: (id: string, data: any) => httpClient.put<ApiResponse<CustomerPaymentMethod>>(`/liff/customer/payment-methods/${id}`, data),
  deleteSavedMethod: (id: string) => httpClient.delete<ApiResponse<null>>(`/liff/customer/payment-methods/${id}`),
  setDefaultMethod: (id: string) => httpClient.post<ApiResponse<null>>(`/liff/customer/payment-methods/${id}/default`),
};

export const liffCartApi = {
  get: () => httpClient.get<ApiResponse<Cart>>("/liff/cart"),
  addItem: (product_id: string, quantity: number) => 
    httpClient.post<ApiResponse<{ success: boolean }>>("/liff/cart/items", { product_id, quantity }),
  updateItem: (id: string, quantity: number) =>
    httpClient.patch<ApiResponse<{ success: boolean }>>(`/liff/cart/items/${id}`, { quantity }),
  toggleSelection: (id: string, selected: boolean) =>
    httpClient.patch<ApiResponse<{ success: boolean }>>(`/liff/cart/items/${id}/select`, { selected }),
  removeItem: (id: string) =>
    httpClient.delete<ApiResponse<{ success: boolean }>>(`/liff/cart/items/${id}`),
  clear: () =>
    httpClient.delete<ApiResponse<{ success: boolean }>>("/liff/cart/clear"),
};

export const transactionsApi = {
  list: (params?: Record<string, any>) =>
    httpClient.get<PaginatedResponse<Transaction>>("/admin/transactions", { params }),
};

export const tenantsApi = {
  list: (params?: Record<string, any>) =>
    httpClient.get<PaginatedResponse<Tenant>>("/superadmin/tenants", { params }),
  get: (id: string) => httpClient.get<ApiResponse<Tenant>>(`/superadmin/tenants/${id}`),
  create: (data: Partial<Tenant>) => httpClient.post<ApiResponse<Tenant>>("/superadmin/tenants", data),
  update: (id: string, data: Partial<Tenant>) =>
    httpClient.put<ApiResponse<Tenant>>(`/superadmin/tenants/${id}`, data),
  updateFeatures: (id: string, features: TenantFeatures) =>
    httpClient.put<ApiResponse<Tenant>>(`/superadmin/tenants/${id}/features`, features),
  delete: (id: string) => httpClient.delete<ApiResponse<null>>(`/superadmin/tenants/${id}`),
  listAdmins: (id: string) => httpClient.get<ApiResponse<PaginatedResponse<User>>>(`/superadmin/tenants/${id}/admins`),
  createAdmin: (id: string, data: any) => httpClient.post<ApiResponse<User>>(`/superadmin/tenants/${id}/admins`, data),
  removeAdmin: (tenantId: string, adminId: string) =>
    httpClient.delete<ApiResponse<null>>(`/superadmin/tenants/${tenantId}/admins/${adminId}`),
};

export const adminPaymentMethodsApi = {
  list: () => httpClient.get<ApiResponse<PaymentMethod[]>>("/admin/payment-methods"),
  update: (id: string, data: Partial<PaymentMethod>) =>
    httpClient.put<ApiResponse<PaymentMethod>>(`/admin/payment-methods/${id}`, data),
  uploadQRCode: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('qr_code', file);
    return httpClient.post<ApiResponse<{ qr_code_url: string }>>(`/admin/payment-methods/${id}/qr-code`, formData);
  },
};

const api = {
  auth: authApi,
  products: productsApi,
  coupons: couponsApi,
  orders: ordersApi,
  liff: liffApi,
  addresses: addressesApi,
  transactions: transactionsApi,
  membership: membershipApi,
  appearance: appearanceApi,
  tenants: tenantsApi,
  dashboard: dashboardApi,
  customers: customersApi,
  cart: liffCartApi,
  adminPaymentMethods: adminPaymentMethodsApi,
};

export default api;
