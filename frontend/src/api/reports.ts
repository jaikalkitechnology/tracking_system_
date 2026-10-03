import api from "./axios";
import { OrderStatusBreakdownItem, ReportsSummary, SalesByCategoryItem, SalesOverviewPoint, TopSellingProduct } from "@/types";

export const reportsApi = {
  summary: (days = 7) => api.get<ReportsSummary>("/reports/summary", { params: { days } }).then((r) => r.data),
  salesOverview: (days = 7) =>
    api.get<SalesOverviewPoint[]>("/reports/sales-overview", { params: { days } }).then((r) => r.data),
  orderStatusBreakdown: () =>
    api.get<OrderStatusBreakdownItem[]>("/reports/order-status-breakdown").then((r) => r.data),
  topSellingProducts: (days = 30, limit = 5) =>
    api.get<TopSellingProduct[]>("/reports/top-selling-products", { params: { days, limit } }).then((r) => r.data),
  salesByCategory: (days = 30) =>
    api.get<SalesByCategoryItem[]>("/reports/sales-by-category", { params: { days } }).then((r) => r.data),
};
