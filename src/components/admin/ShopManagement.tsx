import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  sport: string | null;
  stock_quantity: number;
  is_available: boolean;
  is_rental: boolean;
  rental_duration_hours: number | null;
}

const ShopManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "equipment",
    sport: "",
    stock_quantity: 0,
    is_rental: false,
    rental_duration_hours: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .order("name");

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      ...formData,
      rental_duration_hours: formData.is_rental ? formData.rental_duration_hours : null,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("shop_products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (!error) {
        toast({ title: "Producto actualizado" });
        fetchProducts();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("shop_products").insert(productData);

      if (!error) {
        toast({ title: "Producto creado" });
        fetchProducts();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "equipment",
      sport: "",
      stock_quantity: 0,
      is_rental: false,
      rental_duration_hours: 0,
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("shop_products").delete().eq("id", id);

    if (!error) {
      toast({ title: "Producto eliminado" });
      fetchProducts();
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category,
      sport: product.sport || "",
      stock_quantity: product.stock_quantity,
      is_rental: product.is_rental,
      rental_duration_hours: product.rental_duration_hours || 0,
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gestión de Tienda</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingProduct(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar" : "Nuevo"} Producto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Precio</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment">Equipamiento</SelectItem>
                      <SelectItem value="rental">Alquiler</SelectItem>
                      <SelectItem value="merchandising">Merchandising</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deporte</Label>
                  <Input
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    placeholder="Ej: Fútbol, Paddle, etc."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_rental"
                    checked={formData.is_rental}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_rental: checked as boolean })}
                  />
                  <Label htmlFor="is_rental">Es un alquiler</Label>
                </div>
                {formData.is_rental && (
                  <div>
                    <Label>Duración del alquiler (horas)</Label>
                    <Input
                      type="number"
                      value={formData.rental_duration_hours}
                      onChange={(e) => setFormData({ ...formData, rental_duration_hours: parseInt(e.target.value) })}
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingProduct ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay productos</p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <Card key={product.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-bold text-primary">${product.price}</span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Package className="w-3 h-3" />
                          Stock: {product.stock_quantity}
                        </span>
                        <span className="text-muted-foreground">{product.category}</span>
                        {product.is_rental && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                            Alquiler {product.rental_duration_hours}hs
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopManagement;