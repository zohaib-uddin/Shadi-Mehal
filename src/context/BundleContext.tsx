import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Service, adminService } from '../lib/adminService';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { formatVariantNameOnly } from '../lib/utils';

export type BundleItem = {
  item: Product | Service;
  type: 'product' | 'service';
  quantity: number;
};

interface BundleContextType {
  productBundleItems: BundleItem[];
  serviceBundleItems: BundleItem[];
  isBuildingBundle: boolean;
  activeBundleTab: 'products' | 'services';
  setActiveBundleTab: (tab: 'products' | 'services') => void;
  startBundle: () => void;
  addToBundle: (item: Product | Service, type: 'product' | 'service') => void;
  removeFromBundle: (itemId: string, type: 'product' | 'service', variantId?: string) => void;
  updateBundleItemQuantity: (itemId: string, quantity: number, type: 'product' | 'service', variantId?: string) => void;
  clearBundle: (type?: 'product' | 'service') => void;
  finalizeProductBundle: () => Promise<void>;
  orderServicesViaWhatsApp: (userData: { name: string; phone: string }) => void;
  cancelBundle: () => void;
}

const BundleContext = createContext<BundleContextType | undefined>(undefined);

export function BundleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [productBundleItems, setProductBundleItems] = useState<BundleItem[]>([]);
  const [serviceBundleItems, setServiceBundleItems] = useState<BundleItem[]>([]);
  const [isBuildingBundle, setIsBuildingBundle] = useState(false);
  const [activeBundleTab, setActiveBundleTab] = useState<'products' | 'services'>('products');
  const [isInitializing, setIsInitializing] = useState(true);

  // Load and Isolation Logic
  useEffect(() => {
    const initializeBundle = async () => {
      // CLEAR current UI state immediately to prevent leakage
      setProductBundleItems([]);
      setServiceBundleItems([]);
      setIsBuildingBundle(false);

      if (user) {
        // Logged-in user: Strictly load from Supabase with 'bundle' type
        try {
          const drafts = await adminService.getUserDrafts(user.id);
          const bundleDraft = drafts.find((d: any) => d.type === 'bundle');
          
          if (bundleDraft && bundleDraft.items) {
            const allItems: BundleItem[] = bundleDraft.items;
            setProductBundleItems(allItems.filter(i => i.type === 'product'));
            setServiceBundleItems(allItems.filter(i => i.type === 'service'));
            
            if (allItems.length > 0) {
              setIsBuildingBundle(true);
            }
          }
        } catch (error) {
          console.error("Bundle: Persistent fetch failed", error);
        }
      } else {
        // Guest user: Load only from localStorage (prefixed for isolation)
        const savedBundleJson = localStorage.getItem('guest_bundle');
        const savedIsBuilding = localStorage.getItem('guest_is_building') === 'true';

        if (savedBundleJson) {
          const allItems: BundleItem[] = JSON.parse(savedBundleJson);
          setProductBundleItems(allItems.filter(i => i.type === 'product'));
          setServiceBundleItems(allItems.filter(i => i.type === 'service'));
        }
        if (savedIsBuilding) setIsBuildingBundle(savedIsBuilding);
      }
      setIsInitializing(false);
    };

    initializeBundle();
  }, [user?.id]); // STRICT dependency on user.id

  // Persistence helper - ISOLATED & UNIFIED
  const persistBundle = async (pItems: BundleItem[], sItems: BundleItem[], building: boolean) => {
    const allItems = [...pItems, ...sItems];
    
    if (user) {
      // Sync unified 'bundle' type to Supabase for specifically this user
      await adminService.saveUserDraft(user.id, 'bundle', allItems);
    } else {
      // Guest bundle data remains local
      localStorage.setItem('guest_bundle', JSON.stringify(allItems));
      localStorage.setItem('guest_is_building', building.toString());
    }
  };

  const startBundle = () => {
    if (!user) {
      toast.error('Please log in to build a custom bundle');
      return;
    }
    setIsBuildingBundle(true);
    persistBundle(productBundleItems, serviceBundleItems, true);
    toast.success('Custom Bundle Mode Activated!', { icon: '🎁' });
  };

  const addToBundle = async (item: Product | Service, type: 'product' | 'service') => {
    if (!isBuildingBundle) {
      startBundle();
      if (!user) return;
    }
    
    let nextPItems = [...productBundleItems];
    let nextSItems = [...serviceBundleItems];

    if (type === 'product') {
      const itemWithVariant = item as any;
      const variantId = itemWithVariant.selectedVariant?.id;

      const existingIdx = nextPItems.findIndex(i => 
        i.item.id === item.id && 
        (variantId ? (i.item as any).selectedVariant?.id === variantId : !(i.item as any).selectedVariant)
      );

      if (existingIdx > -1) {
        if ((item as any).has_variants) {
          toast.error("This product color is already added in bundle.");
          return;
        }
        nextPItems = nextPItems.map((bi, idx) => 
          idx === existingIdx ? { ...bi, quantity: bi.quantity + 1 } : bi
        );
      } else {
        nextPItems.push({ item, type: 'product', quantity: 1 });
      }
      setProductBundleItems(nextPItems);
      setActiveBundleTab('products');
    } else {
      const existingIdx = nextSItems.findIndex(i => i.item.id === item.id);
      if (existingIdx > -1) {
        nextSItems = nextSItems.map((bi, idx) => 
          idx === existingIdx ? { ...bi, quantity: bi.quantity + 1 } : bi
        );
      } else {
        nextSItems.push({ item, type: 'service', quantity: 1 });
      }
      setServiceBundleItems(nextSItems);
      setActiveBundleTab('services');
    }
    
    const variantDetails = (item as any).selectedVariant 
      ? formatVariantNameOnly((item as any).selectedVariant.color_name, (item as any).selectedVariant.size)
      : '';
    const displayTitle = variantDetails 
      ? `${item.title} (${variantDetails})`
      : item.title;

    toast.success(`${displayTitle} added to bundle`);
    
    await persistBundle(nextPItems, nextSItems, true);
  };

  const updateBundleItemQuantity = async (itemId: string, quantity: number, type: 'product' | 'service', variantId?: string) => {
    if (quantity <= 0) {
      removeFromBundle(itemId, type, variantId);
      return;
    }

    let nextPItems = [...productBundleItems];
    let nextSItems = [...serviceBundleItems];

    if (type === 'product') {
      nextPItems = nextPItems.map(i => {
        const isMatch = i.item.id === itemId && 
          (variantId ? (i.item as any).selectedVariant?.id === variantId : !(i.item as any).selectedVariant);
        return isMatch ? { ...i, quantity } : i;
      });
      setProductBundleItems(nextPItems);
    } else {
      nextSItems = nextSItems.map(i => i.item.id === itemId ? { ...i, quantity } : i);
      setServiceBundleItems(nextSItems);
    }

    await persistBundle(nextPItems, nextSItems, true);
  };

  const removeFromBundle = async (itemId: string, type: 'product' | 'service', variantId?: string) => {
    let nextPItems = [...productBundleItems];
    let nextSItems = [...serviceBundleItems];

    if (type === 'product') {
      nextPItems = nextPItems.filter(i => {
        const isMatch = i.item.id === itemId && 
          (variantId ? (i.item as any).selectedVariant?.id === variantId : !(i.item as any).selectedVariant);
        return !isMatch;
      });
      setProductBundleItems(nextPItems);
    } else {
      nextSItems = nextSItems.filter(i => i.item.id !== itemId);
      setServiceBundleItems(nextSItems);
    }

    await persistBundle(nextPItems, nextSItems, true);
  };

  const clearBundle = async (type?: 'product' | 'service') => {
    let nextPItems = [...productBundleItems];
    let nextSItems = [...serviceBundleItems];

    if (type === 'product') {
      nextPItems = [];
      setProductBundleItems([]);
    } else if (type === 'service') {
      nextSItems = [];
      setServiceBundleItems([]);
    } else {
      nextPItems = [];
      nextSItems = [];
      setProductBundleItems([]);
      setServiceBundleItems([]);
    }

    await persistBundle(nextPItems, nextSItems, true);
  };

  const cancelBundle = async () => {
    setIsBuildingBundle(false);
    setProductBundleItems([]);
    setServiceBundleItems([]);
    
    if (user) {
      await adminService.saveUserDraft(user.id, 'bundle', []);
    } else {
      localStorage.removeItem('guest_bundle');
      localStorage.removeItem('guest_is_building');
    }
  };

  const finalizeProductBundle = async (): Promise<any> => {
    if (productBundleItems.length === 0) {
      toast.error('Product bundle is empty');
      return null;
    }

    const totalPrice = productBundleItems.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
    const bundleData = {
      id: crypto.randomUUID(),
      title: `Custom Product Bundle`,
      price: totalPrice,
      totalPrice: totalPrice, // For consistency
      img: productBundleItems[0].item.img,
      isCustom: true,
      items: productBundleItems,
      type: 'bundle'
    };

    return bundleData;
  };

  const orderServicesViaWhatsApp = async (userData: { name: string; phone: string }) => {
    // This is now handled by components using the initiateWhatsAppOrder hook
    console.log("DEPRECATED: Use useWhatsAppOrder hook instead");
  };

  return (
    <BundleContext.Provider value={{ 
      productBundleItems,
      serviceBundleItems,
      isBuildingBundle,
      activeBundleTab,
      setActiveBundleTab,
      startBundle,
      addToBundle, 
      removeFromBundle,
      updateBundleItemQuantity, 
      clearBundle,
      finalizeProductBundle,
      orderServicesViaWhatsApp,
      cancelBundle 
    }}>
      {!isInitializing && children}
    </BundleContext.Provider>
  );
}

export function useBundle() {
  const context = useContext(BundleContext);
  if (context === undefined) {
    throw new Error('useBundle must be used within a BundleProvider');
  }
  return context;
}
