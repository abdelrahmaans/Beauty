export type UserRole = 'customer' | 'admin' | 'provider' | 'center';
export type DiscountType = 'percentage' | 'fixed';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cash_on_delivery' | 'card' | 'wallet';
export type ProviderType = 'freelancer' | 'center';
export type ProviderStatus = 'pending' | 'verified' | 'trusted' | 'suspended';
export type BookingStatus = 'requested' | 'offered' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'reported';
export type PayoutStatus = 'pending' | 'paid';
export type PointsSource = 'order' | 'booking' | 'redemption' | 'manual';
export type ReportStatus = 'open' | 'in_review' | 'resolved';
export type RedemptionStatus = 'claimed' | 'confirmed_by_center' | 'rejected' | 'paid_out';
export type BannerType = 'coupon' | 'announcement';
export type BannerPlacement = 'homepage';

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

// Phase 2: Home Care Marketplace Models

export interface ProviderDocument {
  id: string;
  provider_id: string;
  doc_type: 'national_id' | 'certificate' | 'other';
  title: string;
  storage_path: string;
  reviewed: boolean;
  created_at?: string;
}

export interface Provider {
  id: string;
  user_id: string;
  user?: Profile;
  type: ProviderType;
  status: ProviderStatus;
  display_name: string;
  phone?: string;
  bio?: string;
  specialties: string[];
  city?: string;
  address_line?: string;
  lat?: number;
  lng?: number;
  rating_avg: number;
  rating_count: number;
  is_available: boolean;
  avatar_url?: string;
  photos?: string[];
  opening_hours?: string;
  center_services?: CenterService[];
  referral_code?: ReferralCode;
  documents?: ProviderDocument[];
  distance_km?: number;
  created_at?: string;
}

export interface BookingReview {
  id: string;
  booking_id: string;
  user_id: string;
  provider_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface BookingReport {
  id: string;
  booking_id: string;
  reported_by: string;
  reporter?: Profile;
  description: string;
  status: ReportStatus;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  user?: Profile;
  customer_phone?: string;
  customer_name?: string;
  provider_id?: string | null;
  provider?: Provider;
  service_type: string;
  status: BookingStatus;
  requested_area: string;
  scheduled_at?: string;
  agreed_price?: number | null;
  payment_status: PaymentStatus;
  notes?: string;
  review?: BookingReview;
  report?: BookingReport;
  created_at: string;
  updated_at?: string;
}

export interface Commission {
  id: string;
  booking_id: string;
  booking?: Booking;
  session_value: number;
  commission_rate: number;
  commission_amount: number;
  payout_status: PayoutStatus;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  related_booking_id?: string;
  created_at: string;
}

// Phase 3: Partner Beauty Centers & Referral Tracking Models

export interface CenterService {
  id: string;
  provider_id: string;
  service_name: string;
  description?: string;
  price_from?: number;
  price_to?: number;
  is_active: boolean;
  category?: string;
}

export interface ReferralCode {
  id: string;
  provider_id: string;
  code: string;
  discount_description?: string;
  discount_percentage?: number;
  commission_rate: number;
  is_active: boolean;
  created_at?: string;
}

export interface ReferralRedemption {
  id: string;
  referral_code_id: string;
  referral_code?: ReferralCode;
  user_id: string;
  user?: Profile;
  provider_id: string;
  provider?: Provider;
  status: RedemptionStatus;
  estimated_value?: number | null;
  commission_amount?: number | null;
  notes?: string;
  claimed_at: string;
  confirmed_at?: string | null;
}

// Phase 4: Promotional Banners Model

export interface Banner {
  id: string;
  type: BannerType; // 'coupon' | 'announcement'
  placement: BannerPlacement; // 'homepage'
  title: string;
  subtitle?: string;
  image_storage_path: string;
  cta_text?: string;
  cta_link?: string;
  coupon_id?: string | null;
  coupon?: Coupon;
  is_active: boolean;
  start_at?: string | null;
  end_at?: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}
