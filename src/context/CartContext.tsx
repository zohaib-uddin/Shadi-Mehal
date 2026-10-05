import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Service, Deal, adminService } from '../lib/adminService';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { formatProductVariantName } from '../lib/utils';

export type CartItem = {
  id?: string; // Database ID if persisted
  type: 'service' | 'product' | 'deal';
  item: Service | Product | any;
  quantity: number;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Service | Product | any, type: 'service' | 'product' | 'deal') => Promise<void>;
  removeFromCart: (itemId: string, variantId?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load and Isolation Logic
  useEffect(() => {
    const initializeCart = async () => {
      // CLEAR current UI state immediately to prevent leakage during transition
      setCart([]);
      
      if (user) {
        // Logged-in user: Strictly load from Supabase
        try {
          const drafts = await adminService.getUserDrafts(user.id);
          const cartDraft = drafts.find((d: any) => d.type === 'cart');
          setCart(cartDraft ? cartDraft.items : []);
        } catch (error) {
          console.error("Cart: Persistent fetch failed", error);
          setCart([]);
        }
      } else {
        // Guest user: Load only from localStorage
        const guestCartJson = localStorage.getItem('guest_cart');
        setCart(guestCartJson ? JSON.parse(guestCartJson) : []);
      }
      setIsInitializing(false);
    };

    initializeCart();
  }, [user?.id]); // STRICT dependency on user.id

  // Persistent storage helper
  const syncCart = async (newCart: CartItem[]) => {
    if (user) {
      // Sync only for specific user
      await adminService.saveUserDraft(user.id, 'cart', newCart);
    } else {
      // Guest data remains local
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
    }
  };

  const addToCart = async (item: Service | Product | Deal, type: 'service' | 'product' | 'deal') => {
    // STRICT RULE: Services cannot be added to cart
    if (type === 'service') {
      toast.error('This item can only be ordered via WhatsApp');
      return;
    }

    const itemWithVariant = item as any;
    const variantId = itemWithVariant.selectedVariant?.id;

    const existingIdx = cart.findIndex(i => 
      i.item.id === item.id && 
      i.type === type && 
      (variantId ? i.item.selectedVariant?.id === variantId : !i.item.selectedVariant)
    );

    let nextCart: CartItem[];

    if (existingIdx > -1) {
      nextCart = cart.map((item, idx) => 
        idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      nextCart = [...cart, { item, type, quantity: 1 }];
    }
    
    setCart(nextCart);
    
    const displayTitle = formatProductVariantName(
      itemWithVariant.title,
      itemWithVariant.selectedVariant?.color_name,
      itemWithVariant.selectedVariant?.size
    );

    toast.success(`Added to collection: ${displayTitle}`);
    
    // Perform sync in background or at least after UI updates
    await syncCart(nextCart);
  };

  const updateQuantity = async (itemId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      await removeFromCart(itemId, variantId);
      return;
    }
    const nextCart = cart.map(i => {
      const isMatch = i.item.id === itemId && 
        (variantId ? i.item.selectedVariant?.id === variantId : !i.item.selectedVariant);
      return isMatch ? { ...i, quantity } : i;
    });
    setCart(nextCart);
    await syncCart(nextCart);
  };

  const removeFromCart = async (itemId: string, variantId?: string) => {
    const nextCart = cart.filter(i => {
      const isMatch = i.item.id === itemId && 
        (variantId ? i.item.selectedVariant?.id === variantId : !i.item.selectedVariant);
      return !isMatch;
    });
    setCart(nextCart);
    await syncCart(nextCart);
  };

  const clearCart = async () => {
    setCart([]);
    if (user) {
      await adminService.saveUserDraft(user.id, 'cart', []);
    } else {
      localStorage.removeItem('guest_cart');
    }
  };

  const totalAmount = cart.reduce((total, i) => {
    if (!i.item) return total;
    const price = i.item.price || 0;
    return total + (price * i.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
