import { Category, Product, Coupon, Profile, Order, Provider, Booking, AppNotification, CenterService, ReferralCode, ReferralRedemption } from '../models';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'العناية بالشعر',
    name_en: 'Hair Care',
    slug: 'hair-care',
    description: 'شامبوهات خالية من السلفات، حمامات كريم، زيوت طبيعية وسيرومات ترميم الشعر',
    image_url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'cat-2',
    name: 'العناية بالبشرة',
    name_en: 'Skin Care',
    slug: 'skin-care',
    description: 'غسول للبشرة، سيروم فيتامين سي، هيالورونيك أسيد، وكريمات النضارة ومكافحة التجاعيد',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'cat-3',
    name: 'الترطيب وحماية الشمس',
    name_en: 'Moisturizers & Sun Protection',
    slug: 'moisturizers-sunscreen',
    description: 'صن بلوك واسع المدى ومرطبات مكثفة تناسب جميع أنواع البشرة الجافة والدهنية والمختلطة',
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'cat-4',
    name: 'علاجات ومجموعات مكثفة',
    name_en: 'Intensive Treatments & Sets',
    slug: 'treatments-sets',
    description: 'مجموعات علاج تساقط الشعر، توحيد لون البشرة، ومقشرات الأحماض اللطيفة',
    image_url: 'https://images.unsplash.com/photo-1608248597359-53e7787f7d45?auto=format&fit=crop&w=600&q=80',
    sort_order: 4,
    is_active: true
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    category: MOCK_CATEGORIES[0],
    name: 'سيروم الأرجان والكيراتين لترميم الشعر التالف',
    name_en: 'Pure Argan & Keratin Restorative Hair Serum',
    slug: 'argan-keratin-hair-serum',
    description: 'تركيبة غنية بزيت الأرجان المغربي النقي والكيراتين النباتي لعلاج تقصف وهيشان الشعر وحمايته من حرارة السيشوار والحرارة اليومية.',
    ingredients: 'زيت أرجان طبيعي 100%، كيراتين نباتي، فيتامين E، زيت الجوجوبا، مستخلص إكليل الجبل.',
    how_to_use: 'توضع 3 إلى 5 قطرات على راحة اليد وتوزع بالتساوي على أطراف الشعر الرطب أو الجاف قبل التصفيف.',
    brand: 'RoseÉlixir Botanicals',
    price: 480,
    discount_price: 390,
    stock_quantity: 45,
    sku: 'BEA-HAIR-001',
    is_active: true,
    is_featured: true,
    rating_avg: 4.9,
    reviews_count: 38,
    main_image: 'https://images.unsplash.com/photo-1608248597359-53e7787f7d45?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-2',
    category_id: 'cat-2',
    category: MOCK_CATEGORIES[1],
    name: 'سيروم فيتامين C المركز بنسبة 15% مع الهيالورونيك',
    name_en: 'Radiance Boost 15% Vitamin C + Hyaluronic Serum',
    slug: 'vitamin-c-hyaluronic-serum',
    description: 'يمنح البشرة إشراقة فورية، يوحد لون البشرة، ويقلل من آثار التصبغات والبقع الداكنة بفضل قوة مضادات الأكسدة وحمض الفيروليك.',
    ingredients: '15% L-Ascorbic Acid, Hyaluronic Acid, Ferulic Acid, Niacinamide, Vitamin E.',
    how_to_use: 'يستخدم صباحاً على بشرة نظيفة قبل المرطب وواقي الشمس. يفضل حفظه في مكان بارد ومظلم.',
    brand: 'Lumière Glow Skin',
    price: 550,
    discount_price: 460,
    stock_quantity: 30,
    sku: 'BEA-SKIN-002',
    is_active: true,
    is_featured: true,
    rating_avg: 4.8,
    reviews_count: 52,
    main_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-3',
    category_id: 'cat-1',
    category: MOCK_CATEGORIES[0],
    name: 'شامبو الميزوثيرابي وإكليل الجبل لتحفيز نمو الشعر',
    name_en: 'Rosemary & Biotin Anti-Hair Loss Shampoo',
    slug: 'rosemary-biotin-shampoo',
    description: 'شامبو طبيعي خالٍ تماماً من السلفات والبارابين والسيليكون، معزز بالبيوتين ومستخلص إكليل الجبل النقي لتنشيط بصيلات الشعر والحد من التساقط.',
    ingredients: 'خلاصة إكليل الجبل المركز، بيوتين، كافيين، زيت شجرة الشاي، بانثينول.',
    how_to_use: 'يدلك على فروة الرأس المبللة بحركات دائرية لمدة دقيقتين ثم يشطف بالماء الفاتر.',
    brand: 'Botanica Herbals',
    price: 340,
    discount_price: 290,
    stock_quantity: 60,
    sku: 'BEA-HAIR-003',
    is_active: true,
    is_featured: true,
    rating_avg: 4.7,
    reviews_count: 29,
    main_image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
  }
];

export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'BEAUTY10',
    discount_type: 'percentage',
    value: 10,
    min_order_amount: 300,
    max_discount_amount: 150,
    times_used: 120,
    is_active: true
  },
  {
    id: 'coup-2',
    code: 'GLOW50',
    discount_type: 'fixed',
    value: 50,
    min_order_amount: 500,
    times_used: 45,
    is_active: true
  }
];

export const MOCK_ADMIN_PROFILE: Profile = {
  id: 'usr-admin-01',
  full_name: 'مديرة المنصة | Admin Operations',
  phone: '01000000000',
  role: 'admin',
  city: 'القاهرة',
  loyalty_points: 1250,
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
};

export const MOCK_CUSTOMER_PROFILE: Profile = {
  id: 'usr-cust-01',
  full_name: 'سارة أحمد',
  phone: '01123456789',
  role: 'customer',
  city: 'التجمع الخامس، القاهرة',
  address_line: 'شارع التسعين، فيلا 12',
  loyalty_points: 340,
  avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
};

export const MOCK_PROVIDER_PROFILE: Profile = {
  id: 'usr-prov-01',
  full_name: 'أمنية السعيد (أخصائية منزلية)',
  phone: '01234567890',
  role: 'provider',
  city: 'التجمع، القاهرة',
  address_line: 'شارع مجمع البنوك',
  loyalty_points: 520,
  avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
};

export const MOCK_CENTER_PROFILE: Profile = {
  id: 'usr-center-01',
  full_name: 'إدارة مركز L’Étoile Beauty & Spa',
  phone: '01055667788',
  role: 'center',
  city: 'التجمع الخامس، القاهرة',
  address_line: 'ميدان داون تاون، مبنى S2',
  loyalty_points: 980,
  avatar_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80'
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    user_id: 'usr-cust-01',
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'cash_on_delivery',
    shipping_full_name: 'سارة أحمد',
    shipping_phone: '01123456789',
    shipping_address: 'شارع التسعين، فيلا 12',
    shipping_city: 'القاهرة',
    subtotal: 940,
    discount_amount: 94,
    shipping_fee: 50,
    total_price: 896,
    created_at: '2026-08-10T14:30:00Z',
    items: [
      { product_id: 'prod-1', product: MOCK_PRODUCTS[0], quantity: 1, price_at_purchase: 390 }
    ]
  }
];

// Phase 2 Home Care Services & Specialists Data
export const HOME_CARE_SERVICES = [
  {
    id: 'srv-hair-protein',
    title: 'جلسة بروتين وكولاجين وترميم الشعر الفاخر',
    category: 'hair',
    duration: '2.5 - 3 ساعات',
    basePrice: 1200,
    description: 'علاج عميق لفرد وتقوية الشعر بمواد برازيلية أصلية خالية من الفورمالين تماماً مع فحص خصلات الشعر بأحدث أجهزة النانو سبريه.',
    icon: 'fa-feather-pointed'
  },
  {
    id: 'srv-skin-hydra',
    title: 'جلسة هيدرافيشال ونضارة البشرة الزجاجية (Glass Skin)',
    category: 'skin',
    duration: '1.5 ساعة',
    basePrice: 850,
    description: 'تنظيف مسام عميق، إزالة الرؤوس السوداء، تقشير كربوني لطيف، وسيرومات تفتيح وميزوثيرابي سطحي لنضارة فورية تدوم.',
    icon: 'fa-wand-magic-sparkles'
  }
];

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'prov-1',
    user_id: 'usr-prov-01',
    type: 'freelancer',
    status: 'trusted',
    display_name: 'أمنية السعيد',
    phone: '01234567890',
    city: 'التجمع الخامس والقاهرة الجديدة',
    lat: 30.0263,
    lng: 31.4967,
    rating_avg: 4.95,
    rating_count: 54,
    is_available: true,
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    specialties: ['جلسة بروتين وكولاجين وترميم الشعر الفاخر', 'جلسة فيلر وبوتوكس للشعر المجهد والمتقصف'],
    bio: 'أخصائية معتمدة بخبرة 7 سنوات في علاجات وترميم الشعر بأحدث التقنيات البرازيلية ومواد الأرجان الأصلية.'
  },
  {
    id: 'prov-2',
    user_id: 'usr-prov-02',
    type: 'freelancer',
    status: 'verified',
    display_name: 'د. ياسمين فؤاد',
    phone: '01011223344',
    city: 'المعادي ومدينة نصر، القاهرة',
    lat: 29.9602,
    lng: 31.2569,
    rating_avg: 4.88,
    rating_count: 42,
    is_available: true,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    specialties: ['جلسة هيدرافيشال ونضارة البشرة الزجاجية (Glass Skin)'],
    bio: 'خبيرة عناية بالبشرة وجلسات الهيدرافيشال والتقشير الكربوني وأجهزة النانو ديرما بن.'
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bok-901',
    user_id: 'usr-cust-01',
    customer_name: 'سارة أحمد',
    customer_phone: '01123456789',
    provider_id: 'prov-1',
    provider: MOCK_PROVIDERS[0],
    service_type: 'جلسة بروتين وكولاجين وترميم الشعر الفاخر',
    status: 'offered',
    requested_area: 'شارع التسعين، التجمع الخامس، القاهرة',
    scheduled_at: '2026-08-25T16:00:00Z',
    agreed_price: 1150,
    payment_status: 'unpaid',
    notes: 'الشعر مصبوغ ومجهد ومحتاجة مواد خالية من الفورمالين تماماً.',
    created_at: '2026-08-21T10:00:00Z'
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-cust-01',
    title: 'عرض سعر جديد جاهز لمراجعتك!',
    body: 'قامت الإدارة بترشيح الأخصائية أمنية السعيد لحجز جلسة البروتين الخاصة بك بسعر 1150 ج.م.',
    is_read: false,
    related_booking_id: 'bok-901',
    created_at: '2026-08-21T11:00:00Z'
  }
];

// =============================================================================
// PHASE 3: BEAUTY CENTERS DIRECTORY MOCK DATA
// =============================================================================

export const MOCK_CENTERS: Provider[] = [
  {
    id: 'ctr-1',
    user_id: 'usr-center-01',
    type: 'center',
    status: 'trusted',
    display_name: 'L’Étoile Beauty & Spa Lounge',
    phone: '01055667788',
    city: 'التجمع الخامس، القاهرة الجديدة',
    address_line: 'ميدان داون تاون، شارع التسعين الجنوبي، مبنى S2، الدور الثاني',
    lat: 30.0194,
    lng: 31.4385,
    rating_avg: 4.96,
    rating_count: 142,
    is_available: true,
    avatar_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80',
    photos: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
    ],
    opening_hours: 'يومياً من 11:00 صباحاً حتى 10:00 مساءً (الجمعة 01:00 م)',
    bio: 'وجهة الجمال والسبا الفاخرة في القاهرة الجديدة. نوفر أحدث أجهزة الهيدرافيشال الأصلية، جلسات الحمام المغربي الملكي بالأعشاب، وأجنحة تصفيف وترميم الشعر بمعايير عالمية.',
    specialties: ['علاجات الشعر والبروتين', 'جلسات تنظيف وبشرة زجاجية', 'حمام مغربي وسبا', 'أجنحة العرائس والميك أب'],
    referral_code: {
      id: 'ref-1',
      provider_id: 'ctr-1',
      code: 'LETOILE15',
      discount_description: 'خصم حصري 15% على جميع خدمات السبا والشعر',
      discount_percentage: 15,
      commission_rate: 10, // 10% Platform commission on confirmed bookings
      is_active: true
    },
    center_services: [
      {
        id: 'cs-1',
        provider_id: 'ctr-1',
        service_name: 'جلسة البروتين والكافيار الملكي لفرد وترميم الشعر',
        description: 'فحص إلكتروني للشعر وجلسة علاجية بمواد أصلية خالية من الفورمالين 100%.',
        price_from: 1400,
        price_to: 2200,
        is_active: true,
        category: 'hair'
      },
      {
        id: 'cs-2',
        provider_id: 'ctr-1',
        service_name: 'جلسة هيدرافيشال إيليت مع ماسك الذهب عيار 24',
        description: 'تنظيف مسام، تقشير كربوني، وتغذية بالهيالورونيك والميزوثيرابي السطحي.',
        price_from: 950,
        price_to: 1500,
        is_active: true,
        category: 'skin'
      },
      {
        id: 'cs-3',
        provider_id: 'ctr-1',
        service_name: 'الحمام المغربي الملكي بالأعشاب الطبيعية وصابون الغار',
        description: 'جلسة بخار مغربي، ليفة كيس أصلية، ماسك طمي البحر الميت، وترطيب بالمسك الأبيض.',
        price_from: 800,
        price_to: 1200,
        is_active: true,
        category: 'spa'
      },
      {
        id: 'cs-4',
        provider_id: 'ctr-1',
        service_name: 'بكج العروس الفاخر (شعر + بشرة + سبا كامل + ميك أب)',
        description: 'يوم كامل من الاستجمام والتحضير المتكامل للعروس في جناح خاص.',
        price_from: 3500,
        price_to: 6000,
        is_active: true,
        category: 'bridal'
      }
    ]
  },
  {
    id: 'ctr-2',
    user_id: 'usr-center-02',
    type: 'center',
    status: 'trusted',
    display_name: 'Glow & Glamour Hair Lounge',
    phone: '01122334455',
    city: 'المعادي، القاهرة',
    address_line: 'شارع 9، أمام محطة مترو المعادي، عمارة سرايات المعادي',
    lat: 29.9602,
    lng: 31.2569,
    rating_avg: 4.89,
    rating_count: 98,
    is_available: true,
    avatar_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    photos: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'
    ],
    opening_hours: 'يومياً من 10:00 ص حتى 09:00 م (الأحد عطلة)',
    bio: 'المركز المتخصص الأول في صبغات البالياج الحديثة، ترميم روابط الشعر بـ Olaplex، وجلسات البوتوكس العلاجي في المعادي.',
    specialties: ['صبغات وبالياج عالمي', 'علاجات أولابلكس وبوتوكس', 'قص وتصفيف عصري'],
    referral_code: {
      id: 'ref-2',
      provider_id: 'ctr-2',
      code: 'GLOWMAADI10',
      discount_description: 'خصم 10% على صبغات البالياج وجلسات البوتوكس',
      discount_percentage: 10,
      commission_rate: 10,
      is_active: true
    },
    center_services: [
      {
        id: 'cs-5',
        provider_id: 'ctr-2',
        service_name: 'صبغة بالياج فرنسي مع بروتين الحماية Olaplex',
        description: 'تفتيح احترافي بدون إجهاد للشعر وتوحيد درجات النيود والأشقر الرمادي.',
        price_from: 1800,
        price_to: 3200,
        is_active: true,
        category: 'hair'
      },
      {
        id: 'cs-6',
        provider_id: 'ctr-2',
        service_name: 'جلسة ترميم فيلر وبوتوكس لتقصف أطراف الشعر',
        description: 'إعادة ملء الفراغات الدقيقة في خصلات الشعر المتكسر.',
        price_from: 900,
        price_to: 1400,
        is_active: true,
        category: 'hair'
      }
    ]
  },
  {
    id: 'ctr-3',
    user_id: 'usr-center-03',
    type: 'center',
    status: 'verified',
    display_name: 'Royal Diva Wellness & Laser Spa',
    phone: '01288990011',
    city: 'الشيخ زايد، 6 أكتوبر',
    address_line: 'وصلة دهشور، مول أركان بلازا، مبنى 4',
    lat: 30.0561,
    lng: 30.9788,
    rating_avg: 4.92,
    rating_count: 115,
    is_available: true,
    avatar_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    photos: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
    ],
    opening_hours: 'يومياً من 11:00 ص حتى 10:00 م',
    bio: 'عيادات ومركز تجميل متكامل يجمع بين جلسات العناية بالبشرة بالليزر غير الجراحي، تنظيف المسام الكربوني، وعلاجات الميزوثيرابي وتجديد الخلايا.',
    specialties: ['جلسات ليزر وتقشير كربوني', 'عناية بالبشرة وميزوثيرابي', 'جلسات ديتوكس الجسم'],
    referral_code: {
      id: 'ref-3',
      provider_id: 'ctr-3',
      code: 'ROYALDIVA20',
      discount_description: 'خصم حصري 20% على جلسات الليزر والتقشير الكربوني',
      discount_percentage: 20,
      commission_rate: 12,
      is_active: true
    },
    center_services: [
      {
        id: 'cs-7',
        provider_id: 'ctr-3',
        service_name: 'جلسة تقشير كربوني هوليوودي لنضارة وتفتيح المسام',
        description: 'إزالة التصبغات وإعادة النضارة الفورية للبشرة بأحدث أجهزة Q-Switched Laser.',
        price_from: 750,
        price_to: 1200,
        is_active: true,
        category: 'skin'
      },
      {
        id: 'cs-8',
        provider_id: 'ctr-3',
        service_name: 'جلسة ديرمابن مع خلايا جذعية ومحفزات الكولاجين',
        description: 'علاج آثار الحبوب والندبات السطحية وشد البشرة المترهلة.',
        price_from: 850,
        price_to: 1400,
        is_active: true,
        category: 'skin'
      }
    ]
  },
  {
    id: 'ctr-4',
    user_id: 'usr-center-04',
    type: 'center',
    status: 'verified',
    display_name: 'La Rose Beauty Center & Bridal Suites',
    phone: '01199887766',
    city: 'بني سويف، كورنيش النيل',
    address_line: 'شارع كورنيش النيل، برج رويال بلازا، الدور الأول',
    lat: 29.0661,
    lng: 31.0994,
    rating_avg: 4.87,
    rating_count: 67,
    is_available: true,
    avatar_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    photos: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    opening_hours: 'يومياً من 10:00 ص حتى 09:30 م',
    bio: 'المركز الرائد للعناية بالمرأة والعروس في محافظة بني سويف ومحافظات شمال الصعيد بأطقم متخصصة معتمدة.',
    specialties: ['عناية العرائس الشاملة', 'فرد وبروتين الشعر', 'جلسات تنظيف بشرة مائية'],
    referral_code: {
      id: 'ref-4',
      provider_id: 'ctr-4',
      code: 'LAROSE10',
      discount_description: 'خصم 10% على بكجات العرائس وجلسات البروتين',
      discount_percentage: 10,
      commission_rate: 10,
      is_active: true
    },
    center_services: [
      {
        id: 'cs-9',
        provider_id: 'ctr-4',
        service_name: 'جلسة بروتين وماسك الحرير لمعالجة الشعر التالف',
        price_from: 1000,
        price_to: 1800,
        is_active: true,
        category: 'hair'
      },
      {
        id: 'cs-10',
        provider_id: 'ctr-4',
        service_name: 'بكج العروسة الكامل (تنظيف عميق + حمام تركي + مكياج)',
        price_from: 2500,
        price_to: 4500,
        is_active: true,
        category: 'bridal'
      }
    ]
  }
];

export const MOCK_REFERRAL_REDEMPTIONS: ReferralRedemption[] = [
  {
    id: 'rdm-101',
    referral_code_id: 'ref-1',
    referral_code: MOCK_CENTERS[0].referral_code,
    user_id: 'usr-cust-01',
    user: MOCK_CUSTOMER_PROFILE,
    provider_id: 'ctr-1',
    provider: MOCK_CENTERS[0],
    status: 'claimed',
    notes: 'العميلة طلبت الكود لحجز جلسة حمام مغربي وهيدرافيشال.',
    claimed_at: '2026-08-22T09:30:00Z'
  },
  {
    id: 'rdm-102',
    referral_code_id: 'ref-1',
    referral_code: MOCK_CENTERS[0].referral_code,
    user_id: 'usr-cust-02',
    provider_id: 'ctr-1',
    provider: MOCK_CENTERS[0],
    status: 'confirmed_by_center',
    estimated_value: 1600,
    commission_amount: 160, // 10%
    notes: 'تمت الزيارة واستخدام كود الخصم بنجاح.',
    claimed_at: '2026-08-18T14:00:00Z',
    confirmed_at: '2026-08-19T17:30:00Z'
  },
  {
    id: 'rdm-103',
    referral_code_id: 'ref-2',
    referral_code: MOCK_CENTERS[1].referral_code,
    user_id: 'usr-cust-01',
    user: MOCK_CUSTOMER_PROFILE,
    provider_id: 'ctr-2',
    provider: MOCK_CENTERS[1],
    status: 'paid_out',
    estimated_value: 2200,
    commission_amount: 220, // 10%
    claimed_at: '2026-08-12T11:00:00Z',
    confirmed_at: '2026-08-13T16:00:00Z'
  }
];
