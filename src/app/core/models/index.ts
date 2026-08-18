export type UserRole = 'customer' | 'admin';
export type DiscountType = 'percentage' | 'fixed';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cash_on_delivery' | 'card' | 'wallet';
export type ProviderType = 'freelancer' | 'center';
export type ProviderStatus = 'pending' | 'verified' | 'trusted' | 'suspended';
export type BookingStatus = 'requested' | 'offered' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'reported';
export type PayoutStatus = 'pending' | 'paid';
export type PointsSource = 'order' | 'booking' | 'redemption' | 'manual';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url?: string | null;
  lat?: number | null;
  lng?: number | null;
  address_line?: string | null;
  city?: string | null;
  loyalty_points: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  name_en?: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_category_id?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id?: string | null;
  category?: Category;
  name: string;
  name_en?: string;
  slug: string;
  description?: string;
  ingredients?: string;
  how_to_use?: string;
  brand?: string;
  price: number;
  discount_price?: number | null;
  stock_quantity: number;
  sku?: string;
  is_active: boolean;
  is_featured: boolean;
  rating_avg: number;
  reviews_count: number;
  main_image: string;
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id?: string;
  user_id?: string;
  product_id: string;
  product: Product;
  quantity: number;
  created_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  expiry_date?: string;
  usage_limit?: number;
  times_used: number;
  is_active: boolean;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price_at_purchase: number;
}

export interface Order {
  id: string;
  user_id: string;
  user?: Profile;
  coupon_id?: string | null;
  coupon?: Coupon;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_lat?: number | null;
  shipping_lng?: number | null;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_price: number;
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user?: Profile;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface LoyaltyPointLog {
  id: string;
  user_id: string;
  points: number;
  source: PointsSource;
  reference_id?: string;
  created_at: string;
}

// Prepared Models for Phase 2
export interface Provider {
  id: string;
  user_id?: string;
  type: ProviderType;
  status: ProviderStatus;
  display_name: string;
  bio?: string;
  specialties: string[];
  lat?: number;
  lng?: number;
  rating_avg: number;
  rating_count: number;
  is_available: boolean;
  created_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  user?: Profile;
  provider_id?: string;
  provider?: Provider;
  service_type: string;
  status: BookingStatus;
  requested_area?: string;
  scheduled_at?: string;
  agreed_price?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}
