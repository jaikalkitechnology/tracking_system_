export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "WAREHOUSE" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Address {
  id: number;
  customer_id: number;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  email: string;
  phone: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
  total_orders: number;
  total_spent: number;
}

export interface CustomerDetail extends Customer {
  addresses: Address[];
}

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface ProductImage {
  id: number;
  url: string;
  position: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  image_url: string | null;
  barcode: string | null;
  tags: string | null;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  weight: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  status: ProductStatus;
  stock_status: StockStatus;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "ONLINE" | "COD";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PACKED" | "CANCELLED" | "COMPLETED";

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  product?: Product | null;
}

export interface OrderCreator {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  subtotal_amount: number;
  shipping_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  order_status: OrderStatus;
  shipping_address_id: number | null;
  billing_address_id: number | null;
  created_by: OrderCreator | null;
  created_at: string;
  updated_at: string;
}

export interface OrderShipmentSummary {
  id: number;
  shipment_number: string;
  tracking_number: string;
  status: ShipmentStatus;
}

export interface OrderDetail extends Order {
  customer?: Customer | null;
  shipping_address?: Address | null;
  billing_address?: Address | null;
  items: OrderItem[];
  shipments: OrderShipmentSummary[];
}

export type ShipmentStatus =
  | "ORDER_CONFIRMED"
  | "PACKED"
  | "READY_FOR_PICKUP"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "ARRIVED_AT_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_FAILED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "RTO"
  | "ON_HOLD";

export interface TrackingEvent {
  id: number;
  status: ShipmentStatus;
  title: string;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  event_time: string;
}

export interface Shipment {
  id: number;
  shipment_number: string;
  order_id: number;
  tracking_number: string;
  courier_id: number | null;
  warehouse_id: number | null;
  status: ShipmentStatus;
  weight: number | null;
  shipping_cost: number | null;
  pickup_date: string | null;
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;
  origin: string | null;
  destination: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentOrderSummary {
  id: number;
  order_number: string;
  subtotal_amount: number;
  shipping_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  items: OrderItem[];
}

export interface ShipmentDetail extends Shipment {
  courier?: Courier | null;
  warehouse?: Warehouse | null;
  tracking_events: TrackingEvent[];
  order?: ShipmentOrderSummary | null;
}

export type CourierStatus = "ACTIVE" | "INACTIVE";

export interface Courier {
  id: number;
  name: string;
  code: string;
  phone: string | null;
  email: string | null;
  api_url: string | null;
  status: CourierStatus;
  created_at: string;
  updated_at: string;
}

export type WarehouseStatus = "ACTIVE" | "INACTIVE";

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  status: WarehouseStatus;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | "NEW_ORDER"
  | "ORDER_CONFIRMED"
  | "SHIPMENT_PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_FAILED"
  | "RETURN_STARTED";

export interface Notification {
  id: number;
  user_id: number;
  shipment_id: number | null;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PublicTracking {
  tracking_number: string;
  status: ShipmentStatus;
  estimated_delivery: string | null;
  origin: string | null;
  destination: string | null;
  events: TrackingEvent[];
}

export interface DashboardSummary {
  total_orders: number;
  total_shipments: number;
  pending: number;
  picked_up: number;
  in_transit: number;
  out_for_delivery: number;
  delivered: number;
  failed_deliveries: number;
  returns: number;
  total_orders_trend: number;
  total_shipments_trend: number;
  in_transit_trend: number;
  delivered_trend: number;
  failed_deliveries_trend: number;
}

export interface RecentActivity {
  id: number;
  status: ShipmentStatus;
  title: string;
  location: string | null;
  event_time: string;
  shipment_id: number;
  tracking_number: string;
}

export interface StoreSettings {
  store_name: string;
  store_email: string | null;
  store_phone: string | null;
  website: string | null;
  logo_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  contact_name: string | null;
  contact_designation: string | null;
  contact_email: string | null;
  contact_alternate_email: string | null;
  contact_phone: string | null;
  contact_alternate_phone: string | null;
  default_shipping_charge: number;
  free_shipping_threshold: number | null;
  tax_rate_percent: number;
  currency: string;
  allow_guest_checkout: boolean;
  show_low_stock_alerts: boolean;
  enable_product_reviews: boolean;
  maintenance_mode: boolean;
  enable_inventory_tracking: boolean;
  send_order_notifications: boolean;
  updated_at: string;
}

export interface ReportsSummary {
  total_orders: number;
  total_orders_trend: number;
  total_revenue: number;
  total_revenue_trend: number;
  products_sold: number;
  products_sold_trend: number;
  new_customers: number;
  new_customers_trend: number;
}

export interface SalesOverviewPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface OrderStatusBreakdownItem {
  status: OrderStatus;
  count: number;
  percent: number;
}

export interface TopSellingProduct {
  product_id: number;
  name: string;
  category: string | null;
  image_url: string | null;
  sold: number;
  revenue: number;
}

export interface SalesByCategoryItem {
  category: string;
  orders: number;
  revenue: number;
}
