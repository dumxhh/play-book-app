import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const ReviewsSection = () => {
  const reviews = [
    {
      id: 1,
      name: "Carlos Martínez",
      sport: "Fútbol",
      rating: 5,
      comment: "Excelentes canchas y muy buen mantenimiento. El personal es súper amable y profesional. Sin duda volveré!",
      date: "Hace 2 semanas"
    },
    {
      id: 2,
      name: "Ana López",
      sport: "Paddle",
      rating: 5,
      comment: "Las canchas de paddle están en perfectas condiciones. La iluminación es ideal para jugar de noche. Muy recomendado!",
      date: "Hace 1 mes"
    },
    {
      id: 3,
      name: "Diego Fernández",
      sport: "Tenis",
      rating: 5,
      comment: "Club de primera categoría. Las instalaciones son modernas y limpias. El sistema de reservas online es muy fácil de usar.",
      date: "Hace 3 semanas"
    },
    {
      id: 4,
      name: "Laura García",
      sport: "Golf",
      rating: 4,
      comment: "Muy buena experiencia en general. El campo de golf está bien cuidado y los precios son justos. Lo único que mejoraría es el estacionamiento.",
      date: "Hace 1 semana"
    },
    {
      id: 5,
      name: "Roberto Silva",
      sport: "Fútbol",
      rating: 5,
      comment: "Vengo jugando aquí desde hace años y siempre mantienen la calidad. Es mi lugar favorito para jugar con amigos.",
      date: "Hace 4 días"
    },
    {
      id: 6,
      name: "Sofía Ramírez",
      sport: "Paddle",
      rating: 5,
      comment: "Instalaciones impecables y ambiente muy familiar. Perfecto para jugar en familia o con amigos. Altamente recomendado!",
      date: "Hace 5 días"
    }
  ];

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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Reseñas de Nuestros Clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conoce lo que dicen nuestros jugadores sobre su experiencia en el club
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-gradient-card border-border shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Quote className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {review.sport}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4 italic">
                  "{review.comment}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{review.name}</p>
                    <p className="text-sm text-muted-foreground">{review.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-6 py-3 rounded-full">
            <div className="flex space-x-1">
              {renderStars(5)}
            </div>
            <span className="text-lg font-semibold text-foreground">4.9/5</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">+500 reseñas</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;