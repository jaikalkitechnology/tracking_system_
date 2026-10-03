import api from "./axios";
import { PaginatedResponse, Product, ProductImage } from "@/types";

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  stock_status?: string;
}

export interface ProductPayload {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  image_url?: string;
  barcode?: string;
  tags?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  weight?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
}

export const productsApi = {
  list: (params: ProductListParams) => api.get<PaginatedResponse<Product>>("/products", { params }).then((r) => r.data),

  categories: () => api.get<string[]>("/products/categories").then((r) => r.data),

  get: (id: number) => api.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (payload: ProductPayload) => api.post<Product>("/products", payload).then((r) => r.data),

  update: (id: number, payload: Partial<ProductPayload & { status: string }>) =>
    api.put<Product>(`/products/${id}`, payload).then((r) => r.data),

  remove: (id: number) => api.delete(`/products/${id}`),

  addImage: (productId: number, payload: { url: string; position?: number }) =>
    api.post<ProductImage>(`/products/${productId}/images`, payload).then((r) => r.data),

  removeImage: (productId: number, imageId: number) => api.delete(`/products/${productId}/images/${imageId}`),
};
