import { Category, Product, Coupon, Profile, Order, Provider, Booking, AppNotification } from '../models';

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
  },
  {
    id: 'prod-4',
    category_id: 'cat-3',
    category: MOCK_CATEGORIES[2],
    name: 'واقي شمس جل غير دهني SPF 50+ بحماية واسعة المدى',
    name_en: 'Invisible Aqua Gel Sunscreen SPF 50+ PA++++',
    slug: 'aqua-gel-sunscreen-spf50',
    description: 'واقي شمس بقوام مائي خفيف يمتص سريعاً بدون ترك أي أثر أبيض أو لمعان، مناسب للبشرة الدهنية والمعرضة للحبوب تحت المكياج.',
    ingredients: 'Zinc Oxide (Nano-free), Centella Asiatica Extract, Niacinamide, Vitamin B5.',
    how_to_use: 'يوضع قبل الخروج للشمس بـ 15 دقيقة، ويعاد تطبيقه كل ساعتين عند التعرض المباشر.',
    brand: 'DermaShield Pro',
    price: 420,
    discount_price: 370,
    stock_quantity: 80,
    sku: 'BEA-SUN-004',
    is_active: true,
    is_featured: true,
    rating_avg: 4.9,
    reviews_count: 64,
    main_image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-5',
    category_id: 'cat-3',
    category: MOCK_CATEGORIES[2],
    name: 'كريم ترطيب مكثف بالسيراميد وحمض الهيالورونيك للبشرة الجافة',
    name_en: 'Ceramide Barrier Repair Intensive Cream',
    slug: 'ceramide-barrier-cream',
    description: 'يعيد بناء حاجز البشرة المتضرر، يمنح ترطيباً عميقاً يدوم 48 ساعة ويحمي من الجفاف والتهيج الموسمي.',
    ingredients: '3 Essential Ceramides (1, 3, 6-II), Hyaluronic Acid, Shea Butter, Squalane.',
    how_to_use: 'يستخدم مرتين يومياً صباحاً ومساءً على الوجه والرقبة مع التدليك اللطيف.',
    brand: 'DermaShield Pro',
    price: 390,
    discount_price: null,
    stock_quantity: 40,
    sku: 'BEA-MOIST-005',
    is_active: true,
    is_featured: false,
    rating_avg: 4.8,
    reviews_count: 21,
    main_image: 'https://images.unsplash.com/photo-1608248597359-53e7787f7d45?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prod-6',
    category_id: 'cat-4',
    category: MOCK_CATEGORIES[3],
    name: 'مجموعة النضارة والترميم الملكية (سيروم + كريم + غسول)',
    name_en: 'Royal Radiance & Repair 3-Step Routine Set',
    slug: 'royal-radiance-repair-set',
    description: 'بوكس العناية المتكامل للنضارة وتجديد البشرة في 3 خطوات بسيطة: غسول الأحماض اللطيف، سيروم الإشراقة، وكريم السيراميد الفاخر.',
    ingredients: 'مجموعة المكونات النشطة من فيتامين C، سيراميدات، هيالورونيك، ومستخلص الشاي الأخضر.',
    how_to_use: 'الخطوة 1: الغسول. الخطوة 2: السيروم على بشرة شبه جافة. الخطوة 3: تثبيت الترطيب بالكريم.',
    brand: 'Lumière Glow Skin',
    price: 1250,
    discount_price: 990,
    stock_quantity: 18,
    sku: 'BEA-SET-006',
    is_active: true,
    is_featured: true,
    rating_avg: 5.0,
    reviews_count: 44,
    main_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
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
  },
  {
    id: 'coup-3',
    code: 'WELCOME20',
    discount_type: 'percentage',
    value: 20,
    min_order_amount: 400,
    max_discount_amount: 200,
    times_used: 15,
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
  full_name: 'أمنية السعيد',
  phone: '01234567890',
  role: 'provider',
  city: 'التجمع، القاهرة',
  address_line: 'شارع مجمع البنوك',
  loyalty_points: 520,
  avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
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
      { product_id: 'prod-1', product: MOCK_PRODUCTS[0], quantity: 1, price_at_purchase: 390 },
      { product_id: 'prod-2', product: MOCK_PRODUCTS[1], quantity: 1, price_at_purchase: 460 }
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
  },
  {
    id: 'srv-hair-botox',
    title: 'جلسة فيلر وبوتوكس للشعر المجهد والمتقصف',
    category: 'hair',
    duration: '2 ساعة',
    basePrice: 950,
    description: 'تغذية مكثفة بأحماض أمينية وزيوت طبيعية تعيد بناء روابط الكيراتين المكسورة وتعطي لمعاناً فائقاً.',
    icon: 'fa-spray-can-sparkles'
  },
  {
    id: 'srv-bride-package',
    title: 'بكج العناية الملكي للعروس والمناسبات (شعر + بشرة)',
    category: 'full',
    duration: '4 ساعات',
    basePrice: 2200,
    description: 'برنامج مكثف متكامل يشمل تنظيف بشرة ملكي وماسكات طمي البحر الميت مع جلسة ترميم شعر ولمسة بروتين لامعة.',
    icon: 'fa-crown'
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
    specialties: [
      'جلسة بروتين وكولاجين وترميم الشعر الفاخر',
      'جلسة فيلر وبوتوكس للشعر المجهد والمتقصف',
      'بكج العناية الملكي للعروس والمناسبات (شعر + بشرة)'
    ],
    bio: 'أخصائية معتمدة بخبرة 7 سنوات في علاجات وترميم الشعر بأحدث التقنيات البرازيلية ومواد الأرجان الأصلية.',
    documents: [
      {
        id: 'doc-1',
        provider_id: 'prov-1',
        doc_type: 'national_id',
        title: 'بطاقة الرقم القومي (سارية)',
        storage_path: 'docs/omneya_national_id.pdf',
        reviewed: true
      },
      {
        id: 'doc-2',
        provider_id: 'prov-1',
        doc_type: 'certificate',
        title: 'شهادة الأكاديمية الدولية للعناية بالشعر وترميمه',
        storage_path: 'docs/omneya_cert.pdf',
        reviewed: true
      }
    ]
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
    specialties: [
      'جلسة هيدرافيشال ونضارة البشرة الزجاجية (Glass Skin)',
      'بكج العناية الملكي للعروس والمناسبات (شعر + بشرة)'
    ],
    bio: 'خبيرة عناية بالبشرة وجلسات الهيدرافيشال والتقشير الكربوني وأجهزة النانو ديرما بن.',
    documents: [
      {
        id: 'doc-3',
        provider_id: 'prov-2',
        doc_type: 'certificate',
        title: 'دبلومة متقدمة في العناية بالبشرة والـ HydraFacial',
        storage_path: 'docs/yasmin_diploma.pdf',
        reviewed: true
      }
    ]
  },
  {
    id: 'prov-3',
    user_id: 'usr-prov-03',
    type: 'freelancer',
    status: 'trusted',
    display_name: 'ريهام عبد العزيز',
    phone: '01144556677',
    city: 'الشيخ زايد و 6 أكتوبر',
    lat: 30.0561,
    lng: 30.9788,
    rating_avg: 4.90,
    rating_count: 36,
    is_available: true,
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    specialties: [
      'جلسة بروتين وكولاجين وترميم الشعر الفاخر',
      'جلسة فيلر وبوتوكس للشعر المجهد والمتقصف'
    ],
    bio: 'متخصصة في علاجات الشعر الكيرلي والتالف والتطويل الطبيعي والميزوثيرابي المنزلي.',
    documents: []
  },
  {
    id: 'prov-4',
    user_id: 'usr-prov-04',
    type: 'freelancer',
    status: 'verified',
    display_name: 'هدى مصطفى',
    phone: '01299887766',
    city: 'بني سويف والفيوم',
    lat: 29.0661,
    lng: 31.0994,
    rating_avg: 4.85,
    rating_count: 28,
    is_available: true,
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
    specialties: [
      'جلسة بروتين وكولاجين وترميم الشعر الفاخر',
      'جلسة هيدرافيشال ونضارة البشرة الزجاجية (Glass Skin)'
    ],
    bio: 'أخصائية معتمدة متخصصة في جلسات العناية المنزلية للعرائس في بني سويف ومحافظات الصعيد.',
    documents: []
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
  },
  {
    id: 'bok-902',
    user_id: 'usr-cust-01',
    customer_name: 'سارة أحمد',
    customer_phone: '01123456789',
    provider_id: 'prov-2',
    provider: MOCK_PROVIDERS[1],
    service_type: 'جلسة هيدرافيشال ونضارة البشرة الزجاجية (Glass Skin)',
    status: 'confirmed',
    requested_area: 'التجمع الخامس، القاهرة',
    scheduled_at: '2026-08-23T14:30:00Z',
    agreed_price: 850,
    payment_status: 'paid',
    notes: 'جلسة نضارة قبل مناسبة عائلية.',
    created_at: '2026-08-20T12:00:00Z'
  },
  {
    id: 'bok-903',
    user_id: 'usr-cust-02',
    customer_name: 'مها الشريف',
    customer_phone: '01099887766',
    provider_id: null,
    service_type: 'بكج العناية الملكي للعروس والمناسبات (شعر + بشرة)',
    status: 'requested',
    requested_area: 'الشيخ زايد، الجيزة',
    scheduled_at: '2026-08-27T17:00:00Z',
    agreed_price: null,
    payment_status: 'unpaid',
    notes: 'ميعاد فرحي قريب ومحتاجة أخصائية بروتين وبشرة معتمدة.',
    created_at: '2026-08-21T18:45:00Z'
  },
  {
    id: 'bok-904',
    user_id: 'usr-cust-01',
    customer_name: 'سارة أحمد',
    customer_phone: '01123456789',
    provider_id: 'prov-1',
    provider: MOCK_PROVIDERS[0],
    service_type: 'جلسة فيلر وبوتوكس للشعر المجهد والمتقصف',
    status: 'completed',
    requested_area: 'شارع التسعين، التجمع الخامس',
    scheduled_at: '2026-08-15T15:00:00Z',
    agreed_price: 950,
    payment_status: 'paid',
    review: {
      id: 'rev-b-1',
      booking_id: 'bok-904',
      user_id: 'usr-cust-01',
      provider_id: 'prov-1',
      rating: 5,
      comment: 'أمنية شاطرة جداً ومحترفة والنتيجة فاجأتني! شعري بقى ناعم وبيلمع وبدون أي ريحة نفاذة.',
      created_at: '2026-08-15T18:30:00Z'
    },
    created_at: '2026-08-14T09:00:00Z'
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
  },
  {
    id: 'notif-2',
    user_id: 'usr-prov-01',
    title: 'جلسة منزلية مؤكدة جديدة!',
    body: 'تم تأكيد حجز جلسة العناية بالشعر مع العميلة سارة أحمد في التجمع الخامس.',
    is_read: false,
    related_booking_id: 'bok-902',
    created_at: '2026-08-20T12:30:00Z'
  }
];
