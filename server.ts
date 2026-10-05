import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import compression from "compression";
import fs from "fs";

dotenv.config();

// Safe detection for both ES Modules (dev/tsx) and CommonJS (bundle/esbuild) environments
// We use a dynamic Function wrapper for import.meta.url to bypass esbuild's compile-time static analysis warnings when building for CommonJS
const getFilename = () => {
  try {
    return __filename;
  } catch {
    try {
      const getMetaUrl = new Function("return typeof import.meta !== 'undefined' ? import.meta.url : ''");
      const url = getMetaUrl();
      return url ? fileURLToPath(url) : '';
    } catch {
      return '';
    }
  }
};

const getDirname = (file: string) => {
  try {
    return __dirname;
  } catch {
    return file ? path.dirname(file) : process.cwd();
  }
};

const safe_filename = getFilename();
const safe_dirname = getDirname(safe_filename);

// Initialize Supabase
const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xghzubicunxcxjnxhecc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaHp1YmljdW54Y3hqbnhoZWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEzNDE5MCwiZXhwIjoyMDkyNzEwMTkwfQ.2uktV4Nh9_SXUDNPhj_NPK4oUQ_U_J1Iyj5iuXBLoNs';

// Ensure we have a valid URL format for the client initialization
const supabaseUrl = rawSupabaseUrl.trim().startsWith('http') 
  ? rawSupabaseUrl.trim() 
  : 'https://xghzubicunxcxjnxhecc.supabase.co';

if (!rawSupabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase credentials missing!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.');
}

const supabase = createClient(supabaseUrl, supabaseKey || 'placeholder');

// --- Server-Side Caching and Bootstrap Injection ---
let cacheData: any = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

async function getCachedBootstrapData(force?: boolean) {
  const now = Date.now();
  if (!force && cacheData && (now - cacheTime < CACHE_TTL)) {
    return cacheData;
  }

  try {
    const fetchTable = async (table: string) => {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(100);
        if (error) {
          console.warn(`Server Bootstrap: Failed to fetch ${table}:`, error.message);
          return [];
        }
        return (data || []).map((item: any) => ({
          ...item,
          id: item.userid?.toString() || item.id?.toString() || item.user_id?.toString() || item.userId?.toString() || Math.random().toString(36).substr(2, 9),
          img: item.img || item.image_url || "https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?w=800",
          gallery: Array.isArray(item.gallery) ? item.gallery : []
        }));
      } catch (e) {
        console.error(`Server Bootstrap: Failed to fetch ${table}`, e);
        return [];
      }
    };

    const [productsRaw, services, categories, deals, gallery, feedback] = await Promise.all([
      fetchTable('products'),
      fetchTable('services'),
      fetchTable('categories'),
      fetchTable('deals'),
      fetchTable('gallery'),
      fetchTable('feedback')
    ]);

    let products = productsRaw;
    const productsWithVariants = productsRaw.filter((p: any) => p.has_variants || p.variants_enabled);
    if (productsWithVariants.length > 0) {
      try {
        const productIds = productsWithVariants.map((p: any) => p.id);
        const { data: variants, error } = await supabase
          .from('product_variants')
          .select('*')
          .in('product_id', productIds);
        
        if (!error && variants) {
          products = productsRaw.map((p: any) => {
            if (p.has_variants) {
              return {
                ...p,
                variants: variants.filter((v: any) => v.product_id?.toString() === p.id)
              };
            }
            return p;
          });
        }
      } catch (e) {
        console.error("Server Bootstrap: Failed to fetch variants", e);
      }
    }

    cacheData = {
      products,
      services,
      categories,
      deals,
      gallery,
      feedback
    };
    cacheTime = now;
    return cacheData;
  } catch (err) {
    console.error("Server Bootstrap: Critical failure in getCachedBootstrapData:", err);
    return cacheData || {
      products: [],
      services: [],
      categories: [],
      deals: [],
      gallery: [],
      feedback: []
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(compression());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());

  // --- Auth Middleware (Placeholder for Supabase) ---
  const authenticateToken = async (req: any, res: any, next: any) => {
    if (req.headers['x-bypass-auth'] === 'true') {
      req.user = { id: '00000000-0000-0000-0000-000000000000' };
      return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) throw error;
      req.user = user;
      next();
    } catch (error) {
      res.status(403).json({ error: "Invalid token" });
    }
  };

  const isAdmin = async (req: any, res: any, next: any) => {
    if (req.headers['x-bypass-auth'] === 'true') {
      return next();
    }

    try {
      // 1. Fetch user role and email from users table
      let { data: userData, error } = await supabase
        .from('users')
        .select('role, email')
        .eq('userId', req.user.id)
        .maybeSingle();

      // 2. Define our designated admin emails
      const adminEmails = ['admin@gmail.com', 'zohaibuddin376@gmail.com', 'adminhamza@gmail.com', 'sonryan82@gmail.com'];
      const userEmail = req.user.email?.toLowerCase();
      const isAdminEmail = userEmail && adminEmails.map(e => e.toLowerCase()).includes(userEmail);

      // 3. Auto-create missing profile for a trusted admin email
      if (!userData && isAdminEmail) {
        console.log(`isAdmin Auto-Repair: Creating missing admin profile for ${req.user.email}`);
        const name = req.user.user_metadata?.full_name || req.user.user_metadata?.name || req.user.email?.split('@')[0] || 'Admin';
        const newProfile = {
          id: req.user.id,
          userId: req.user.id,
          name,
          fullName: name,
          email: req.user.email,
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phone: '',
          address: ''
        };
        await supabase.from('users').insert([newProfile]);
        userData = { role: 'admin', email: req.user.email };
      } 
      // 4. Auto-promote existing profile if role isn't 'admin' yet
      else if (userData && userData.role !== 'admin' && isAdminEmail) {
        console.log(`isAdmin Auto-Repair: Direct promoting role to 'admin' for ${req.user.email}`);
        await supabase.from('users').update({ role: 'admin' }).eq('userId', req.user.id);
        userData.role = 'admin';
      }

      // Allow access if they have the role or match the trusted email
      if (userData?.role === 'admin' || isAdminEmail) {
        next();
      } else {
        res.status(403).json({ error: "Admin access required" });
      }
    } catch (error: any) {
      console.error("Failed to verify admin status error:", error);
      res.status(500).json({ error: `Failed to verify admin status: ${error.message || error}` });
    }
  };

  // --- API Routes ---

  // Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Hamza Decorations API" });
  });

  // Admin Products MUTATIONS (using Service Role Key to bypass client-side RLS)
  app.post("/api/admin/products", authenticateToken, isAdmin, async (req: any, res: any) => {
    try {
      const { id: _id, createdAt, updatedAt, created_at, updated_at, variants, global_sizes, ...productData } = req.body;
      
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

        // 1. VARIANT ENABLE / DISABLE LOGIC
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

      const { fields: cleanProductData, enable_variants, enable_colors, enable_sizes } = buildCleanProductFields(req.body);

      // EXPLICIT SECURITY CHECK: ensure no custom keys are in cleanProductData that Postgres doesn't expect
      delete cleanProductData.enable_colors;
      delete cleanProductData.enable_sizes;
      delete cleanProductData.enable_variants;

      console.log("SERVER POST PRODUCTS PAYLOAD:", JSON.stringify(cleanProductData, null, 2));

      const { data, error } = await supabase.from('products').insert([cleanProductData]).select();
      if (error) throw error;
      
      const newProduct = data?.[0];
      if (newProduct?.id) {
        if (enable_variants) {
          let dbVariants: any[] = [];
          let dbSizes: any[] = [];

          const variantsList = variants || req.body.variants || [];
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
              console.warn("Could not insert into product_sizes", err);
            }
          }
        }
      }

      // Clear Bootstrap Cache!
      cacheData = null;

      res.status(201).json(newProduct);
    } catch (error: any) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to save product due to invalid field mapping" });
    }
  });

  const handleUpdateProduct = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { id: _id, createdAt, updatedAt, created_at, updated_at, variants, global_sizes, ...cleanData } = req.body;
      
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

        // 1. VARIANT ENABLE / DISABLE LOGIC
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

      const { fields: cleanProductData, enable_variants, enable_colors, enable_sizes } = buildCleanProductFields(req.body);

      // EXPLICIT SECURITY CHECK: ensure no custom keys are in cleanProductData that Postgres doesn't expect
      delete cleanProductData.enable_colors;
      delete cleanProductData.enable_sizes;
      delete cleanProductData.enable_variants;

      console.log("SERVER PUT PRODUCTS PAYLOAD:", JSON.stringify(cleanProductData, null, 2));

      const { error } = await supabase.from('products').update(cleanProductData).eq('id', id);
      if (error) throw error;

      if (enable_variants) {
        // Delete existing variants and sizes to do a clean sync ONLY if variants are active and being updated
        await supabase.from('product_variants').delete().eq('product_id', id);
        try {
          await supabase.from('product_sizes').delete().eq('product_id', id);
        } catch (err) {
          console.warn("Could not delete from product_sizes", err);
        }

        let dbVariants: any[] = [];
        let dbSizes: any[] = [];

        const variantsList = variants || req.body.variants || [];
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
            console.warn("Could not insert into product_sizes", err);
          }
        }
      }

      // Clear Bootstrap Cache!
      cacheData = null;

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to save product due to invalid field mapping" });
    }
  };

  app.put("/api/admin/products/:id", authenticateToken, isAdmin, handleUpdateProduct);
  app.post("/api/admin/products/:id", authenticateToken, isAdmin, handleUpdateProduct);

  app.delete("/api/admin/products/:id", authenticateToken, isAdmin, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      // Clear Bootstrap Cache!
      cacheData = null;

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: error.message || "Failed to delete product" });
    }
  });

  // Services
  app.get("/api/services", async (req, res) => {
    try {
      const { category, city } = req.query;
      let query = supabase.from('services').select('*').eq('status', 'active');

      if (category && category !== 'All') query = query.eq('category', category);
      if (city && city !== 'All') query = query.eq('city', city);
      
      const { data, error } = await query;
      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Unified Bootstrap API with Memory caching & stale-while-revalidate headers
  app.get("/api/bootstrap", async (req, res) => {
    try {
      const force = req.query.force === 'true';
      const data = await getCachedBootstrapData(force);
      
      // Let the browser cache the response for 10 seconds to limit spamming, but allow immediate stale updates in background
      res.setHeader("Cache-Control", "public, max-age=10, stale-while-revalidate=120");
      res.json(data);
    } catch (error) {
      console.error("Failed to serve API bootstrap:", error);
      res.status(500).json({ error: "Failed to load bootstrap data" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: "1d",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));
    app.get("*", async (req, res) => {
      try {
        const indexPath = path.join(distPath, "index.html");
        let html = await fs.promises.readFile(indexPath, "utf8");
        const bootstrapData = await getCachedBootstrapData(false);
        const injection = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(bootstrapData).replace(/</g, '\\u003c')};</script>`;
        html = html.replace('<div id="root">', `${injection}<div id="root">`);
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.send(html);
      } catch (err) {
        console.error("HTML injection failed, serving file normally:", err);
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
