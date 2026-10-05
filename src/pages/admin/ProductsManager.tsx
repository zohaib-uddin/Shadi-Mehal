import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Package,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminService, Product, ProductVariant } from '../../lib/adminService';
import { cn } from '../../lib/utils';
import { ConfirmModal } from '../../components/ConfirmModal';

// High-perf client-side image compression to bypass container payload size limits
function compressBase64(dataUrl: string, maxWidth = 800, maxHeight = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  const [formData, setFormData] = useState<any>({
    title: '',
    price: 0,
    compare_price: 0,
    category: '',
    description: '',
    img: '',
    gallery: [],
    stock: 0,
    status: 'active',
    has_variants: false,
    variants_enabled: false,
    colors_enabled: false,
    sizes_enabled: false,
    variants: [],
    global_sizes: []
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  
  // Size selection modal state for Option 2
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [sizeModalContext, setSizeModalContext] = useState<{ type: 'global' | 'variant'; index?: number }>({ type: 'global' });
  const [selectedModalSizes, setSelectedModalSizes] = useState<string[]>([]);

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      price: 0,
      compare_price: 0,
      category: '',
      description: '',
      img: '',
      gallery: [],
      stock: 0,
      status: 'active',
      has_variants: false,
      variants_enabled: false,
      colors_enabled: false,
      sizes_enabled: false,
      variants: [],
      global_sizes: []
    });
    setImagePreview(null);
    setGalleryPreviews([]);
    setShowColorPicker(null);
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await adminService.getCategories();
      setAvailableCategories(data.filter(c => c.type === 'product' || c.type === 'both'));
    } catch (e) {
      console.error(e);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  // Sum up variant stock quantities to sync with product stock
  useEffect(() => {
    if (formData.has_variants && (formData.colors_enabled || formData.sizes_enabled) && formData.variants && formData.variants.length > 0) {
      const totalStock = formData.variants.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0);
      if (formData.stock !== totalStock) {
        setFormData(prev => ({ ...prev, stock: totalStock }));
      }
    }
  }, [formData.variants, formData.has_variants, formData.colors_enabled, formData.sizes_enabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.title || formData.title.trim() === '') {
        toast.error("Product title is required.");
        return;
      }
      if (formData.price === undefined || formData.price === null || formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
        toast.error("Product price must be a valid number greater than 0.");
        return;
      }
      if (!formData.category || formData.category.trim() === '') {
        toast.error("Product category is required.");
        return;
      }

      if (formData.has_variants) {
        if (!formData.colors_enabled && !formData.sizes_enabled) {
          toast.error("Please enable at least Colors or Sizes options, or disable variants.");
          return;
        }

        const variantsList = formData.variants || [];
        if (variantsList.length === 0) {
          toast.error("Please add at least one variant configuration row.");
          return;
        }

        for (let i = 0; i < variantsList.length; i++) {
          const v = variantsList[i];
          const rowNum = i + 1;

          if (formData.colors_enabled && formData.sizes_enabled) {
            const col = v.color_name || v.color;
            if (!col || col.trim() === '') {
              toast.error(`Color is required in Row #${rowNum}`);
              return;
            }
            if (!v.size || v.size.trim() === '') {
              toast.error(`Size is required in Row #${rowNum}`);
              return;
            }
            const validSizes = ['S', 'M', 'L', 'XL'];
            if (!validSizes.includes(v.size)) {
              toast.error(`Size must be one of S, M, L, XL in Row #${rowNum}`);
              return;
            }
          } else if (formData.colors_enabled) {
            const col = v.color_name || v.color;
            if (!col || col.trim() === '') {
              toast.error(`Color is required in Row #${rowNum}`);
              return;
            }
          } else if (formData.sizes_enabled) {
            if (!v.size || v.size.trim() === '') {
              toast.error(`Size is required in Row #${rowNum}`);
              return;
            }
            const validSizes = ['S', 'M', 'L', 'XL'];
            if (!validSizes.includes(v.size)) {
              toast.error(`Size must be one of S, M, L, XL in Row #${rowNum}`);
              return;
            }
          }

          const stockVal = v.stock_quantity !== undefined ? v.stock_quantity : v.stock;
          if (stockVal === undefined || stockVal === null || stockVal === '') {
            toast.error(`Stock is required in Row #${rowNum}`);
            return;
          }

          const stockNum = Number(stockVal);
          if (isNaN(stockNum) || stockNum < 1) {
            toast.error(`Error: Stock is required and must be at least 1 in Row #${rowNum}`);
            return;
          }
        }
      }

      // Compress images before sending to prevent exceeding ingress body payload limits
      const compressedImg = await compressBase64(formData.img);
      const compressedGallery = await Promise.all(
        (formData.gallery || []).map(g => compressBase64(g))
      );

      const submissionData = {
        title: formData.title,
        price: Number(formData.price),
        compare_price: formData.compare_price !== undefined && formData.compare_price !== null && formData.compare_price !== "" ? Number(formData.compare_price) : 0,
        category: formData.category,
        description: formData.description || "",
        img: compressedImg,
        gallery: compressedGallery,
        stock: Number(formData.stock || 0),
        status: formData.status || 'active',
        // Support all naming styles for variant toggles
        has_variants: !!formData.has_variants,
        variants_enabled: !!formData.has_variants,
        colors_enabled: formData.has_variants ? !!formData.colors_enabled : false,
        sizes_enabled: formData.has_variants ? !!formData.sizes_enabled : false,
        // Normalized variants array mapping color and stock keys correctly
        variants: formData.has_variants ? (formData.variants || []).map((v: any) => {
          const sizeVal = v.size || null;
          const colorNameVal = v.color_name || v.color || null;
          const colorCodeVal = v.color_code || '#000000';
          const stockVal = v.stock_quantity !== undefined ? v.stock_quantity : (v.stock !== undefined ? v.stock : 0);

          return {
            color: formData.colors_enabled ? (colorNameVal || null) : null,
            color_name: formData.colors_enabled ? (colorNameVal || null) : null,
            color_code: formData.colors_enabled ? (colorCodeVal || '#000000') : null,
            size: formData.sizes_enabled ? (sizeVal || null) : null,
            stock: Number(stockVal),
            stock_quantity: Number(stockVal)
          };
        }) : []
      };

      if (editingProduct?.id) {
        await adminService.updateProduct(editingProduct.id, submissionData);
        toast.success("Product updated successfully");
      } else {
        await adminService.addProduct(submissionData);
        toast.success("Product added successfully");
      }
      setIsAdding(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || 'Something went wrong');
    }
  };

  const handleEdit = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      title: 'Edit Product',
      message: `Are you sure you want to edit "${product.title}"?`,
      type: 'info',
      onConfirm: () => {
        setEditingProduct(product);
        
        const isEnabled = !!(product.variants_enabled || product.has_variants || false);
        const isColors = !!(product.colors_enabled || false);
        const isSizes = !!(product.sizes_enabled || false);
        const dbVars = product.variants || [];

        let editVariants: any[] = [];
        if (dbVars.length > 0) {
          editVariants = dbVars.map((v: any) => ({
            color_name: v.color_name || v.color || '',
            color_code: v.color_code || '#000000',
            size: v.size || '',
            stock_quantity: v.stock_quantity !== undefined ? v.stock_quantity : (v.stock !== undefined ? v.stock : 0)
          }));
        }

        setFormData({
          title: product.title,
          price: product.price,
          compare_price: product.compare_price || 0,
          category: product.category,
          description: product.description,
          img: product.img,
          gallery: product.gallery || [],
          stock: product.stock,
          status: product.status,
          has_variants: isEnabled,
          variants_enabled: isEnabled,
          colors_enabled: isColors,
          sizes_enabled: isSizes,
          variants: editVariants,
          global_sizes: []
        });
        setImagePreview(product.img || null);
        setGalleryPreviews(product.gallery || []);
        setIsAdding(true);
      }
    });
  };

    const addVariant = () => {
        const newVariant = {
            color_name: formData.colors_enabled ? '' : '',
            color_code: formData.colors_enabled ? '#000000' : '#000000',
            size: formData.sizes_enabled ? '' : '',
            stock_quantity: 0
        };
        setFormData({
            ...formData,
            variants: [...(formData.variants || []), newVariant]
        });
    };

    const removeVariant = (index: number) => {
        const updatedVariants = [...(formData.variants || [])];
        updatedVariants.splice(index, 1);
        setFormData({ ...formData, variants: updatedVariants });
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const updatedVariants = [...(formData.variants || [])];
        let finalValue = value;
        if (field === 'stock_quantity') {
            const numVal = Number(value);
            finalValue = isNaN(numVal) || numVal < 0 ? 0 : numVal;
        }
        updatedVariants[index] = { ...updatedVariants[index], [field]: finalValue };
        setFormData({ ...formData, variants: updatedVariants });
    };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product?.title || 'this product'}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteProduct(id);
          await loadProducts();
        } catch (err: any) {
          console.error("Delete failed", err);
          alert("Failed to delete product: " + (err.message || 'Unknown error'));
        }
      }
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-200 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-primary/5 shadow-sm"
            >
                <option value="All">All Categories</option>
                {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <button 
                onClick={() => { resetForm(); setIsAdding(true); }}
                className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
            >
                <Plus className="w-5 h-5" />
                Add New Product
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
            {isAdding && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] border-2 border-dashed border-primary/40 shadow-xl overflow-hidden"
                >
                    <h3 className="text-xl md:text-2xl font-serif italic text-slate-900 mb-6 md:mb-8">{editingProduct ? 'Edit Product' : 'Launch New Product'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-4">
                            <input 
                                required
                                placeholder="Product Title"
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    required
                                    type="number"
                                    placeholder="Selling Price"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                    value={formData.price || ''}
                                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                />
                                <input 
                                    type="number"
                                    placeholder="Compare Price"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                    value={formData.compare_price || ''}
                                    onChange={(e) => setFormData({...formData, compare_price: Number(e.target.value)})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    required
                                    type="number"
                                    min="0"
                                    placeholder="Stock Account"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                    value={formData.stock || ''}
                                    onChange={(e) => {
                                        const numVal = Number(e.target.value);
                                        const clampedVal = isNaN(numVal) || numVal < 0 ? 0 : numVal;
                                        setFormData({...formData, stock: clampedVal});
                                    }}
                                />
                                <select 
                                    required
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="">Select Category</option>
                                    {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center gap-8 bg-slate-50 p-4 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visibility:</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={formData.status === 'active'}
                                            onChange={(e) => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})}
                                            className="w-5 h-5 rounded border-slate-200 text-primary focus:ring-primary"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                            {formData.status === 'active' ? 'Public' : 'Hidden'}
                                        </span>
                                    </label>
                                </div>

                                 <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Variants:</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={formData.has_variants}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormData({
                                                    ...formData,
                                                    has_variants: checked,
                                                    variants_enabled: checked ? true : formData.variants_enabled,
                                                    sizes_enabled: checked ? true : formData.sizes_enabled
                                                });
                                            }}
                                            className="w-5 h-5 rounded border-slate-200 text-primary focus:ring-primary"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                            Enable Variants
                                        </span>
                                    </label>
                                </div>
                            </div>

                             {formData.has_variants && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Configure Options:</div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={formData.colors_enabled}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData({
                                                        ...formData,
                                                        colors_enabled: checked,
                                                        // Ensure variants_enabled matches colors_enabled for backward compatibility
                                                        variants_enabled: checked
                                                    });
                                                }}
                                                className="w-5 h-5 rounded border-slate-200 text-primary focus:ring-primary"
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                                Enable Colors
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={formData.sizes_enabled}
                                                onChange={(e) => setFormData({...formData, sizes_enabled: e.target.checked})}
                                                className="w-5 h-5 rounded border-slate-200 text-primary focus:ring-primary"
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                                Enable Sizes
                                            </span>
                                        </label>
                                    </div>

                                    {/* Unified, flatter row-based Variant Combinations section */}
                                    {(formData.colors_enabled || formData.sizes_enabled) ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                                    {formData.colors_enabled && formData.sizes_enabled 
                                                      ? "Manage Variant Combinations" 
                                                      : formData.colors_enabled 
                                                        ? "Manage Color Variants" 
                                                        : "Manage Size Variants"}
                                                </h4>
                                                <button 
                                                    type="button" 
                                                    onClick={addVariant}
                                                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-black transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    {formData.colors_enabled && formData.sizes_enabled 
                                                      ? "Add Variant Combination" 
                                                      : formData.colors_enabled 
                                                        ? "Add Color Variant" 
                                                        : "Add Size Variant"}
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {formData.variants && formData.variants.length > 0 ? (
                                                    formData.variants.map((variant: any, index: number) => (
                                                        <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative w-full">
                                                            {formData.colors_enabled && (
                                                                <>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <input 
                                                                            type="color"
                                                                            value={variant.color_code || '#000000'}
                                                                            onChange={(e) => updateVariant(index, 'color_code', e.target.value)}
                                                                            className="w-10 h-10 rounded-lg cursor-pointer border border-slate-100 shrink-0 p-1 bg-white"
                                                                        />
                                                                    </div>
                                                                    <input 
                                                                        required
                                                                        placeholder="Color Name (e.g. Amber Red)"
                                                                        className="flex-1 min-w-[120px] bg-slate-50 border-none rounded-lg py-2 px-3 text-[10px] text-slate-900 font-bold"
                                                                        value={variant.color_name || ''}
                                                                        onChange={(e) => updateVariant(index, 'color_name', e.target.value)}
                                                                    />
                                                                </>
                                                            )}

                                                            {formData.sizes_enabled && (
                                                                <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                                                                    <select 
                                                                        required
                                                                        className="bg-slate-50 border-none rounded-xl py-2 px-3 text-[10px] text-slate-900 font-bold w-full focus:ring-2 focus:ring-primary/25 outline-none"
                                                                        value={variant.size || ''}
                                                                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                                                    >
                                                                        <option value="">Select Size</option>
                                                                        <option value="S">Small (S)</option>
                                                                        <option value="M">Medium (M)</option>
                                                                        <option value="L">Large (L)</option>
                                                                        <option value="XL">Extra Large (XL)</option>
                                                                    </select>
                                                                    <div className="flex gap-1 flex-wrap">
                                                                        {['S', 'M', 'L', 'XL'].map(sz => {
                                                                            const names: Record<string, string> = { S: 'Small', M: 'Medium', L: 'Large', XL: 'Extra Large' };
                                                                            return (
                                                                                <button 
                                                                                    type="button" 
                                                                                    key={sz} 
                                                                                    onClick={() => updateVariant(index, 'size', sz)}
                                                                                    className={cn(
                                                                                        "px-1.5 py-0.5 bg-slate-100 text-[8px] text-slate-500 rounded font-black hover:bg-slate-200 transition-colors",
                                                                                        variant.size === sz && "bg-slate-900 text-white hover:bg-slate-900"
                                                                                    )}
                                                                                >
                                                                                    {sz}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Stock */}
                                                            <div className="flex items-center gap-2 justify-end w-full md:w-auto shrink-0">
                                                                <span className="text-[8px] font-black uppercase text-slate-400">Stock:</span>
                                                                <input 
                                                                    required
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="Stock"
                                                                    className="w-20 bg-slate-50 border-none rounded-lg py-2 px-3 text-[10px] text-slate-900 font-bold"
                                                                    value={variant.stock_quantity ?? 0}
                                                                    onChange={(e) => {
                                                                        const val = Number(e.target.value);
                                                                        const clampedVal = isNaN(val) || val < 0 ? 0 : val;
                                                                        updateVariant(index, 'stock_quantity', clampedVal);
                                                                    }}
                                                                />
                                                            </div>

                                                            <button 
                                                                type="button"
                                                                onClick={() => removeVariant(index)}
                                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors shrink-0 m-auto md:ml-0"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No variants added yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enable Colors, Sizes, or both to configure variants.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Product Image</label>
                                
                                {imagePreview ? (
                                    <div className="relative group/preview rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-video">
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <label className="cursor-pointer bg-white text-slate-900 p-3 rounded-xl hover:bg-primary transition-colors shadow-xl">
                                                <RotateCcw className="w-5 h-5" />
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                const base64String = reader.result as string;
                                                                setImagePreview(base64String);
                                                                setFormData({...formData, img: base64String});
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setFormData({...formData, img: ''});
                                                }}
                                                className="bg-white text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-colors shadow-xl"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-10 h-10 text-slate-300 group-hover:text-primary transition-colors mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600">Click to upload image</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const base64String = reader.result as string;
                                                        setImagePreview(base64String);
                                                        setFormData({...formData, img: base64String});
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Gallery Images (Optional)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {galleryPreviews.map((src, idx) => (
                                        <div key={idx} className="relative group rounded-xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square">
                                            <img src={src} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newPreviews = galleryPreviews.filter((_, i) => i !== idx);
                                                    setGalleryPreviews(newPreviews);
                                                    setFormData({...formData, gallery: newPreviews});
                                                }}
                                                className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer group">
                                        <Plus className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []) as File[];
                                                files.forEach(file => {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const base64String = reader.result as string;
                                                        setGalleryPreviews(prev => {
                                                            const updated = [...prev, base64String];
                                                            setFormData(f => ({...f, gallery: updated}));
                                                            return updated;
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                });
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <textarea 
                                required
                                placeholder="Product Description"
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900 h-32 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                            
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => { setIsAdding(false); resetForm(); }}
                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[3] bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-primary hover:text-black transition-all"
                                >
                                    Confirm Configuration
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-slate-50 border border-slate-100 animate-pulse rounded-[40px]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p, idx) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[40px] border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Image Area on Top */}
                <div className="w-full h-48 sm:h-56 relative overflow-hidden bg-slate-50 shrink-0">
                  {p.img ? (
                    <img src={p.img} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  {p.compare_price && p.compare_price > p.price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      SALE
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-50">
                    <div className={cn("w-1.5 h-1.5 rounded-full", p.status === 'active' ? "bg-green-500" : "bg-red-500")}></div>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest", p.status === 'active' ? "text-green-500" : "text-red-500")}>
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="px-3.5 py-1.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-slate-50">
                        {p.category}
                      </span>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 border",
                        p.stock > 0 ? "bg-green-50/50 text-green-500 border-green-50" : "bg-red-50/50 text-red-500 border-red-50"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", p.stock > 0 ? "bg-green-500" : "bg-red-500")}></div>
                        {p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}
                      </span>
                    </div>

                    <h4 className="text-lg md:text-xl font-serif italic text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{p.title}</h4>
                    <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-4 leading-relaxed h-8 overflow-hidden">{p.description}</p>
                    
                    <div className="flex items-center gap-2 mb-6">
                      <Package className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Inventory Tracked</span>
                    </div>
                  </div>

                  {/* Price and Action Footer */}
                  <div className="border-t border-slate-50 pt-5 flex items-center justify-between mt-auto">
                    <div>
                      {p.compare_price && p.compare_price > p.price && (
                        <p className="text-[10px] text-slate-300 line-through font-bold">Rs. {p.compare_price.toLocaleString()}</p>
                      )}
                      <p className="text-lg font-serif italic font-semibold text-slate-900">Rs. {p.price.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm flex items-center justify-center border border-slate-50 pointer-events-auto cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id!)}
                        className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm flex items-center justify-center border border-slate-50 pointer-events-auto cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {filteredProducts.length === 0 && !loading && (
          <div className="py-32 text-center bg-white rounded-[60px] border border-dashed border-slate-200">
              <Package className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-2xl font-serif italic text-slate-300">No products found holding that criteria</h3>
          </div>
      )}

      {/* Size Multi-Selection Modal (Option 2) */}
      {sizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 relative">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">
              {sizeModalContext.type === 'global' ? 'Choose Global Sizes' : 'Choose Color Sizes'}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium lowercase mb-5">
              Select one or multiple sizes available for this option.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                const isChecked = selectedModalSizes.includes(size);
                return (
                  <label key={size} className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all duration-200 select-none",
                    isChecked ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10" : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-700"
                  )}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedModalSizes(selectedModalSizes.filter(s => s !== size));
                        } else {
                          setSelectedModalSizes([...selectedModalSizes, size]);
                        }
                      }}
                      className={cn(
                        "w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 shrink-0",
                        isChecked && "border-white accent-white"
                      )}
                    />
                    <span className="text-xs font-black uppercase tracking-wider">{size}</span>
                  </label>
                );
              })}
            </div>
            
            <div className="mb-6">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Or Add Custom Size</span>
              <div className="flex gap-2">
                <input
                  id="custom-size-input"
                  type="text"
                  placeholder="e.g. 42, 3XL, custom"
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val && !selectedModalSizes.includes(val)) {
                        setSelectedModalSizes([...selectedModalSizes, val]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('custom-size-input') as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val && !selectedModalSizes.includes(val)) {
                      setSelectedModalSizes([...selectedModalSizes, val]);
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
              
              {selectedModalSizes.filter(s => !['S', 'M', 'L', 'XL', 'XXL'].includes(s)).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {selectedModalSizes.filter(s => !['S', 'M', 'L', 'XL', 'XXL'].includes(s)).map(sz => (
                    <span key={sz} className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 border border-slate-200">
                      {sz}
                      <button
                        type="button"
                        onClick={() => setSelectedModalSizes(selectedModalSizes.filter(s => s !== sz))}
                        className="text-slate-400 hover:text-red-500 font-extrabold text-xs leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSizeModalOpen(false)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-105"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sizeModalContext.type === 'global') {
                    setFormData({ ...formData, global_sizes: selectedModalSizes });
                  } else if (sizeModalContext.type === 'variant' && sizeModalContext.index !== undefined) {
                    const updatedVariants = [...(formData.variants || [])];
                    updatedVariants[sizeModalContext.index] = {
                      ...updatedVariants[sizeModalContext.index],
                      sizes: selectedModalSizes
                    };
                    setFormData({ ...formData, variants: updatedVariants });
                  }
                  setSizeModalOpen(false);
                }}
                className="px-4 py-2 bg-primary hover:bg-slate-900 hover:text-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-primary/10"
              >
                Save Sizes
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({...confirmModal, isOpen: false})}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
