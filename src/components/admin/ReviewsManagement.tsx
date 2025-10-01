import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Review {
  id: string;
  customer_name: string;
  customer_email: string | null;
  sport: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });

    if (filter === "pending") {
      query = query.eq("is_approved", false);
    } else if (filter === "approved") {
      query = query.eq("is_approved", true);
    }

    const { data, error } = await query;

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const approveReview = async (id: string) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo aprobar la reseña",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reseña aprobada",
        description: "La reseña ahora es visible para todos",
      });
      fetchReviews();
    }
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la reseña",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reseña eliminada",
        description: "La reseña ha sido eliminada",
      });
      fetchReviews();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gestión de Reseñas</span>
          <div className="flex gap-2">
            <Badge
              variant={filter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("all")}
            >
              Todas
            </Badge>
            <Badge
              variant={filter === "pending" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("pending")}
            >
              Pendientes
            </Badge>
            <Badge
              variant={filter === "approved" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("approved")}
            >
              Aprobadas
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay reseñas para mostrar</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{review.customer_name}</span>
                        {review.is_approved ? (
                          <Badge className="bg-green-500">Aprobada</Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </div>
                      {review.customer_email && (
                        <p className="text-sm text-muted-foreground">
                          {review.customer_email}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{review.sport}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(review.created_at), "dd MMM yyyy, HH:mm", {
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">{renderStars(review.rating)}</div>
                  </div>

                  <p className="text-muted-foreground mb-3 italic">"{review.comment}"</p>

                  <div className="flex gap-2">
                    {!review.is_approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approveReview(review.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteReview(review.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
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

export default ReviewsManagement;