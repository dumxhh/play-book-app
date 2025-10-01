import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Tag } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  author: string;
  cover_image: string | null;
  images: string[] | null;
  category: string;
  published_at: string | null;
  created_at: string;
}

const ClubNews = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("novedades");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from("club_news")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (!error && data) {
      setNews(data);
    }
    setLoading(false);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      general: "General",
      interview: "Entrevista",
      event: "Evento",
      announcement: "Anuncio",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "bg-blue-500",
      interview: "bg-purple-500",
      event: "bg-green-500",
      announcement: "bg-orange-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const filteredNews =
    selectedCategory === "all"
      ? news
      : news.filter((article) => article.category === selectedCategory);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Novedades del Club
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mantente al día con las últimas noticias, eventos y entrevistas
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Badge
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory("all")}
            >
              Todas
            </Badge>
            <Badge
              variant={selectedCategory === "general" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory("general")}
            >
              General
            </Badge>
            <Badge
              variant={selectedCategory === "interview" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory("interview")}
            >
              Entrevistas
            </Badge>
            <Badge
              variant={selectedCategory === "event" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory("event")}
            >
              Eventos
            </Badge>
            <Badge
              variant={selectedCategory === "announcement" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory("announcement")}
            >
              Anuncios
            </Badge>
          </div>

          {/* News Grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Cargando novedades...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                No hay novedades publicadas aún
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((article) => (
                <Card
                  key={article.id}
                  className="bg-gradient-card border-border shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  {article.cover_image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        className={`${getCategoryColor(article.category)} text-white`}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {getCategoryLabel(article.category)}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {article.title}
                    </h3>

                    {article.subtitle && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {article.subtitle}
                      </p>
                    )}

                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {article.content}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{article.author}</span>
                      </div>
                      {article.published_at && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(article.published_at), "dd MMM yyyy", {
                              locale: es,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
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

export default ClubNews;