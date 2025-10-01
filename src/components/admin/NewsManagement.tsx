import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  author: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

const NewsManagement = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    author: "",
    category: "general",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("club_news")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingArticle) {
      const { error } = await supabase
        .from("club_news")
        .update(formData)
        .eq("id", editingArticle.id);

      if (!error) {
        toast({ title: "Artículo actualizado" });
        fetchArticles();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("club_news").insert({
        ...formData,
        is_published: false,
      });

      if (!error) {
        toast({ title: "Artículo creado" });
        fetchArticles();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      author: "",
      category: "general",
    });
    setEditingArticle(null);
    setIsDialogOpen(false);
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("club_news")
      .update({
        is_published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (!error) {
      toast({ title: currentStatus ? "Artículo despublicado" : "Artículo publicado" });
      fetchArticles();
    }
  };

  const deleteArticle = async (id: string) => {
    const { error } = await supabase.from("club_news").delete().eq("id", id);

    if (!error) {
      toast({ title: "Artículo eliminado" });
      fetchArticles();
    }
  };

  const startEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      subtitle: article.subtitle || "",
      content: article.content,
      author: article.author,
      category: article.category,
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gestión de Novedades</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingArticle(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Noticia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingArticle ? "Editar" : "Nueva"} Noticia</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Subtítulo</Label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contenido</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    required
                  />
                </div>
                <div>
                  <Label>Autor</Label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="interview">Entrevista</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="announcement">Anuncio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingArticle ? "Actualizar" : "Crear"}
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
        ) : articles.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay artículos</p>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <Card key={article.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{article.title}</h3>
                        {article.is_published ? (
                          <Badge className="bg-green-500">Publicado</Badge>
                        ) : (
                          <Badge variant="secondary">Borrador</Badge>
                        )}
                        <Badge variant="outline">{article.category}</Badge>
                      </div>
                      {article.subtitle && (
                        <p className="text-sm text-muted-foreground mb-2">{article.subtitle}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Por {article.author}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePublish(article.id, article.is_published)}
                      >
                        {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => startEdit(article)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteArticle(article.id)}>
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

export default NewsManagement;