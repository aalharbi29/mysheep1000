import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit2, Package, Plus } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  category: string;
  sub_category: string | null;
  image_urls: string[];
  status: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  medicine: 'أدوية ومستلزمات طبية',
  sheep_tools: 'أدوات أغنام',
  poultry_tools: 'أدوات دواجن',
  horse_tools: 'أدوات خيل',
  general: 'مستلزمات عامة',
};

const MyProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editSalePrice, setEditSalePrice] = useState('');
  const [editStock, setEditStock] = useState('');

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('store_products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    setProducts((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('store_products').delete().eq('id', id);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم حذف المنتج ✅' });
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDesc(p.description || '');
    setEditPrice(p.price?.toString() || '');
    setEditSalePrice(p.sale_price?.toString() || '');
    setEditStock(p.stock?.toString() || '0');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('store_products').update({
      name: editName,
      description: editDesc || null,
      price: editPrice ? parseFloat(editPrice) : 0,
      sale_price: editSalePrice ? parseFloat(editSalePrice) : null,
      stock: editStock ? parseInt(editStock) : 0,
    }).eq('id', editingId);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم التعديل ✅' });
      setEditingId(null);
      fetchProducts();
    }
  };

  const toggleStatus = async (p: Product) => {
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('store_products').update({ status: newStatus }).eq('id', p.id);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, status: newStatus } : item));
    }
  };

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="منتجاتي" backTo="/market" />

        <Button className="w-full mt-4" onClick={() => navigate('/store/add-product')}>
          <Plus className="w-4 h-4 ml-2" /> إضافة منتج جديد
        </Button>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold">لا توجد منتجات</p>
            <p className="text-sm mt-1">أضف منتجك الأول للبدء</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {products.map(product => (
              <div key={product.id} className="bg-card rounded-xl p-4 shadow-md border border-border">
                <div className="flex gap-3">
                  {product.image_urls?.length > 0 ? (
                    <img src={(product.image_urls as string[])[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-foreground text-sm truncate">{product.name}</p>
                      <button
                        onClick={() => toggleStatus(product)}
                        className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${product.status === 'active' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}
                      >
                        {product.status === 'active' ? 'نشط' : 'متوقف'}
                      </button>
                    </div>
                    <p className="text-muted-foreground text-xs">{categoryLabels[product.category] || product.category}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-bold text-primary text-sm">
                        {product.sale_price ? (
                          <>
                            <span className="line-through text-muted-foreground ml-1">{product.price.toLocaleString()}</span>
                            {product.sale_price.toLocaleString()}
                          </>
                        ) : product.price.toLocaleString()} ر.س
                      </span>
                      <span className="text-xs text-muted-foreground">المخزون: {product.stock}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(product)}>
                    <Edit2 className="w-4 h-4 ml-1" /> تعديل
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4 ml-1" /> حذف</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف المنتج؟</AlertDialogTitle>
                        <AlertDialogDescription>سيتم حذف المنتج نهائياً ولا يمكن التراجع.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(product.id)}>حذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>تعديل المنتج</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">اسم المنتج</label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">الوصف</label>
                <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold mb-1 block">السعر</label>
                  <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">سعر التخفيض</label>
                  <Input type="number" value={editSalePrice} onChange={e => setEditSalePrice(e.target.value)} placeholder="اختياري" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">المخزون</label>
                <Input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleSaveEdit}>حفظ التعديلات</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyProductsPage;
