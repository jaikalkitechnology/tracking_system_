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
}

export interface CustomerDetail extends Customer {
  addresses: Address[];
}

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  weight: number | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PACKED" | "CANCELLED" | "COMPLETED";

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  product?: Product | null;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_address_id: number | null;
  billing_address_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {
  customer?: Customer | null;
  shipping_address?: Address | null;
  billing_address?: Address | null;
  items: OrderItem[];
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

export interface ShipmentDetail extends Shipment {
  courier?: Courier | null;
  warehouse?: Warehouse | null;
  tracking_events: TrackingEvent[];
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
}
