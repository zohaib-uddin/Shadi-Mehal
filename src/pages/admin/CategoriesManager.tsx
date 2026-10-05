import React, { useEffect, useState } from 'react';
import { adminService, Category } from '../../lib/adminService';
import { Plus, Trash2, Edit2, Search, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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

  const [formData, setFormData] = useState({
    name: '',
    type: 'both' as 'product' | 'service' | 'both'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id!, formData);
      } else {
        await adminService.addCategory(formData);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', type: 'both' });
      await fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category?.name || 'this category'}"? This may affect items using this category.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteCategory(id);
          await fetchCategories();
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      }
    });
  };

  const handleEditClick = (category: Category) => {
    setConfirmModal({
      isOpen: true,
      title: 'Edit Category',
      message: `Are you sure you want to edit "${category.name}"?`,
      type: 'info',
      onConfirm: () => {
        setEditingCategory(category);
        setFormData({ name: category.name, type: category.type });
        setIsModalOpen(true);
      }
    });
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">Manage categories for products and services</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', type: 'both' });
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-primary hover:text-black transition-all"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search categories..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading && categories.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <motion.div 
              layout
              key={category.id}
              className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm group hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-serif text-slate-900">{category.name}</h3>
                  <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                    {category.type}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                  <button 
                    onClick={() => handleEditClick(category)}
                    className="p-2 bg-slate-50 rounded-lg text-slate-600 hover:text-primary transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id!)}
                    className="p-2 bg-slate-50 rounded-lg text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <h3 className="text-2xl font-serif text-slate-900 mb-6">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="both">Both (Products & Services)</option>
                    <option value="product">Products Only</option>
                    <option value="service">Services Only</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-black transition-all flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (editingCategory ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
