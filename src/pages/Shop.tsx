import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Tag, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  sport: string | null;
  images: string[] | null;
  stock_quantity: number;
  is_rental: boolean;
  rental_duration_hours: number | null;
}

interface CartItem extends Product {
  quantity: number;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("tienda");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .eq("is_available", true)
      .order("name");

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      equipment: "Equipamiento",
      rental: "Alquiler",
      merchandising: "Merchandising",
    };
    return labels[category] || category;
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
    });
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tienda del Club
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Equipamiento deportivo, alquiler de material y merchandising oficial
            </p>
          </div>

          {/* Category Filter & Cart */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-12">
            <div className="flex flex-wrap gap-3">
              <Badge
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCategory("all")}
              >
                Todos
              </Badge>
              <Badge
                variant={selectedCategory === "equipment" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCategory("equipment")}
              >
                Equipamiento
              </Badge>
              <Badge
                variant={selectedCategory === "rental" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCategory("rental")}
              >
                Alquiler
              </Badge>
              <Badge
                variant={selectedCategory === "merchandising" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCategory("merchandising")}
              >
                Merchandising
              </Badge>
            </div>

            <Button variant="outline" className="relative">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Carrito
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-primary">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                No hay productos disponibles en esta categoría
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-gradient-card border-border shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  {product.images && product.images.length > 0 && (
                    <div className="w-full h-48 overflow-hidden bg-muted">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {product.name}
                      </h3>
                      <Badge variant="outline">
                        <Tag className="w-3 h-3 mr-1" />
                        {getCategoryLabel(product.category)}
                      </Badge>
                    </div>

                    {product.sport && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {product.sport}
                      </p>
                    )}

                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          ${product.price}
                        </p>
                        {product.is_rental && product.rental_duration_hours && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {product.rental_duration_hours}hs
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="w-3 h-3" />
                        <span>Stock: {product.stock_quantity}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => addToCart(product)}
                      disabled={product.stock_quantity === 0}
                      className="w-full"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.is_rental ? "Alquilar" : "Agregar"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;