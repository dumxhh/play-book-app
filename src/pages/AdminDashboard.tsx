import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon,
  LogOut,
  Settings,
  BarChart3,
  QrCode,
  Mail,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Reservation } from "@/types/reservation";

const AdminDashboard = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalRevenue: 0
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (isLoggedIn !== "true") {
      navigate("/admin/login");
      return;
    }
    
    fetchReservations();
  }, [navigate]);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const typedReservations = (data || []).map(reservation => ({
        ...reservation,
        payment_status: (reservation.payment_status as 'pending' | 'completed' | 'failed') || 'pending'
      }));
      
      setReservations(typedReservations);
      
      // Calculate stats
      const total = typedReservations.length;
      const completed = typedReservations.filter(r => r.payment_status === 'completed').length;
      const pending = typedReservations.filter(r => r.payment_status === 'pending').length;
      const failed = typedReservations.filter(r => r.payment_status === 'failed').length;
      const totalRevenue = typedReservations
        .filter(r => r.payment_status === 'completed')
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      
      setStats({ total, completed, pending, failed, totalRevenue });
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Error al cargar reservas",
        description: error.message || "No se pudieron cargar las reservas. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    navigate("/admin/login");
  };

  const generateQRCode = (reservation: Reservation) => {
    try {
      if (!reservation || !reservation.id) {
        throw new Error("Reserva inválida");
      }

      const qrData = `RESERVA-${reservation.id}
Deporte: ${(reservation.sport || 'N/A').toUpperCase()}
Fecha: ${reservation.date ? format(new Date(reservation.date), "d 'de' MMMM, yyyy", { locale: es }) : 'N/A'}
Hora: ${reservation.time || 'N/A'}
Cliente: ${reservation.customer_name || 'N/A'}
Monto: $${reservation.amount || 0}
Estado: APROBADO ✓`;
      
      return btoa(qrData);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el código QR",
        variant: "destructive"
      });
      return '';
    }
  };

  const handleShowQR = (reservation: Reservation) => {
    if (reservation.payment_status !== 'completed') {
      toast({
        title: "QR no disponible",
        description: "El QR solo está disponible para pagos aprobados",
        variant: "destructive"
      });
      return;
    }
    
    const qr = generateQRCode(reservation);
    setQrCode(qr);
    setSelectedReservation(reservation);
    setShowQRDialog(true);
  };

  const handleSendQREmail = async (reservation: Reservation) => {
    if (!reservation.customer_email) {
      toast({
        title: "Email no disponible",
        description: "Esta reserva no tiene un email registrado",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-qr-email', {
        body: {
          email: reservation.customer_email,
          customerName: reservation.customer_name,
          sport: reservation.sport,
          date: reservation.date,
          time: reservation.time,
          amount: reservation.amount
        }
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: `QR enviado a ${reservation.customer_email}`,
      });
    } catch (error) {
      console.error('Error sending QR email:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el email con el QR",
        variant: "destructive"
      });
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success border-success/30';
      case 'failed':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'pending':
      default:
        return 'bg-warning/20 text-warning border-warning/30';
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
        return 'Aprobado';
      case 'failed':
        return 'Rechazado';
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
      <div className="min-h-screen bg-gradient-main">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header */}
      <div className="bg-gradient-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">Gestión de reservas deportivas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")} 
                className="flex items-center space-x-2"
              >
                <span>← Volver</span>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aprobados</p>
                  <p className="text-2xl font-bold text-success">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                </div>
                <ClockIcon className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rechazados</p>
                  <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="text-2xl font-bold text-success">${stats.totalRevenue}</p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservations List */}
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-foreground">Todas las Reservas</CardTitle>
              <Button onClick={fetchReservations} variant="outline" size="sm">
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg text-muted-foreground">No hay reservas registradas</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {reservations.map((reservation) => (
                  <Card key={reservation.id} className="bg-background/50 border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getSportEmoji(reservation.sport)}</span>
                          <CardTitle className="text-base capitalize">{reservation.sport}</CardTitle>
                        </div>
                        <Badge className={`${getPaymentStatusColor(reservation.payment_status)} flex items-center space-x-1`}>
                          {getPaymentStatusIcon(reservation.payment_status)}
                          <span className="text-xs">{getPaymentStatusText(reservation.payment_status)}</span>
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
                        <span>{reservation.time} - {reservation.duration} min</span>
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
                          <DollarSign className="w-4 h-4 text-success" />
                          <span className="font-semibold">${reservation.amount}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {reservation.id.slice(0, 8)}...
                        </div>
                      </div>

                      {reservation.payment_status === 'completed' && (
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleShowQR(reservation)}
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Ver QR
                          </Button>
                          {reservation.customer_email && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleSendQREmail(reservation)}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Enviar
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              QR de Acceso - Reserva Aprobada
            </DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="bg-gradient-card p-6 rounded-lg border border-border">
                <div className="bg-white p-4 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-2">
                      <QrCode className="w-24 h-24 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Código QR de acceso</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deporte:</span>
                    <span className="font-medium capitalize">{selectedReservation.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="font-medium">
                      {format(new Date(selectedReservation.date), "d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hora:</span>
                    <span className="font-medium">{selectedReservation.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-medium">{selectedReservation.customer_name}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge className="bg-success/20 text-success border-success/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aprobado
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                Presente este QR al llegar a la cancha
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;