-- =============================================================================
-- BEAUTY PLATFORM: PRODUCTION CLEANUP SCRIPT
-- ⚠️ WARNING: Execute manually in Supabase SQL Editor only before official production launch.
-- Make sure to export a backup before running.
-- =============================================================================

truncate table
  order_items,
  orders,
  cart_items,
  reviews,
  bookings,
  booking_reviews,
  booking_reports,
  commissions,
  referral_redemptions,
  referral_codes,
  center_services,
  provider_documents,
  payment_proofs,
  products,
  categories,
  providers,
  banners,
  loyalty_point_logs
restart identity cascade;

-- Note: 'profiles' table is linked with 'auth.users'.
-- If you wish to delete test users, delete them directly from Supabase Dashboard > Authentication > Users.
