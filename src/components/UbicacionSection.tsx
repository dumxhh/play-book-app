import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Car, Bus, ExternalLink } from "lucide-react";

const UbicacionSection = () => {
  return (
    <section id="ubicacion" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Nuestra Ubicación
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra nuestro club deportivo fácilmente y conoce toda la información práctica
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Map */}
          <Card className="bg-gradient-card border-border shadow-soft overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-muted/50 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
                <div className="text-center z-10">
                  <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground">Mapa Interactivo</p>
                  <p className="text-sm text-muted-foreground">Click para abrir en Google Maps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Dirección</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-medium mb-2">
                  Av. Deportiva 123, Centro Deportivo
                </p>
                <p className="text-muted-foreground mb-4">
                  Ciudad Deportiva, CP 12345
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir en Google Maps
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Horarios de Atención</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lunes - Viernes:</span>
                  <span className="font-medium">8:00 - 22:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sábados:</span>
                  <span className="font-medium">8:00 - 23:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domingos:</span>
                  <span className="font-medium">9:00 - 21:00</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>Contacto</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">reservas@sportclub.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle>Cómo llegar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Car className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">En automóvil</p>
                    <p className="text-sm text-muted-foreground">
                      Estacionamiento gratuito disponible para 200 vehículos
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bus className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Transporte público</p>
                    <p className="text-sm text-muted-foreground">
                      Líneas 15, 23 y 45. Parada "Centro Deportivo"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UbicacionSection;