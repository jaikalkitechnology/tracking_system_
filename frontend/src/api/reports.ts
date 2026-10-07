import api from "./axios";
import {
  OrderStatusBreakdownItem,
  PaginatedResponse,
  ReportsSummary,
  SalesByCategoryItem,
  SalesOverviewPoint,
  TopSellingProduct,
} from "@/types";

export const reportsApi = {
  summary: (days = 7) => api.get<ReportsSummary>("/reports/summary", { params: { days } }).then((r) => r.data),
  salesOverview: (days = 7) =>
    api.get<SalesOverviewPoint[]>("/reports/sales-overview", { params: { days } }).then((r) => r.data),
  orderStatusBreakdown: () =>
    api.get<OrderStatusBreakdownItem[]>("/reports/order-status-breakdown").then((r) => r.data),
  topSellingProducts: (days = 30, page = 1, limit = 5) =>
    api
      .get<PaginatedResponse<TopSellingProduct>>("/reports/top-selling-products", { params: { days, page, limit } })
      .then((r) => r.data),
  salesByCategory: (days = 30, page = 1, limit = 5) =>
    api
      .get<PaginatedResponse<SalesByCategoryItem>>("/reports/sales-by-category", { params: { days, page, limit } })
      .then((r) => r.data),
};
