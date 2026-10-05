import React, { createContext, useContext, useState, useCallback } from 'react';
import { adminService, Product, Service, STATIC_SERVICES, STATIC_PRODUCTS, STATIC_CATEGORIES, STATIC_DEALS, STATIC_GALLERY } from '../lib/adminService';

interface DataState {
  services: Service[] | null;
  products: Product[] | null;
  categories: any[] | null;
  deals: any[] | null;
  gallery: any[] | null;
  lastFetched: { [key: string]: number };
}

interface DataContextType extends DataState {
  getServices: (force?: boolean) => Promise<Service[]>;
  getProducts: (force?: boolean) => Promise<Product[]>;
  getCategories: (force?: boolean) => Promise<any[]>;
  getDeals: (force?: boolean) => Promise<any[]>;
  getGallery: (force?: boolean) => Promise<any[]>;
  refreshAll: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>(() => {
    // 1. Try server-injected window.__INITIAL_DATA__ first
    const initial = (window as any).__INITIAL_DATA__;
    if (initial && typeof initial === 'object') {
      const hasData = (initial.products && initial.products.length > 0) || (initial.services && initial.services.length > 0);
      if (hasData) {
        // Save to localStorage in the background for subsequent transitions
        const keys = ['services', 'products', 'categories', 'deals', 'gallery'];
        keys.forEach(key => {
          if (initial[key]) {
            try {
              localStorage.setItem(`shadi_mehal_${key}`, JSON.stringify(initial[key]));
              localStorage.setItem(`shadi_mehal_${key}_time`, Date.now().toString());
            } catch (e) {}
          }
        });

        return {
          services: initial.services || null,
          products: initial.products || null,
          categories: initial.categories || null,
          deals: initial.deals || null,
          gallery: initial.gallery || null,
          lastFetched: {
            services: Date.now(),
            products: Date.now(),
            categories: Date.now(),
            deals: Date.now(),
            gallery: Date.now(),
          },
        };
      }
    }

    // 2. Try localStorage cache next
    const loadCached = (key: string) => {
      try {
        const cached = localStorage.getItem(`shadi_mehal_${key}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
      return null;
    };

    const loadTime = (key: string) => {
      try {
        const time = localStorage.getItem(`shadi_mehal_${key}_time`);
        if (time) return parseInt(time, 10);
      } catch (e) {}
      return 0;
    };

    return {
      services: loadCached('services'),
      products: loadCached('products'),
      categories: loadCached('categories'),
      deals: loadCached('deals'),
      gallery: loadCached('gallery'),
      lastFetched: {
        services: loadTime('services'),
        products: loadTime('products'),
        categories: loadTime('categories'),
        deals: loadTime('deals'),
        gallery: loadTime('gallery'),
      },
    };
  });

  const bootstrapPromiseRef = React.useRef<Promise<any> | null>(null);

  const fetchBootstrap = useCallback(async (force?: boolean) => {
    if (bootstrapPromiseRef.current) return bootstrapPromiseRef.current;

    const promise = (async () => {
      try {
        const url = force ? '/api/bootstrap?force=true' : '/api/bootstrap';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Bootstrap API error');
        const data = await res.json();
        
        setState(prev => ({
          ...prev,
          services: data.services || prev.services,
          products: data.products || prev.products,
          categories: data.categories || prev.categories,
          deals: data.deals || prev.deals,
          gallery: data.gallery || prev.gallery,
          lastFetched: {
            services: Date.now(),
            products: Date.now(),
            categories: Date.now(),
            deals: Date.now(),
            gallery: Date.now(),
          }
        }));

        const keys = ['services', 'products', 'categories', 'deals', 'gallery'];
        keys.forEach(key => {
          if (data[key]) {
            try {
              localStorage.setItem(`shadi_mehal_${key}`, JSON.stringify(data[key]));
              localStorage.setItem(`shadi_mehal_${key}_time`, Date.now().toString());
            } catch (e) {}
          }
        });

        return data;
      } catch (e) {
        console.warn('Unified bootstrap failed, falling back:', e);
        throw e;
      } finally {
        bootstrapPromiseRef.current = null;
      }
    })();

    bootstrapPromiseRef.current = promise;
    return promise;
  }, []);

  const shouldFetch = useCallback((key: string, force?: boolean) => {
    if (force) return true;
    const now = Date.now();
    const last = state.lastFetched[key] || 0;
    return !state[key as keyof DataState] || (now - last > CACHE_DURATION);
  }, [state]);

  const getServices = useCallback(async (force?: boolean) => {
    if (!shouldFetch('services', force)) return state.services!;
    try {
      const data = await fetchBootstrap(force);
      if (data.services) return data.services;
    } catch (e) {}

    const data = await adminService.getServices();
    setState(prev => ({ 
      ...prev, 
      services: data, 
      lastFetched: { ...prev.lastFetched, services: Date.now() } 
    }));
    try {
      localStorage.setItem('shadi_mehal_services', JSON.stringify(data));
      localStorage.setItem('shadi_mehal_services_time', Date.now().toString());
    } catch (e) {}
    return data;
  }, [shouldFetch, state.services, fetchBootstrap]);

  const getProducts = useCallback(async (force?: boolean) => {
    if (!shouldFetch('products', force)) return state.products!;
    try {
      const data = await fetchBootstrap(force);
      if (data.products) return data.products;
    } catch (e) {}

    const data = await adminService.getProducts();
    setState(prev => ({ 
      ...prev, 
      products: data, 
      lastFetched: { ...prev.lastFetched, products: Date.now() } 
    }));
    try {
      localStorage.setItem('shadi_mehal_products', JSON.stringify(data));
      localStorage.setItem('shadi_mehal_products_time', Date.now().toString());
    } catch (e) {}
    return data;
  }, [shouldFetch, state.products, fetchBootstrap]);

  const getCategories = useCallback(async (force?: boolean) => {
    if (!shouldFetch('categories', force)) return state.categories!;
    try {
      const data = await fetchBootstrap(force);
      if (data.categories) return data.categories;
    } catch (e) {}

    const data = await adminService.getCategories();
    setState(prev => ({ 
      ...prev, 
      categories: data, 
      lastFetched: { ...prev.lastFetched, categories: Date.now() } 
    }));
    try {
      localStorage.setItem('shadi_mehal_categories', JSON.stringify(data));
      localStorage.setItem('shadi_mehal_categories_time', Date.now().toString());
    } catch (e) {}
    return data;
  }, [shouldFetch, state.categories, fetchBootstrap]);

  const getDeals = useCallback(async (force?: boolean) => {
    if (!shouldFetch('deals', force)) return state.deals!;
    try {
      const data = await fetchBootstrap(force);
      if (data.deals) return data.deals;
    } catch (e) {}

    const data = await adminService.getDeals();
    setState(prev => ({ 
      ...prev, 
      deals: data, 
      lastFetched: { ...prev.lastFetched, deals: Date.now() } 
    }));
    try {
      localStorage.setItem('shadi_mehal_deals', JSON.stringify(data));
      localStorage.setItem('shadi_mehal_deals_time', Date.now().toString());
    } catch (e) {}
    return data;
  }, [shouldFetch, state.deals, fetchBootstrap]);

  const getGallery = useCallback(async (force?: boolean) => {
    if (!shouldFetch('gallery', force)) return state.gallery!;
    try {
      const data = await fetchBootstrap(force);
      if (data.gallery) return data.gallery;
    } catch (e) {}

    const data = await adminService.getGallery();
    setState(prev => ({ 
      ...prev, 
      gallery: data, 
      lastFetched: { ...prev.lastFetched, gallery: Date.now() } 
    }));
    try {
      localStorage.setItem('shadi_mehal_gallery', JSON.stringify(data));
      localStorage.setItem('shadi_mehal_gallery_time', Date.now().toString());
    } catch (e) {}
    return data;
  }, [shouldFetch, state.gallery, fetchBootstrap]);

  const refreshAll = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        lastFetched: {}
      }));
      await fetchBootstrap(true);
    } catch (e) {
      await Promise.all([
        getServices(true),
        getProducts(true),
        getCategories(true),
        getDeals(true),
        getGallery(true)
      ]);
    }
  }, [fetchBootstrap, getServices, getProducts, getCategories, getDeals, getGallery]);

  return (
    <DataContext.Provider value={{ 
      ...state, 
      getServices, 
      getProducts, 
      getCategories, 
      getDeals, 
      getGallery,
      refreshAll
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
