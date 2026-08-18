import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Product, Category } from '../models';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private _products = signal<Product[]>([]);
  private _categories = signal<Category[]>([]);
  private _selectedCategorySlug = signal<string | null>(null);
  private _searchQuery = signal<string>('');
  private _sortBy = signal<'popular' | 'price_low' | 'price_high' | 'rating'>('popular');
  private _isLoading = signal<boolean>(false);

  // Readonly signals
  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly selectedCategorySlug = this._selectedCategorySlug.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly sortBy = this._sortBy.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Filtered & Sorted Products
  readonly filteredProducts = computed(() => {
    let list = this._products();
    const catSlug = this._selectedCategorySlug();
    const query = this._searchQuery().trim().toLowerCase();
    const sort = this._sortBy();

    if (catSlug) {
      list = list.filter(p => p.category?.slug === catSlug || (p as any).category_slug === catSlug);
    }

    if (query) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.name_en && p.name_en.toLowerCase().includes(query)) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      const priceA = a.discount_price ?? a.price;
      const priceB = b.discount_price ?? b.price;

      switch (sort) {
        case 'price_low':
          return priceA - priceB;
        case 'price_high':
          return priceB - priceA;
        case 'rating':
          return (b.rating_avg || 0) - (a.rating_avg || 0);
        case 'popular':
        default:
          return (b.reviews_count || 0) - (a.reviews_count || 0);
      }
    });
  });

  readonly featuredProducts = computed(() => {
    return this._products().filter(p => p.is_featured);
  });

  constructor(private supabase: SupabaseService) {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          client.from('categories').select('*').order('sort_order', { ascending: true }),
          client.from('products').select('*, category:categories(*)').eq('is_active', true)
        ]);

        if (catsRes.data && catsRes.data.length > 0) {
          this._categories.set(catsRes.data);
        } else {
          this._categories.set(MOCK_CATEGORIES);
        }

        if (prodsRes.data && prodsRes.data.length > 0) {
          this._products.set(prodsRes.data);
        } else {
          this._products.set(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.warn('Error loading products from Supabase, loading fallback:', err);
        this._categories.set(MOCK_CATEGORIES);
        this._products.set(MOCK_PRODUCTS);
      }
    } else {
      // Check local storage or load mock data
      const savedProds = localStorage.getItem('beauty_custom_products');
      if (savedProds) {
        try {
          this._products.set(JSON.parse(savedProds));
        } catch {
          this._products.set(MOCK_PRODUCTS);
        }
      } else {
        this._products.set(MOCK_PRODUCTS);
      }
      this._categories.set(MOCK_CATEGORIES);
    }
    this._isLoading.set(false);
  }

  setCategoryFilter(slug: string | null): void {
    this._selectedCategorySlug.set(slug);
  }

  setSearchQuery(q: string): void {
    this._searchQuery.set(q);
  }

  setSortBy(sort: 'popular' | 'price_low' | 'price_high' | 'rating'): void {
    this._sortBy.set(sort);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this._products().find(p => p.slug === slug);
  }

  getProductById(id: string): Product | undefined {
    return this._products().find(p => p.id === id);
  }

  // Admin Operations (Create, Update, Delete)
  async saveProduct(product: Partial<Product>): Promise<{ success: boolean; product?: Product; error?: string }> {
    const client = this.supabase.client;
    let saved: Product;

    if (product.id && this.getProductById(product.id)) {
      // Update
      const existing = this.getProductById(product.id)!;
      saved = {
        ...existing,
        ...product,
        updated_at: new Date().toISOString()
      };

      if (client) {
        const { error } = await client.from('products').update(saved).eq('id', product.id);
        if (error) return { success: false, error: error.message };
      }

      this._products.update(list => list.map(p => (p.id === saved.id ? saved : p)));
    } else {
      // Create new
      const newId = 'prod-' + Date.now();
      saved = {
        id: newId,
        name: product.name || 'منتج جديد',
        name_en: product.name_en || '',
        slug: product.slug || ('prod-' + Date.now()),
        description: product.description || '',
        ingredients: product.ingredients || '',
        how_to_use: product.how_to_use || '',
        brand: product.brand || 'العلامة التجارية',
        price: Number(product.price) || 0,
        discount_price: product.discount_price ? Number(product.discount_price) : null,
        stock_quantity: Number(product.stock_quantity) || 10,
        sku: product.sku || ('SKU-' + Date.now()),
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        rating_avg: 5.0,
        reviews_count: 0,
        main_image: product.main_image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        category_id: product.category_id,
        category: this._categories().find(c => c.id === product.category_id),
        created_at: new Date().toISOString()
      };

      if (client) {
        const { error } = await client.from('products').insert([saved]);
        if (error) return { success: false, error: error.message };
      }

      this._products.update(list => [saved, ...list]);
    }

    localStorage.setItem('beauty_custom_products', JSON.stringify(this._products()));
    return { success: true, product: saved };
  }

  async deleteProduct(productId: string): Promise<boolean> {
    const client = this.supabase.client;
    if (client) {
      await client.from('products').delete().eq('id', productId);
    }
    this._products.update(list => list.filter(p => p.id !== productId));
    localStorage.setItem('beauty_custom_products', JSON.stringify(this._products()));
    return true;
  }
}
