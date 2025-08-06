import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Phone, DollarSign, CheckCircle, XCircle, Clock as ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Reservation } from "@/types/reservation";

const ReservationsSection = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedReservations = (data || []).map(reservation => ({
        ...reservation,
        payment_status: reservation.payment_status as 'pending' | 'completed' | 'failed'
      }));
      setReservations(typedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Pagado';
      case 'failed':
        return 'Falló';
      case 'pending':
      default:
        return 'Pendiente';
    }
  };

  const getSportEmoji = (sport: string) => {
    switch (sport) {
      case 'futbol':
        return '⚽';
      case 'paddle':
        return '🏓';
      case 'tenis':
        return '🎾';
      case 'golf':
        return '🏌️';
      default:
        return '🏃';
    }
  };

  if (loading) {
    return (
      <section id="reservas" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reservas" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Reservas Recientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Historial de reservas y estado de pagos con MercadoPago
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay reservas aún</p>
              <p className="text-sm">Las reservas aparecerán aquí una vez que se realicen</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="bg-gradient-card border-border shadow-soft hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getSportEmoji(reservation.sport)}</span>
                      <CardTitle className="text-lg capitalize">{reservation.sport}</CardTitle>
                    </div>
                    <Badge className={`${getPaymentStatusColor(reservation.payment_status)} flex items-center space-x-1`}>
                      {getPaymentStatusIcon(reservation.payment_status)}
                      <span>{getPaymentStatusText(reservation.payment_status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(reservation.date), "d 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{reservation.time} - {reservation.duration} minutos</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{reservation.customer_name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{reservation.customer_phone}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-lg">${reservation.amount}</span>
                    </div>
                    
                    {reservation.payment_status === 'pending' && (
                      <Button size="sm" variant="outline" className="text-xs">
                        Ver pago
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Button variant="outline" onClick={fetchReservations}>
            Actualizar reservas
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReservationsSection;