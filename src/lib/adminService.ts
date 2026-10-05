import { supabase } from './supabase';

export interface BaseEntity {
  id?: string;
  created_at?: any;
  updated_at?: any;
}

export interface ProductVariant extends BaseEntity {
  product_id?: string;
  color_name: string;
  color_code?: string;
  size?: 'S' | 'M' | 'L' | 'XL' | string;
  stock_quantity: number;
  price?: number;
}

export interface Product extends BaseEntity {
  title: string;
  price: number;
  compare_price?: number;
  category: string;
  category_id?: string;
  description: string;
  img: string;
  gallery?: string[];
  stock: number;
  status: 'active' | 'inactive';
  features?: string[];
  specifications?: Record<string, string>;
  sales?: number;
  createdAt?: string;
  has_variants?: boolean;
  variants_enabled?: boolean;
  colors_enabled?: boolean;
  sizes_enabled?: boolean;
  global_sizes?: string[];
  variants?: ProductVariant[];
}

export interface Service extends BaseEntity {
  title: string;
  price: number;
  compare_price?: number;
  category: string;
  category_id?: string;
  description: string;
  img: string;
  gallery?: string[];
  vendor?: string;
  vendor_id?: string;
  status: 'active' | 'inactive';
  stock?: number;
  features?: string[];
  duration?: string;
  sales?: number;
  createdAt?: string;
}

export interface Order extends BaseEntity {
  userId: string;
  userName: string;
  userEmail: string;
  total: number;
  subtotal?: number;
  discountAmount?: number;
  couponCode?: string;
  country?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  items: any[];
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod: string;
  address: string;
  billingAddress?: string;
  phone: string;
  city: string;
  postalCode?: string;
  notes?: string;
  is_custom_bundle?: boolean;
  createdAt: string;
}

export interface CouponCode {
  id?: string;
  code: string;
  discount_percentage: number;
  start_date: string;
  expiry_date: string;
  is_active: boolean;
  created_at?: string;
}

export interface GalleryItem extends BaseEntity {
  title: string;
  category: string;
  img: string;
}

export interface Category extends BaseEntity {
  name: string;
  description: string;
  type: 'product' | 'service' | 'both';
  img: string;
}

export interface Review extends BaseEntity {
  id?: string;
  item_id: string;
  item_type: 'product' | 'service';
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface Invoice extends BaseEntity {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  status: 'paid' | 'pending' | 'due' | 'cancelled';
  due_date?: string;
}

export interface Feedback extends BaseEntity {
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  location?: string;
}

export interface BundleItem {
  id: string; // product or service id
  type: 'product' | 'service';
  title: string;
  price: number;
  quantity: number;
}

export interface Deal extends BaseEntity {
  title: string;
  description: string;
  price: number;
  compare_price?: number;
  img: string;
  gallery?: string[];
  status: 'active' | 'inactive';
}

export interface DealReview extends BaseEntity {
  deal_id: string;
  user_name: string;
  rating: number;
  comment: string;
}

export interface ContactMessage extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
}

// STATIC FALLBACK DATA
export const STATIC_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: "Royal Crimson Velvet Box",
    price: 4500,
    compare_price: 5400,
    category: "Gift Boxes",
    description: "Handcrafted mahogany wood box wrapped in premium crimson velvet with gold-plated latches. Perfect for weddings and special occasions.",
    img: "https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?q=80&w=800",
    status: 'active',
    stock: 50,
    sales: 120,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    features: ['Premium Velvet Wrap', 'Handcrafted Wood', 'Gold-plated Latches', 'Delivery in 3-5 Days']
  },
  {
    id: 'p2',
    title: "Empire Floral Centerpiece",
    price: 8500,
    compare_price: 10200,
    category: "Floral Decor",
    description: "Grand arrangement with imported roses and crystal vase. Exceptional quality and freshness guaranteed.",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
    status: 'active',
    stock: 25,
    sales: 85,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    features: ['Imported Roses', 'Crystal Vase', 'Long-lasting Freshness']
  },
  {
    id: 'p3',
    title: "Artisan Sweet Platter",
    price: 3200,
    compare_price: 3840,
    category: "Sweets",
    description: "Traditional artisanal sweets in handcrafted copper tray. A perfect gift for your wedding guests.",
    img: "https://images.unsplash.com/photo-1582270008277-d39294b8d73b?q=80&w=800",
    status: 'active',
    stock: 100,
    sales: 210,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    features: ['Authentic Recipe', 'Pure Ingredients', 'Handcrafted Tray']
  },
  {
    id: 'p4',
    title: "Midnight Gala Invites",
    price: 350,
    compare_price: 420,
    category: "Invites",
    description: "Luxury laser-cut silk-paper invitations with silver foil stamping. Customizable designs.",
    img: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=800",
    status: 'active',
    stock: 500,
    sales: 450,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    features: ['Silk Paper', 'Silver Foil', 'Laser Cut']
  },
  {
    id: 'p5',
    title: "Unsold Item Demo",
    price: 150,
    compare_price: 180,
    category: "Invites",
    description: "A test item with 0 sales to verify sorting logic.",
    img: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=800",
    status: 'active',
    stock: 99,
    sales: 0,
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];

export const STATIC_SERVICES: Service[] = [
  {
    id: 's1',
    title: "Grand Hall Stage Decor",
    price: 75000,
    compare_price: 112500,
    category: "Stage Decor",
    description: "Complete stage orchestration with premium floral backdrops and cinematic lighting. Our team ensures a royal feel for your big day.",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800",
    status: 'active',
    duration: '6-8 Hours',
    sales: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    features: ['Floral Backdrop', 'Cinematic Lighting', 'Expert Crew', 'Setup & Teardown']
  },
  {
    id: 's2',
    title: "Cinematic Wedding Coverage",
    price: 120000,
    compare_price: 180000,
    category: "Photography",
    description: "Full-day cinematic video and photography with drone shots. Capturing every emotion with professional gear.",
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800",
    status: 'active',
    duration: '10 Hours',
    sales: 32,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    features: ['Drone Coverage', '4K Cinematic Video', 'Professional Editing']
  }
];

export const STATIC_CATEGORIES: Category[] = [
  { id: 'c1', name: "Stage Decor", type: "service", description: "Elite stage setups", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400" },
  { id: 'c2', name: "Gift Boxes", type: "product", description: "Handcrafted favors", img: "https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?w=400" },
  { id: 'c3', name: "Photography", type: "service", description: "Professional coverage", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400" }
];

export const STATIC_GALLERY: GalleryItem[] = [
  { id: 'g1', title: "Summer Wedding", category: "Wedding", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800" },
  { id: 'g2', title: "Corporate Gala", category: "Event", img: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800" }
];

export const STATIC_DEALS: Deal[] = [
  {
    id: 'b1',
    title: "Essential Wedding Starter",
    description: "Basic stage decor, standard photography, and custom invitation cards.",
    price: 150000,
    status: 'active',
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"
  },
  {
    id: 'b2',
    title: "Premium Royal Package",
    description: "Grand Hall decor, cinematic coverage, and handcrafted gift boxes.",
    price: 250000,
    status: 'active',
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800"
  }
];

export const STATIC_FEEDBACK: Feedback[] = [
  { id: 'f1', user_id: 'u1', user_name: "Ahmed Malik", rating: 5, comment: "Top-notch stage decoration for my brother's wedding. The floral work was premium and exactly like the pictures. Best in Attock!", status: 'approved', created_at: "2026-03-15T12:00:00Z", location: "Attock" },
  { id: 'f2', user_id: 'u2', user_name: "Sara Khan", rating: 5, comment: "Purchased the Royal Velvet Box for gift packing. Quality is very good and delivery was really fast. Highly recommended for weddings.", status: 'approved', created_at: "2026-04-02T12:00:00Z", location: "Lahore" },
  { id: 'f3', user_id: 'u3', user_name: "Zeeshan Ali", rating: 5, comment: "Shadi Mehal se ham ne wedding package deal li thi, waqai bohot sasti aur achi deal thi. Sab kuch perfect tha!", status: 'approved', created_at: "2026-02-20T12:00:00Z", location: "Attock" },
  { id: 'f4', user_id: 'u4', user_name: "Maria Bibi", rating: 5, comment: "Their lighting and stage setup transformed our simple event into a royal wedding. Highly satisfied with their professionalism and products.", status: 'approved', created_at: "2026-05-10T12:00:00Z", location: "Islamabad" },
  { id: 'f5', user_id: 'u5', user_name: "Usman Sheikh", rating: 5, comment: "The essential wedding deal saved us a lot of money. Best planning team in Attock for budget weddings. Products were also great.", status: 'approved', created_at: "2026-01-25T12:00:00Z", location: "Attock" },
  { id: 'f6', user_id: 'u6', user_name: "Fatima Zahra", rating: 5, comment: "Stage decor bohot khubsurat tha, meri sister ki shadi pe sab ne tareef ki. Special thanks to the hard working team for best services.", status: 'approved', created_at: "2026-03-28T12:00:00Z", location: "Rawalpindi" },
  { id: 'f7', user_id: 'u7', user_name: "Bilal Ahmed", rating: 5, comment: "The handcrafted sweets tray I bought for mehndi was beautiful and very well made. Premium quality products indeed.", status: 'approved', created_at: "2026-04-15T12:00:00Z", location: "Attock" },
  { id: 'f8', user_id: 'u8', user_name: "Ayesha Noor", rating: 5, comment: "Hame in ki anniversary deal bohot pasand ayi. Decorations aur gift box sab premium quality ka tha. Shukriya Shadi Mehal!", status: 'approved', created_at: "2026-05-02T12:00:00Z", location: "Attock" }
];

const _productsCache: Record<string, Product> = {};
const _servicesCache: Record<string, Service> = {};
const _dealsCache: Record<string, Deal> = {};
const _ordersCache: Record<string, Order> = {};
const _userOrdersListCache: Record<string, Order[]> = {};

export const adminService = {
  getProductsCache: () => _productsCache,
  getServicesCache: () => _servicesCache,
  getDealsCache: () => _dealsCache,
  getOrdersCache: () => _ordersCache,
  getUserOrdersCache: (userId: string) => _userOrdersListCache[userId] || null,
  setUserOrdersCache: (userId: string, orders: Order[]) => {
    _userOrdersListCache[userId] = orders;
  },

  // Enhanced fetch helper with deep fallback and normalization
  safeFetch: async <T>(tableName: string, fallback: T[] = [], ordered = true) => {
    try {
      let query = supabase.from(tableName).select('*');
      
      // Attempt ordered fetch
      if (ordered) {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        // Retry with camelCase order, or fallback to an unordered query
        if (ordered) {
          console.warn(`Supabase: Table [${tableName}] created_at sort failed, retrying with camelCase order:`, error.message);
          try {
            const retryQuery = supabase.from(tableName).select('*').order('createdAt', { ascending: false });
            const { data: retryData, error: retryError } = await retryQuery;
            if (!retryError && retryData && retryData.length > 0) {
              return retryData.map(item => ({
                ...item,
                id: item.userid?.toString() || item.id?.toString() || item.user_id?.toString() || item.userId?.toString() || Math.random().toString(36).substr(2, 9),
                img: item.img || item.image_url || "https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?w=800",
                gallery: Array.isArray(item.gallery) ? item.gallery : []
              })) as (T & BaseEntity)[];
            }
          } catch (retryErr) {
            console.error(`Supabase: camelCase order failed for table [${tableName}]`, retryErr);
          }

          // Force fallback to unordered query if any ordering fails!
          console.warn(`Supabase: Table [${tableName}] sorting completely failed, falling back to unordered fetch`);
          try {
            const fallbackQuery = supabase.from(tableName).select('*').limit(100);
            const { data: fallbackData, error: fallbackError } = await fallbackQuery;
            if (!fallbackError && fallbackData && fallbackData.length > 0) {
              return fallbackData.map(item => ({
                ...item,
                id: item.userid?.toString() || item.id?.toString() || item.user_id?.toString() || item.userId?.toString() || Math.random().toString(36).substr(2, 9),
                img: item.img || item.image_url || "https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?w=800",
                gallery: Array.isArray(item.gallery) ? item.gallery : []
              })) as (T & BaseEntity)[];
            }
          } catch (fallbackErr) {
            console.error(`Supabase: Unordered fallback query failed for table [${tableName}]`, fallbackErr);
          }
        }
        
        console.warn(`Supabase: Table [${tableName}] fetch error, trying simple fetch:`, error.message);
        const { data: simpleData, error: simpleError } = await supabase.from(tableName).select('*').limit(100);
        
        if (simpleError || !simpleData || simpleData.length === 0) {
          return fallback as (T & BaseEntity)[];
        }
        return simpleData.map(item => ({
          ...item,
          id: item.userid?.toString() || item.id?.toString() || item.user_id?.toString() || item.userId?.toString() || Math.random().toString(36).substr(2, 9),
          img: item.img || item.image_url || "https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?w=800",
          gallery: Array.isArray(item.gallery) ? item.gallery : []
        })) as (T & BaseEntity)[];
      }

      if (!data || data.length === 0) {
        return fallback as (T & BaseEntity)[];
      }

      return data.map(item => ({
        ...item,
        id: item.userid?.toString() || item.id?.toString() || item.user_id?.toString() || item.userId?.toString() || Math.random().toString(36).substr(2, 9),
        img: item.img || item.image_url || "https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?w=800",
        gallery: Array.isArray(item.gallery) ? item.gallery : []
      })) as (T & BaseEntity)[];
    } catch (err) {
      console.error(`Supabase: Critical failure in safeFetch [${tableName}]`, err);
      return fallback as (T & BaseEntity)[];
    }
  },

  getProducts: async () => {
    const products = await adminService.safeFetch<Product>('products', STATIC_PRODUCTS);
    
    // Efficiently fetch variants for products that have them
    const productsWithVariants = products.filter(p => p.has_variants || p.variants_enabled);
    let result = products;
    if (productsWithVariants.length > 0) {
      const productIds = productsWithVariants.map(p => p.id);
      const { data: variants, error } = await supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds);
      
      if (!error && variants) {
        result = products.map(p => {
          const pVariants = variants.filter(v => v.product_id === p.id);
          const mappedVariants = pVariants.map((v: any) => ({
            ...v,
            color_name: v.color_name || v.color || '',
            color_code: v.color_code || '#000000',
            size: v.size || null,
            stock_quantity: v.stock_quantity !== undefined ? v.stock_quantity : (v.stock || 0)
          }));
          return {
            ...p,
            variants: mappedVariants
          };
        });
      }
    }
    
    // Seed Products Cache
    result.forEach(p => {
      _productsCache[p.id] = p;
    });
    
    return result;
  },
  addProduct: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { id: _id, createdAt, updatedAt, created_at, updated_at, variants, global_sizes, ...productData } = product as any;
      
      const buildCleanProductFields = (body: any) => {
        const fields: any = {
          title: body.title || body.name || "",
          price: body.price !== undefined && body.price !== null && body.price !== "" ? Number(body.price) : 0,
          compare_price: body.compare_price !== undefined && body.compare_price !== null && body.compare_price !== "" ? Number(body.compare_price) : 0,
          category: body.category || "",
          description: body.description || "",
          img: body.img || "",
          gallery: Array.isArray(body.gallery) ? body.gallery : [],
          stock: body.stock !== undefined && body.stock !== null && body.stock !== "" ? Number(body.stock) : 0,
          status: body.status || 'active'
        };

        if (body.category_id) {
          fields.category_id = body.category_id;
        }
        if (body.features) {
          fields.features = Array.isArray(body.features) ? body.features : [];
        }

        // VARIANT ENABLE / DISABLE LOGIC
        const enable_variants = body.enable_variants !== undefined 
          ? !!body.enable_variants 
          : (body.has_variants !== undefined 
             ? !!body.has_variants 
             : (body.variants_enabled !== undefined ? !!body.variants_enabled : false));

        const enable_colors = enable_variants
          ? !!(body.enable_colors !== undefined ? body.enable_colors : (body.colors_enabled !== undefined ? body.colors_enabled : false))
          : false;

        const enable_sizes = enable_variants
          ? !!(body.enable_sizes !== undefined ? body.enable_sizes : (body.sizes_enabled !== undefined ? body.sizes_enabled : false))
          : false;

        fields.has_variants = enable_variants;
        fields.variants_enabled = enable_variants;
        fields.colors_enabled = enable_colors;
        fields.sizes_enabled = enable_sizes;

        return { fields, enable_variants, enable_colors, enable_sizes };
      };

      const { fields: cleanProductData, enable_variants, enable_colors, enable_sizes } = buildCleanProductFields(product);

      // EXPLICIT SECURITY CHECK: ensure no custom keys are in cleanProductData that Postgres doesn't expect
      delete cleanProductData.enable_colors;
      delete cleanProductData.enable_sizes;
      delete cleanProductData.enable_variants;

      console.log("CLIENT DIRECT POST PRODUCTS PAYLOAD:", JSON.stringify(cleanProductData, null, 2));

      const { data, error } = await supabase.from('products').insert([cleanProductData]).select();
      if (error) throw error;
      
      const newProduct = data?.[0];
      if (newProduct?.id) {
        if (enable_variants) {
          let dbVariants: any[] = [];
          let dbSizes: any[] = [];

          const variantsList = variants || product.variants || [];
          variantsList.forEach((v: any) => {
            const sizeVal = v.size || null;
            const colorNameVal = v.color_name || v.color || null;
            const colorCodeVal = v.color_code || '#000000';
            const stockVal = v.stock_quantity !== undefined 
              ? v.stock_quantity 
              : (v.stock !== undefined ? v.stock : 0);

            const variantPayload: any = {
              product_id: newProduct.id,
              stock_quantity: stockVal !== undefined && stockVal !== null ? Number(stockVal) : 0
            };

            if (enable_colors) {
              variantPayload.color_name = colorNameVal && colorNameVal.toLowerCase() !== 'standard' ? colorNameVal : null;
              variantPayload.color_code = colorCodeVal && colorCodeVal !== '#000000' && colorCodeVal.toLowerCase() !== 'standard' ? colorCodeVal : null;
            }

            if (enable_sizes) {
              variantPayload.size = sizeVal || null;
            }

            dbVariants.push(variantPayload);

            if (enable_sizes && sizeVal && !dbSizes.some(sObj => sObj.size === sizeVal)) {
              dbSizes.push({ product_id: newProduct.id, size: sizeVal });
            }
          });

          if (dbVariants.length > 0) {
            const { error: vError } = await supabase.from('product_variants').insert(dbVariants);
            if (vError) throw vError;
          }
          if (dbSizes.length > 0) {
            try {
              await supabase.from('product_sizes').insert(dbSizes);
            } catch (err) {
              console.warn("Could not insert into product_sizes client side", err);
            }
          }
        }
      }

      // Import and call auto-reviewer
      import('./reviewGenerator').then(({ generateAutoReviews }) => {
        generateAutoReviews(newProduct.id, 'product');
      });

      return newProduct;
    } catch (err: any) {
      console.error("Error creating product directly on client:", err);
      throw new Error(err?.message || "Failed to save product due to invalid field mapping");
    }
  },
  updateProduct: async (id: string, productData: Partial<Product>) => {
    try {
      const { id: _id, createdAt, updatedAt, created_at, updated_at, variants, global_sizes, ...cleanData } = productData as any;
      
      const buildCleanProductFields = (body: any) => {
        const fields: any = {
          title: body.title || body.name || "",
          price: body.price !== undefined && body.price !== null && body.price !== "" ? Number(body.price) : 0,
          compare_price: body.compare_price !== undefined && body.compare_price !== null && body.compare_price !== "" ? Number(body.compare_price) : 0,
          category: body.category || "",
          description: body.description || "",
          img: body.img || "",
          gallery: Array.isArray(body.gallery) ? body.gallery : [],
          stock: body.stock !== undefined && body.stock !== null && body.stock !== "" ? Number(body.stock) : 0,
          status: body.status || 'active'
        };

        if (body.category_id) {
          fields.category_id = body.category_id;
        }
        if (body.features) {
          fields.features = Array.isArray(body.features) ? body.features : [];
        }

        // VARIANT ENABLE / DISABLE LOGIC
        const enable_variants = body.enable_variants !== undefined 
          ? !!body.enable_variants 
          : (body.has_variants !== undefined 
             ? !!body.has_variants 
             : (body.variants_enabled !== undefined ? !!body.variants_enabled : false));

        const enable_colors = enable_variants
          ? !!(body.enable_colors !== undefined ? body.enable_colors : (body.colors_enabled !== undefined ? body.colors_enabled : false))
          : false;

        const enable_sizes = enable_variants
          ? !!(body.enable_sizes !== undefined ? body.enable_sizes : (body.sizes_enabled !== undefined ? body.sizes_enabled : false))
          : false;

        fields.has_variants = enable_variants;
        fields.variants_enabled = enable_variants;
        fields.colors_enabled = enable_colors;
        fields.sizes_enabled = enable_sizes;

        return { fields, enable_variants, enable_colors, enable_sizes };
      };

      const { fields: cleanProductData, enable_variants, enable_colors, enable_sizes } = buildCleanProductFields(productData);

      // EXPLICIT SECURITY CHECK: ensure no custom keys are in cleanProductData that Postgres doesn't expect
      delete cleanProductData.enable_colors;
      delete cleanProductData.enable_sizes;
      delete cleanProductData.enable_variants;

      console.log("CLIENT DIRECT PUT PRODUCTS PAYLOAD:", JSON.stringify(cleanProductData, null, 2));

      const { data, error } = await supabase.from('products').update(cleanProductData).eq('id', id).select();
      if (error) throw error;

      if (enable_variants) {
        // Delete existing variants and sizes to do a clean sync ONLY if variants are active and being updated
        await supabase.from('product_variants').delete().eq('product_id', id);
        try {
          await supabase.from('product_sizes').delete().eq('product_id', id);
        } catch (err) {
          console.warn("Could not delete from product_sizes client side", err);
        }

        let dbVariants: any[] = [];
        let dbSizes: any[] = [];

        const variantsList = variants || productData.variants || [];
        variantsList.forEach((v: any) => {
          const sizeVal = v.size || null;
          const colorNameVal = v.color_name || v.color || null;
          const colorCodeVal = v.color_code || '#000000';
          const stockVal = v.stock_quantity !== undefined 
            ? v.stock_quantity 
            : (v.stock !== undefined ? v.stock : 0);

          const variantPayload: any = {
            product_id: id,
            stock_quantity: stockVal !== undefined && stockVal !== null ? Number(stockVal) : 0
          };

          if (enable_colors) {
            variantPayload.color_name = colorNameVal && colorNameVal.toLowerCase() !== 'standard' ? colorNameVal : null;
            variantPayload.color_code = colorCodeVal && colorCodeVal !== '#000000' && colorCodeVal.toLowerCase() !== 'standard' ? colorCodeVal : null;
          }

          if (enable_sizes) {
            variantPayload.size = sizeVal || null;
          }

          dbVariants.push(variantPayload);

          if (enable_sizes && sizeVal && !dbSizes.some(sObj => sObj.size === sizeVal)) {
            dbSizes.push({ product_id: id, size: sizeVal });
          }
        });

        if (dbVariants.length > 0) {
          const { error: vError } = await supabase.from('product_variants').insert(dbVariants);
          if (vError) throw vError;
        }
        if (dbSizes.length > 0) {
          try {
            await supabase.from('product_sizes').insert(dbSizes);
          } catch (err) {
            console.warn("Could not insert into product_sizes client side", err);
          }
        }
      }

      return data?.[0] || { success: true };
    } catch (err: any) {
      console.error("Error updating product directly on client:", err);
      throw new Error(err?.message || "Failed to save product due to invalid field mapping");
    }
  },
  deleteProduct: async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting product directly on client:", err);
      throw new Error(err?.message || "Failed to delete product");
    }
  },

  getServices: async () => {
    const services = await adminService.safeFetch<Service>('services', STATIC_SERVICES);
    services.forEach(s => {
      _servicesCache[s.id] = s;
    });
    return services;
  },
  addService: async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('services').insert([service]).select();
    if (error) throw error;
    
    const newService = data?.[0];
    if (newService?.id) {
       // Import and call auto-reviewer
       import('./reviewGenerator').then(({ generateAutoReviews }) => {
         generateAutoReviews(newService.id, 'service');
       });
    }

    return newService;
  },
  updateService: async (id: string, serviceData: Partial<Service>) => {
    const { id: _id, createdAt, updatedAt, created_at, updated_at, ...cleanData } = serviceData as any;
    const { error } = await supabase.from('services').update(cleanData).eq('id', id);
    if (error) throw error;
  },
  deleteService: async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  getCategories: async () => {
    return await adminService.safeFetch<Category>('categories', STATIC_CATEGORIES, false);
  },

  getGallery: async () => {
    return await adminService.safeFetch<GalleryItem>('gallery', STATIC_GALLERY);
  },

  getFeedback: async () => {
    const data = await adminService.safeFetch<Feedback>('feedback', STATIC_FEEDBACK);
    
    // If we only have static data and Supabase returned nothing (or error), 
    // we can check if we should try to persist it. 
    // However, to keep it simple and fulfill "save in supabase", 
    // we check if we can reach Supabase and if it's empty.
    try {
      const { count } = await supabase.from('feedback').select('*', { count: 'exact', head: true });
      if (count === 0) {
        console.log("Seeding feedback table with original data...");
        for (const f of STATIC_FEEDBACK) {
          const { id: _, location: _loc, ...clean } = f as any;
          await supabase.from('feedback').insert([clean]);
        }
        // Refetch to get real IDs
        const { data: freshData } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
        if (freshData && freshData.length > 0) return freshData;
      }
    } catch (e) {
      console.warn("Could not seed feedback automatically", e);
    }

    return data;
  },
  getFeedbackStatic: () => {
    return STATIC_FEEDBACK;
  },
  submitFeedback: async (feedback: any) => {
    const { data, error } = await supabase.from('feedback').insert([feedback]).select();
    if (error) throw error;
    return data?.[0];
  },
  updateFeedbackStatus: async (id: string, status: string) => {
    const { error } = await supabase.from('feedback').update({ status }).eq('id', id);
    if (error) throw error;
  },
  updateFeedback: async (id: string, data: Partial<Feedback>) => {
    const { error } = await supabase.from('feedback').update(data).eq('id', id);
    if (error) throw error;
  },
  deleteFeedback: async (id: string) => {
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) throw error;
  },

  getDeals: async () => {
    const deals = await adminService.safeFetch<Deal>('deals', STATIC_DEALS);
    deals.forEach(d => {
      _dealsCache[d.id] = d;
    });
    return deals;
  },
  addDeal: async (deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('deals').insert([deal]).select();
    if (error) throw error;
    return data?.[0];
  },
  updateDeal: async (id: string, deal: any) => {
    const { id: _id, created_at, updated_at, ...clean } = deal;
    const { error } = await supabase.from('deals').update(clean).eq('id', id);
    if (error) throw error;
  },
  deleteDeal: async (id: string) => {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) throw error;
  },
  getDealReviews: async (dealId: string) => {
    const { data, error } = await supabase.from('deal_reviews').select('*').eq('deal_id', dealId);
    if (error) throw error;
    return data || [];
  },
  addDealReview: async (review: Omit<DealReview, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('deal_reviews').insert([review]);
    if (error) throw error;
  },

  addCategory: async (category: any) => {
    const { data, error } = await supabase.from('categories').insert([category]).select();
    if (error) throw error;
    return data?.[0];
  },
  updateCategory: async (id: string, category: any) => {
    const { id: _id, created_at, updated_at, ...clean } = category;
    const { error } = await supabase.from('categories').update(clean).eq('id', id);
    if (error) throw error;
  },
  deleteCategory: async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  addGalleryItem: async (item: any) => {
    const { data, error } = await supabase.from('gallery').insert([item]).select();
    if (error) throw error;
    return data?.[0];
  },
  deleteGalleryItem: async (id: string) => {
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) throw error;
  },

  getOrders: async () => {
    const orders = await adminService.safeFetch<Order>('orders', []);
    orders.forEach(o => {
      _ordersCache[o.id] = o;
    });
    return orders;
  },
  getOrderById: async (id: string) => {
    if (_ordersCache[id]) {
      return _ordersCache[id];
    }
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
    if (error) {
       console.error("Supabase getOrderById error:", error);
       throw error;
    }
    if (data) {
      _ordersCache[id] = data;
    }
    return data;
  },
  updateOrderStatus: async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
       console.error("Supabase updateOrderStatus error:", error);
       throw error;
    }
  },
  updateOrderPaymentStatus: async (id: string, status: 'paid' | 'unpaid') => {
    const { error } = await supabase.from('orders').update({ paymentStatus: status }).eq('id', id);
    if (error) {
       console.error("Supabase updateOrderPaymentStatus error:", error);
       throw error;
    }
  },
  deleteOrder: async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
       console.error("Supabase deleteOrder error:", error);
       throw error;
    }
  },
  getAdminStats: async () => {
    try {
      const { data: orders, error: oError } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
      const { count: userCount, error: uError } = await supabase.from('users').select('*', { count: 'exact', head: true });
      
      if (oError || uError) throw oError || uError;

      // Filter orders from last 7 days for "Recent Orders"
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentOrders = orders?.filter(o => new Date(o.createdAt || o.created_at) >= sevenDaysAgo).slice(0, 8) || [];

      // Calculate Top Products based on completed orders
      const productCounts: Record<string, { name: string, sales: number }> = {};
      orders?.forEach(order => {
        if (order.status === 'completed') {
           const items = Array.isArray(order.items) ? order.items : [];
           items.forEach((item: any) => {
             const title = item.item?.title || item.title || item.name || 'Unknown Item';
             if (!productCounts[title]) productCounts[title] = { name: title, sales: 0 };
             productCounts[title].sales += (item.quantity || 1);
           });
        }
      });

      const topProducts = Object.values(productCounts)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)
        .map(p => ({
          ...p,
          growth: `+${Math.floor(Math.random() * 20) + 5}%` // Mocked growth for UI
        }));

      const stats = {
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
        completedOrders: orders?.filter(o => o.status === 'completed' || o.status === 'delivered').length || 0,
        totalUsers: userCount || 0,
        totalRevenue: orders?.filter(o => o.status === 'completed').reduce((sum, order) => sum + (Number(order.total) || 0), 0) || 0,
        recentOrders,
        topProducts,
        allOrders: orders || []
      };

      return stats;
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
      return { 
        totalOrders: 0, 
        pendingOrders: 0, 
        completedOrders: 0, 
        totalUsers: 0, 
        totalRevenue: 0, 
        recentOrders: [], 
        topProducts: [], 
        allOrders: [] 
      };
    }
  },
  updateUserProfile: async (userId: string, profile: { name?: string; phone?: string; address?: string; fullName?: string }) => {
    // identify user by: userid, userId, user_id, or id
    let { error } = await supabase
      .from('users')
      .update(profile)
      .eq('userid', userId);
    
    if (error) {
      console.warn("Update using 'userid' failed, trying 'userId' fallback");
      const { error: retry1Error } = await supabase
        .from('users')
        .update(profile)
        .eq('userId', userId);
        
      if (retry1Error) {
        console.warn("Update using 'userId' failed, trying 'user_id' fallback");
        const { error: retryError } = await supabase
          .from('users')
          .update(profile)
          .eq('user_id', userId);
      
        if (retryError) {
          console.warn("Update using 'user_id' failed, trying 'id' fallback");
          const { error: finalError } = await supabase
            .from('users')
            .update(profile)
            .eq('id', userId);
          if (finalError) throw finalError;
        }
      }
    }
  },
  createInvoice: async (invoiceData: { order_id: string; user_id: string; amount: number }) => {
    console.log("adminService: creating invoice:", invoiceData);
    const { data, error } = await supabase.from('invoices').insert([invoiceData]).select();
    if (error) {
       console.error("Supabase createInvoice error:", error);
       throw error;
    }
    return data?.[0];
  },
  getUserOrders: async (userId: string) => {
    try {
      // Per user schema: orders table uses 'userId'
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error("Fetch user orders failed:", error);
        return [];
      }
      const list = data || [];
      list.forEach((item: any) => {
        _ordersCache[item.id] = item;
      });
      _userOrdersListCache[userId] = list;
      return list;
    } catch (err) {
      console.error("Fetch user orders error", err);
      return [];
    }
  },
  createOrder: async (orderData: any) => {
    console.log("FINAL ORDER PAYLOAD PRE-MAP:", orderData);
    
    // STRICT PAYLOAD CONTROL: Manually construct payload for Supabase matching NEW columns
    const payload = {
      userId: orderData.userId || orderData.user_id,
      userName: orderData.userName || orderData.user_name,
      userEmail: orderData.userEmail || orderData.user_email,
      items: orderData.items,
      total: orderData.total,
      subtotal: orderData.subtotal || orderData.total,
      discountAmount: orderData.discountAmount || 0,
      couponCode: orderData.couponCode || 'N/A',
      country: orderData.country || 'Pakistan',
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'cod',
      address: orderData.address,
      billingAddress: orderData.billingAddress || orderData.address,
      phone: orderData.phone,
      city: orderData.city,
      postalCode: orderData.postalCode,
      notes: orderData.notes,
      is_custom_bundle: orderData.is_custom_bundle || false,
      createdAt: new Date().toISOString()
    };

    console.log("FINAL ORDER PAYLOAD:", payload);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    const { data, error } = await supabase.from('orders').insert([payload]).select();
    
    if (error) {
      console.error("Supabase createOrder error:", error);
      throw error;
    }
    
    console.log("Insert response:", data);
    if (data && data[0]) {
      const newOrder = data[0];
      const uid = newOrder.userId || newOrder.user_id;
      if (uid) {
        const cachedList = _userOrdersListCache[uid] || [];
        _userOrdersListCache[uid] = [newOrder, ...cachedList.filter((o: any) => o.id !== newOrder.id)];
      }
      _ordersCache[newOrder.id] = newOrder;
    }
    return data?.[0];
  },

  // --- COUPON MANAGEMENT ---
  getCoupons: async () => {
    const { data, error } = await supabase
      .from('coupon_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as CouponCode[];
  },

  addCoupon: async (coupon: CouponCode) => {
    const { data, error } = await supabase
      .from('coupon_codes')
      .insert([coupon])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  updateCoupon: async (id: string, updates: Partial<CouponCode>) => {
    const { data, error } = await supabase
      .from('coupon_codes')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  deleteCoupon: async (id: string) => {
    const { error } = await supabase
      .from('coupon_codes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  validateCoupon: async (code: string) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('coupon_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('expiry_date', now)
      .single();
    
    if (error) return null;
    return data as CouponCode;
  },
  createCustomBundleOrder: async (orderData: any) => {
    const payload = {
      userId: orderData.user_id || orderData.userId,
      userName: orderData.userName || orderData.user_name,
      userEmail: orderData.userEmail || orderData.user_email,
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: orderData.paymentMethod || orderData.payment_method,
      address: orderData.address,
      phone: orderData.phone,
      city: orderData.city,
      notes: orderData.notes,
      is_custom_bundle: true
    };
    
    console.log("FINAL CUSTOM BUNDLE PAYLOAD:", payload);

    const { data, error } = await supabase.from('orders').insert([payload]).select();
    if (error) {
      console.error("Supabase createCustomBundleOrder error:", error);
      throw error;
    }
    return data?.[0];
  },

  getUsers: async () => {
    return await adminService.safeFetch<any>('users', []);
  },

  getVendors: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'vendor');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Failed to fetch vendors", err);
      return [];
    }
  },

  getMessages: async () => {
    return await adminService.safeFetch<ContactMessage>('contact_messages', []);
  },
  addMessage: async (message: any) => {
    const { data, error } = await supabase.from('contact_messages').insert([message]).select();
    if (error) throw error;
    return data?.[0];
  },
  deleteMessage:async (id: string) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
  },
  searchAdminResources: async (query: string) => {
    if (!query.trim()) return null;
    const lowQuery = query.toLowerCase().trim();
    
    // Fetch all resources in parallel for cross-resource search
    const [orders, products, services, customers, reviews, messages, deals, invoices] = await Promise.all([
      adminService.getOrders(),
      adminService.getProducts(),
      adminService.getServices(),
      adminService.getUsers(),
      adminService.getReviews(),
      adminService.getMessages(),
      adminService.getDeals(),
      adminService.getInvoices()
    ]);

    const filterFn = (item: any, fields: string[]) => {
      return fields.some(field => {
        const val = item[field];
        if (typeof val === 'string') return val.toLowerCase().includes(lowQuery);
        if (typeof val === 'number') return val.toString().includes(lowQuery);
        return false;
      });
    };

    return {
      orders: orders.filter(o => 
        filterFn(o, ['id', 'userName', 'userEmail', 'phone', 'status', 'city', 'address']) ||
        (o.items && Array.isArray(o.items) && o.items.some((item: any) => 
          (item.item?.title || item.title || '').toLowerCase().includes(lowQuery)
        ))
      ),
      products: products.filter(p => filterFn(p, ['title', 'category', 'description'])),
      services: services.filter(s => filterFn(s, ['title', 'category', 'description'])),
      customers: customers.filter(c => filterFn(c, ['name', 'fullName', 'email', 'phone'])),
      reviews: reviews.filter(r => filterFn(r, ['user_name', 'comment']) || r.rating.toString() === lowQuery),
      messages: messages.filter(m => filterFn(m, ['name', 'email', 'subject', 'message'])),
      deals: deals.filter(d => filterFn(d, ['title', 'description'])),
      invoices: invoices.filter(i => filterFn(i, ['id', 'order_id', 'status']))
    };
  },

  searchPublicResources: async (query: string) => {
    if (!query.trim()) return null;
    const lowQuery = query.toLowerCase().trim();

    const [products, services, deals, reviews] = await Promise.all([
      adminService.getProducts(),
      adminService.getServices(),
      adminService.getDeals(),
      adminService.getApprovedReviews()
    ]);

    const filterFn = (item: any, fields: string[]) => {
      return fields.some(field => {
        const val = item[field];
        if (typeof val === 'string') return val.toLowerCase().includes(lowQuery);
        return false;
      });
    };

    return {
      products: products.filter(p => p.status === 'active' && filterFn(p, ['title', 'category', 'description'])),
      services: services.filter(s => s.status === 'active' && filterFn(s, ['title', 'category', 'description'])),
      deals: deals.filter(d => d.status === 'active' && filterFn(d, ['title', 'description'])),
      reviews: reviews.filter(r => filterFn(r, ['user_name', 'comment']) && r.status === 'approved'),
      orders: [],
      invoices: []
    };
  },

  searchUserResources: async (query: string, userId: string) => {
    if (!query.trim()) return null;
    const lowQuery = query.toLowerCase().trim();

    const [publicData, orders, invoices] = await Promise.all([
      adminService.searchPublicResources(query),
      adminService.getUserOrders(userId),
      adminService.getUserInvoices(userId)
    ]);

    const filterFn = (item: any, fields: string[]) => {
      return fields.some(field => {
        const val = item[field];
        if (typeof val === 'string') return val.toLowerCase().includes(lowQuery);
        return false;
      });
    };

    return {
      ...publicData,
      orders: orders.filter(o => 
        filterFn(o, ['id', 'status', 'city', 'address']) ||
        (o.items && Array.isArray(o.items) && o.items.some((item: any) => 
          (item.item?.title || item.title || '').toLowerCase().includes(lowQuery)
        ))
      ),
      invoices: invoices.filter(i => filterFn(i, ['id', 'order_id', 'status']))
    };
  },

  getReviews: async (itemId?: string) => {
    try {
      let query = supabase.from('reviews').select('*');
      if (itemId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(itemId)) return [];
        query = query.eq('item_id', itemId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Critical error fetching reviews:", err);
      return [];
    }
  },
  getApprovedReviews: async (itemId?: string) => {
    try {
      let query = supabase.from('reviews').select('*').eq('status', 'approved');
      if (itemId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(itemId)) return [];
        query = query.eq('item_id', itemId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Critical error fetching approved reviews:", err);
      return [];
    }
  },
  deleteReview: async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
  },
  updateReviewStatus: async (id: string, status: string) => {
    console.log(`Admin Service: Requesting status update for review ID: ${id} to ${status}`);
    
    if (!id) {
      throw new Error("Review ID is required for status update.");
    }

    // Try a direct update. Note: We use .select() to get the updated record back.
    // If RLS is enabled, we must ensure the admin has update permissions.
    const { data, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Supabase Error during review status update:", error.message, error.details);
      throw error;
    }

    // If update affected 0 rows, let's try a fallback check: maybe it's under 'uid' or some other name?
    // But per user request, it should be 'id'.
    if (!data || data.length === 0) {
      console.warn(`No record found with ID: ${id}. Attempting to check table structure...`);
      
      // Fallback: Verify if the record exists at all to give a better error
      const { data: checkData } = await supabase.from('reviews').select('id').eq('id', id).single();
      
      if (!checkData) {
        throw new Error(`Critical: Review record with ID ${id} does not exist in the database.`);
      } else {
        throw new Error(`Permission Denied: Record exists but update was rejected. Check Supabase RLS policies.`);
      }
    }

    console.log("Admin Service: Review status updated successfully.");
    return data[0];
  },
  updateReview: async (id: string, data: { user_name?: string; comment?: string; rating?: number; status?: string }) => {
    const { error } = await supabase.from('reviews').update(data).eq('id', id);
    if (error) throw error;
  },
  getInvoices: async () => {
    return await adminService.safeFetch<Invoice>('invoices', []);
  },
  getUserProfile: async (userId: string) => {
    try {
      const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      return data;
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      return null;
    }
  },
  getUserRole: async (userId: string) => {
    try {
      const { data } = await supabase.from('users').select('role').eq('id', userId).maybeSingle();
      return data?.role;
    } catch (err) {
      return null;
    }
  },
  getCustomerEngagement: async (userId: string) => {
    try {
      console.log("Fetching engagement for User ID (userid):", userId);
      
      const [ordersRes, reviewsRes, invoicesRes, draftsRes] = await Promise.allSettled([
        adminService.getUserOrders(userId),
        adminService.getUserReviews(userId),
        adminService.getUserInvoices(userId),
        adminService.getUserDrafts(userId)
      ]);

      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value : [];
      const reviews = reviewsRes.status === 'fulfilled' ? reviewsRes.value : [];
      const invoices = invoicesRes.status === 'fulfilled' ? invoicesRes.value : [];
      const drafts = draftsRes.status === 'fulfilled' ? draftsRes.value : [];

      console.log("Engagement Results:", { orders, reviews, invoices, drafts });

      return {
        orders: orders || [],
        reviews: reviews || [],
        invoices: invoices || [],
        drafts: drafts || []
      };
    } catch (err) {
      console.error("Failed to fetch customer engagement history", err);
      return { orders: [], reviews: [], invoices: [], drafts: [] };
    }
  },
  submitReview: async (review: Omit<Review, 'id' | 'created_at'>) => {
    try {
      const payload = { ...review, status: review.status || 'pending' };
      
      // Strict UUID validation for item_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (payload.item_id && !uuidRegex.test(payload.item_id)) {
        console.warn(`Review item_id ${payload.item_id} is not a valid UUID. Using NULL as fallback.`);
        payload.item_id = null;
      }

      const { data, error } = await supabase.from('reviews').insert([payload]).select();
      if (error) throw error;
      return data?.[0];
    } catch (err) {
      console.error("Review submission failed:", err);
      throw err;
    }
  },
  checkPurchaseStatus: async (userId: string, itemId: string) => {
    try {
      // If itemId is not a UUID, check if it's a custom bundle first
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isUUID = uuidRegex.test(itemId);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('items')
        .eq('userId', userId);
      
      if (error) throw error;
      if (!orders) return false;

      // Check each order to see if the item exists in the JSON array
      return orders.some((order: any) => {
        const items = order.items || [];
        return items.some((cartItem: any) => cartItem.item.id === itemId);
      });
    } catch (err) {
      console.error("Check purchase status failed:", err);
      return false;
    }
  },

  // SEEDING
  seedDummyCategories: async () => {
    const categoriesWithoutId = STATIC_CATEGORIES.map(({ id: _id, ...cat }) => cat);
    const { error } = await supabase.from('categories').insert(categoriesWithoutId);
    if (error) {
      console.error("Seed Categories Error:", error.message);
      throw error;
    }
  },
  seedDummyProducts: async () => {
    const productsWithoutId = STATIC_PRODUCTS.map(({ id: _id, ...p }) => p);
    const { error } = await supabase.from('products').insert(productsWithoutId);
    if (error) {
      console.error("Seed Products Error:", error.message);
      throw error;
    }
    
    // Trigger bulk reviews for seeded items
    import('./reviewGenerator').then(({ bulkGenerateMissingReviews }) => bulkGenerateMissingReviews());
  },
  seedDummyServices: async () => {
    const servicesWithoutId = STATIC_SERVICES.map(({ id: _id, ...s }) => s);
    const { error } = await supabase.from('services').insert(servicesWithoutId);
    if (error) {
      console.error("Seed Services Error:", error.message);
      throw error;
    }

    // Trigger bulk reviews for seeded items
    import('./reviewGenerator').then(({ bulkGenerateMissingReviews }) => bulkGenerateMissingReviews());
  },


  // ---------------------------------------------------------
  // NEW PERSISTENT STORAGE METHODS (Relational)
  // ---------------------------------------------------------

  trackEvent: async (eventName: string, metadata: any = {}, userId?: string, guestId?: string) => {
    try {
      await supabase.from('user_tracks').insert([{
        user_id: userId,
        guest_id: guestId,
        event_name: eventName,
        url: window.location.pathname,
        metadata,
        user_agent: navigator.userAgent
      }]);
    } catch (e) {
      console.warn("Tracking failed", e);
    }
  },

  // CARTS
  getOrCreateCart: async (userId?: string, guestId?: string) => {
    try {
      let query = supabase.from('carts').select('*, cart_items(*)');
      
      if (userId) query = query.eq('user_id', userId);
      else if (guestId) query = query.eq('guest_id', guestId);
      else return null;

      const { data, error } = await query.eq('status', 'active').maybeSingle();
      
      if (data) return data;

      // Create new if none exists
      const { data: newCart, error: createError } = await supabase.from('carts').insert([{
        user_id: userId || null,
        guest_id: guestId || null,
        status: 'active'
      }]).select().single();

      if (createError) throw createError;
      return { ...newCart, cart_items: [] };
    } catch (err) {
      console.error("Cart retrieval failed", err);
      return null;
    }
  },

  updateCartItem: async (cartId: string, item: any) => {
    const { id, ...itemData } = item;
    if (id) {
       return await supabase.from('cart_items').update(itemData).eq('id', id);
    } else {
       return await supabase.from('cart_items').insert([{ ...itemData, cart_id: cartId }]);
    }
  },

  removeFromCart: async (itemId: string) => {
    return await supabase.from('cart_items').delete().eq('id', itemId);
  },

  mergeGuestCart: async (guestId: string, userId: string) => {
    // 1. Get guest cart
    const { data: guestCart } = await supabase.from('carts')
      .select('*, cart_items(*)')
      .eq('guest_id', guestId)
      .eq('status', 'active')
      .maybeSingle();

    if (!guestCart || !guestCart.cart_items || guestCart.cart_items.length === 0) return;

    // 2. Get or create user cart
    const userCart = await adminService.getOrCreateCart(userId);
    if (!userCart) return;

    // 3. Move items
    for (const item of guestCart.cart_items) {
       const { id, cart_id, created_at, updated_at, ...cleanItem } = item;
       await supabase.from('cart_items').insert([{ ...cleanItem, cart_id: userCart.id }]);
    }

    // 4. Archive guest cart
    await supabase.from('carts').update({ status: 'converted' }).eq('id', guestCart.id);
  },

  // BUNDLES (User Custom Bundles)
  saveUserBundle: async (bundle: any, userId?: string, guestId?: string) => {
     try {
       const { items, ...bundleMeta } = bundle;
       const { data: savedBundle, error } = await supabase.from('user_bundles').insert([{
         ...bundleMeta,
         user_id: userId,
         guest_id: guestId
       }]).select().single();

       if (error) throw error;

       if (items && items.length > 0) {
         const bundleItems = items.map((i: any) => ({
           bundle_id: savedBundle.id,
           product_id: i.type === 'product' ? i.item.id : null,
           service_id: i.type === 'service' ? i.item.id : null,
           type: i.type,
           quantity: i.quantity,
           unit_price: i.item.price
         }));
         await supabase.from('user_bundle_items').insert(bundleItems);
       }
       return savedBundle;
     } catch (err) {
       console.error("Bundle save failed", err);
       throw err;
     }
  },

  // DIAGNOSTICS
  checkTableStructures: async () => {
    const results: Record<string, boolean> = {};
    const tables = ['products', 'services', 'categories', 'gallery', 'reviews', 'user_drafts', 'users'];
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        results[table] = !error;
      } catch (err) { results[table] = false; }
    }
    return results;
  },

  getProductsByIds: async (ids: string[]) => {
    try {
      if (!ids.length) return [];
      const { data, error } = await supabase.from('products').select('*').in('id', ids);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Batch product fetch failed", err);
      return [];
    }
  },
  getProductById: async (id: string) => {
    if (_productsCache[id]) {
      return _productsCache[id];
    }
    try {
      // Validate UUID before querying to avoid Postgres error
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return STATIC_PRODUCTS.find(p => p.id === id) || null;
      }

      const { data, error } = await supabase.from('products')
        .select('*, product_variants(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        // Fallback to static
        return STATIC_PRODUCTS.find(p => p.id === id) || null;
      }
      
      // Normalize variants key if returned as product_variants from join
      if (data.product_variants) {
        data.variants = data.product_variants;
        delete data.product_variants;
      }

      _productsCache[id] = data;
      return data;
    } catch (err) {
      console.error("Fetch product by ID failed", err);
      return STATIC_PRODUCTS.find(p => p.id === id) || null;
    }
  },
  getServicesByIds: async (ids: string[]) => {
    try {
      if (!ids.length) return [];
      const { data, error } = await supabase.from('services').select('*').in('id', ids);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Batch service fetch failed", err);
      return [];
    }
  },
  getServiceById: async (id: string) => {
    if (_servicesCache[id]) {
      return _servicesCache[id];
    }
    try {
      // Validate UUID before querying to avoid Postgres error
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return STATIC_SERVICES.find(s => s.id === id) || null;
      }

      const { data, error } = await supabase.from('services').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) {
        // Fallback to static
        return STATIC_SERVICES.find(s => s.id === id) || null;
      }
      _servicesCache[id] = data;
      return data;
    } catch (err) {
      console.error("Fetch service by ID failed", err);
      return STATIC_SERVICES.find(s => s.id === id) || null;
    }
  },

  // USER DRAFTS (Simple JSON Persistence)
  saveUserDraft: async (userId: string, type: 'cart' | 'bundle' | 'product_bundle' | 'service_bundle', items: any) => {
    try {
      if (!userId) return;
      
      const { error } = await supabase
        .from('user_drafts')
        .upsert(
          { 
            user_id: userId, 
            type, 
            items, 
            updated_at: new Date().toISOString() 
          }, 
          { onConflict: 'user_id, type' }
        );

      if (error) throw error;
    } catch (err: any) {
      console.error(`Supabase: Failed to save ${type} draft`, err.message);
    }
  },

  getUserDrafts: async (userId: string) => {
    try {
      // Per user schema: user_drafts uses 'user_id'
      const { data, error } = await supabase.from('user_drafts')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error("Fetch user drafts failed:", error);
        return [];
      }
      
      if (!data || data.length === 0) return [];

      // Hydrate items with product/service names
      const hydratedDrafts = await Promise.all(data.map(async (draft) => {
        let itemsArray = [];
        if (Array.isArray(draft.items)) {
          itemsArray = draft.items;
        } else if (draft.items && typeof draft.items === 'object' && Array.isArray(draft.items.items)) {
          itemsArray = draft.items.items;
        } else if (draft.items) {
          // Try to extract any array
          const keys = Object.keys(draft.items);
          const firstArrayKey = keys.find(k => Array.isArray((draft.items as any)[k]));
          if (firstArrayKey) itemsArray = (draft.items as any)[firstArrayKey];
        }

        if (itemsArray.length === 0) return draft;

        const hydratedItems = await Promise.all(itemsArray.map(async (item: any) => {
          // Resolve item ID from various possible structures
          const itemId = item.item_id || item.product_id || item.service_id || item.id || item.itemId || item.item?.id || item.productId;
          if (!itemId) return item;

          const typeHint = (item.type || item.item_type || item.item?.type || '').toLowerCase();

          try {
            // Priority resolution if type hint is available
            if (typeHint.includes('product')) {
              const { data: p } = await supabase.from('products').select('name, title').eq('id', itemId).maybeSingle();
              if (p) return { ...item, resolved_name: p.name || p.title };
            }

            if (typeHint.includes('service')) {
              const { data: s } = await supabase.from('services').select('name, title').eq('id', itemId).maybeSingle();
              if (s) return { ...item, resolved_name: s.name || s.title };
            }

            // Fallback: Check all tables
            const { data: product } = await supabase.from('products').select('name, title').eq('id', itemId).maybeSingle();
            if (product) return { ...item, resolved_name: product.name || product.title };
            
            const { data: service } = await supabase.from('services').select('name, title').eq('id', itemId).maybeSingle();
            if (service) return { ...item, resolved_name: service.name || service.title };
            
            const { data: deal } = await supabase.from('deals').select('title').eq('id', itemId).maybeSingle();
            if (deal) return { ...item, resolved_name: deal.title };
            
            const { data: bundle } = await supabase.from('bundles').select('name, title').eq('id', itemId).maybeSingle();
            if (bundle) return { ...item, resolved_name: bundle.name || bundle.title };

          } catch (e) {
            console.warn(`Hydration failed for item ${itemId}`, e);
          }
          
          return item;
        }));

        return { ...draft, items: hydratedItems };
      }));

      return hydratedDrafts;
    } catch (err) {
      console.error("Error in getUserDrafts:", err);
      return [];
    }
  },

  getUserInvoices: async (userId: string) => {
    try {
      // Per user schema: invoices table uses 'user_id'
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Fetch invoices failed:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Invoices fetch error:", error);
      return [];
    }
  },

  getUserReviews: async (userId: string) => {
    try {
      // Per user schema: reviews table uses 'user_id'
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Reviews fetch failed:", error);
        return [];
      }

      if (!data || data.length === 0) return [];

      // Resolve names for each review
      const hydratedReviews = await Promise.all(data.map(async (review) => {
        let itemName = 'N/A';
        // Per schema: reviews table uses 'item_id'
        const itemId = review.item_id;
        const typeHint = review.item_type;

        if (itemId) {
          try {
            // Priority lookup if type hint available
            if (typeHint === 'product') {
              const { data: p } = await supabase.from('products').select('name, title').eq('id', itemId).maybeSingle();
              if (p) itemName = p.name || p.title || 'N/A';
            } else if (typeHint === 'service') {
              const { data: s } = await supabase.from('services').select('name, title').eq('id', itemId).maybeSingle();
              if (s) itemName = s.name || s.title || 'N/A';
            }

            if (itemName === 'N/A') {
              // Try products
              const { data: product } = await supabase.from('products').select('name, title').eq('id', itemId).maybeSingle();
              if (product) {
                itemName = product.name || product.title || 'N/A';
              } else {
                // Try services
                const { data: service } = await supabase.from('services').select('name, title').eq('id', itemId).maybeSingle();
                if (service) {
                  itemName = service.name || service.title || 'N/A';
                } else {
                  // Try bundles
                  const { data: bundle } = await supabase.from('bundles').select('name, title').eq('id', itemId).maybeSingle();
                  if (bundle) {
                    itemName = bundle.name || bundle.title || 'N/A';
                  }
                }
              }
            }
          } catch (e) {
            console.warn(`Review name resolution failed for item ${itemId}`, e);
          }
        }

        return {
          ...review,
          resolved_name: itemName
        };
      }));

      return hydratedReviews;
    } catch (err) {
      console.error("Reviews fetch error:", err);
      return [];
    }
  },

  getAllOrders: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });
    
    console.log("All Admin Orders Fetched:", data);
    
    if (error) throw error;
    return data || [];
  },
};

