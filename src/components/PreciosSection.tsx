import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Clock, Users, Star } from "lucide-react";

interface PreciosSectionProps {
  onReservarClick: () => void;
}

const PreciosSection = ({ onReservarClick }: PreciosSectionProps) => {
  const courts = [
    {
      sport: 'Fútbol',
      emoji: '⚽',
      price: 15000,
      duration: 90,
      capacity: '10v10',
      features: ['Césped artificial', 'Iluminación LED', 'Vestuarios'],
      color: 'bg-success'
    },
    {
      sport: 'Paddle',
      emoji: '🏓',
      price: 8000,
      duration: 60,
      capacity: '2v2',
      features: ['Cancha cubierta', 'Equipamiento incluido', 'Aire acondicionado'],
      color: 'bg-accent',
      popular: true
    },
    {
      sport: 'Tenis',
      emoji: '🎾',
      price: 7000,
      duration: 60,
      capacity: '1v1 o 2v2',
      features: ['Superficie dura', 'Iluminación nocturna', 'Red profesional'],
      color: 'bg-warning'
    },
    {
      sport: 'Golf',
      emoji: '🏌️',
      price: 25000,
      duration: 180,
      capacity: '1-4 jugadores',
      features: ['18 hoyos', 'Carrito incluido', 'Driving range'],
      color: 'bg-primary'
    }
  ];

  const packages = [
    {
      name: 'Pase Mensual',
      price: 59900,
      description: 'Acceso ilimitado a todas las canchas',
      features: ['Sin límite de reservas', '20% descuento en clases', 'Invitados con descuento'],
      color: 'bg-gradient-primary'
    },
    {
      name: 'Pase Familiar',
      price: 99900,
      description: 'Para hasta 4 miembros de la familia',
      features: ['Acceso completo para 4', 'Eventos familiares gratis', 'Descuentos especiales'],
      color: 'bg-gradient-hero'
    }
  ];

  return (
    <section id="precios" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Precios y Tarifas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tarifas competitivas para todas nuestras instalaciones deportivas
          </p>
        </div>

        {/* Individual Court Prices */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            Tarifas por Cancha
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {courts.map((court) => (
              <Card key={court.sport} className="bg-gradient-card border-border shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-105 relative overflow-hidden">
                {court.popular && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">
                    <Star className="w-3 h-3 inline mr-1" />
                    Más Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{court.emoji}</div>
                  <CardTitle className="text-xl">{court.sport}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">${court.price}</div>
                    <div className="text-sm text-muted-foreground">por {court.duration} min</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{court.capacity}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{court.duration} minutos</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {court.features.map((feature, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {feature}
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={onReservarClick}
                    className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    Reservar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Package Deals */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            Paquetes Especiales
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.name} className="bg-gradient-card border-border shadow-soft hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <Badge className={`${pkg.color} text-white`}>
                      Oferta
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{pkg.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">${pkg.price}</div>
                    <div className="text-sm text-muted-foreground">por mes</div>
                  </div>
                  
                  <div className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={onReservarClick}
                    className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Suscribirse
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreciosSection;