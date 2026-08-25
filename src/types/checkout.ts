export interface ShippingDetails {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
  instructions?: string;
  email?: string;
  phone: string;
}

export interface CheckoutItemInput {
  productSlug: string;
  quantity: number;
}

export type PaymentMethodInput = 'cod' | 'bank_transfer' | 'payhere';
export type DeliveryMethodInput = 'delivery' | 'pickup';

export interface CheckoutPayload {
  items: CheckoutItemInput[];
  deliveryMethod: DeliveryMethodInput;
  paymentMethod: PaymentMethodInput;
  shippingDetails?: ShippingDetails;
}

export interface CheckoutSuccessData {
  orderId: string;
}

export interface InsufficientStockError {
  success: false;
  code: 'INSUFFICIENT_STOCK';
  message: string;
  affectedItems: string[];
}

export type OrderStatus = 'completed' | 'voided' | 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type DeliveryStatus = 'pending' | 'processing' | 'out_for_delivery' | 'delivered';

export interface OrderItemView {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subTotal: number;
}

export interface OrderView {
  billNumber: string;
  items: OrderItemView[];
  totalAmount: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethodInput | null;
  deliveryStatus: DeliveryStatus | null;
  paymentMethod: string;
  shippingDetails?: ShippingDetails | null;
  createdAt: string;
}

export interface RequestOtpPayload {
  identifier: string;
}

export interface VerifyOtpPayload {
  identifier: string;
  otp: string;
}

export interface StoreCustomerSession {
  name: string;
  email: string;
  phone: string | null;
}