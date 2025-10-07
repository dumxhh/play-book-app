import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Calendar, DollarSign, TrendingUp, Users, Camera, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, CreditCard, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import AdminReservationManagement from '@/components/AdminReservationManagement';
import GalleryManagement from '@/components/GalleryManagement';
import ReviewsManagement from '@/components/admin/ReviewsManagement';
import NewsManagement from '@/components/admin/NewsManagement';
import ShopManagement from '@/components/admin/ShopManagement';
import RecurringReservationsManagement from '@/components/admin/RecurringReservationsManagement';

interface Reservation {
  id: string;
  sport: string;
  date: string;
  time: string;
  duration: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface CourtPhoto {
  id: string;
  sport: string;
  image_url: string;
  title?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

interface DashboardStats {
  totalReservations: number;
  totalRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  monthlyGrowth: number;
}

const AdminPanel = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [photos, setPhotos] = useState<CourtPhoto[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form states for photo management
  const [newPhoto, setNewPhoto] = useState({
    sport: '',
    image_url: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (isLoggedIn !== "true") {
      navigate("/admin/login");
      return;
    }
    fetchReservations();
    fetchPhotos();
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

      const safeReservations = (data || []).map(r => ({
        ...r,
        payment_status: (r.payment_status as 'pending' | 'completed' | 'failed') || 'pending'
      })) as Reservation[];

      setReservations(safeReservations);
      calculateStats(safeReservations);
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Error al cargar reservas",
        description: error.message || "No se pudieron cargar las reservas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('court_photos')
        .select('*')
        .order('sport', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setPhotos(data || []);
    } catch (error: any) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error al cargar fotos",
        description: error.message || "No se pudieron cargar las fotos",
        variant: "destructive"
      });
    }
  };

  const calculateStats = (reservationsData: Reservation[]) => {
    const completed = reservationsData.filter(r => r.payment_status === 'completed');
    const pending = reservationsData.filter(r => r.payment_status === 'pending');
    const failed = reservationsData.filter(r => r.payment_status === 'failed');
    
    const totalRevenue = completed.reduce((sum, r) => sum + Number(r.amount), 0);
    
    // Calculate monthly growth (simplified)
    const thisMonth = new Date().getMonth();
    const thisMonthReservations = reservationsData.filter(r => 
      new Date(r.created_at).getMonth() === thisMonth
    ).length;
    const lastMonthReservations = reservationsData.filter(r => 
      new Date(r.created_at).getMonth() === thisMonth - 1
    ).length;
    
    const growth = lastMonthReservations > 0 
      ? ((thisMonthReservations - lastMonthReservations) / lastMonthReservations) * 100 
      : 0;

    setStats({
      totalReservations: reservationsData.length,
      totalRevenue,
      completedPayments: completed.length,
      pendingPayments: pending.length,
      failedPayments: failed.length,
      monthlyGrowth: growth
    });
  };

  const addPhoto = async () => {
    if (!newPhoto.sport || !newPhoto.image_url) {
      toast({
        title: "Error",
        description: "Deporte y URL de imagen son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('court_photos')
        .insert([{
          ...newPhoto,
          display_order: photos.filter(p => p.sport === newPhoto.sport).length + 1
        }]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Foto agregada correctamente"
      });

      setNewPhoto({ sport: '', image_url: '', title: '', description: '' });
      fetchPhotos();
    } catch (error) {
      console.error('Error adding photo:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la foto",
        variant: "destructive"
      });
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('court_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Foto eliminada correctamente"
      });

      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la foto",
        variant: "destructive"
      });
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSportEmoji = (sport: string) => {
    switch (sport) {
      case 'futbol': return '⚽';
      case 'paddle': return '🏓';
      case 'tenis': return '🎾';
      case 'golf': return '⛳';
      default: return '🏃';
    }
  };

  // Data for charts
  const sportsData = reservations.reduce((acc, reservation) => {
    const sport = reservation.sport;
    acc[sport] = (acc[sport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(sportsData).map(([sport, count]) => ({
    sport: sport.charAt(0).toUpperCase() + sport.slice(1),
    reservas: count,
    emoji: getSportEmoji(sport)
  }));

  const revenueData = reservations
    .filter(r => r.payment_status === 'completed')
    .reduce((acc, reservation) => {
      const date = new Date(reservation.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + Number(reservation.amount);
      return acc;
    }, {} as Record<string, number>);

  const revenueChartData = Object.entries(revenueData)
    .slice(-7)
    .map(([date, amount]) => ({
      fecha: date,
      ingresos: amount
    }));

  const filteredReservations = selectedSport === 'all' 
    ? reservations 
    : reservations.filter(r => r.sport === selectedSport);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Panel Administrativo</h1>
                <p className="text-white/80 text-sm mt-1">Gestiona tu club deportivo</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={fetchReservations}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Actualizar
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem("isAdminLoggedIn");
                  toast({ title: "Sesión cerrada" });
                  navigate("/admin/login");
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards con animación y gradientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-card to-secondary border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reservas</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stats.totalReservations}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-secondary border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-secondary border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completados</p>
                  <p className="text-3xl font-bold text-success">{stats.completedPayments}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-secondary border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-3xl font-bold text-warning">{stats.pendingPayments}</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-full">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-secondary border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rechazados</p>
                  <p className="text-3xl font-bold text-destructive">{stats.failedPayments}</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-full">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
            <TabsTrigger value="admin-reservations">Gestión Reservas</TabsTrigger>
            <TabsTrigger value="recurring">Recurrentes</TabsTrigger>
            <TabsTrigger value="photos">Fotos Canchas</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            <TabsTrigger value="news">Novedades</TabsTrigger>
            <TabsTrigger value="shop">Tienda</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-card to-secondary border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    Reservas por Deporte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="reservas"
                        label={({ sport, reservas }) => `${sport}: ${reservas}`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${120 + index * 40}, 65%, ${45 + index * 5}%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-secondary border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    Ingresos por Día (Últimos 7 días)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(120, 65%, 32%)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(120, 65%, 32%)" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="fecha" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Ingresos']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="ingresos" 
                        stroke="hsl(120, 65%, 32%)" 
                        strokeWidth={2}
                        fill="url(#colorIngresos)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="admin-reservations" className="space-y-4">
            <AdminReservationManagement />
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            <Card className="bg-gradient-to-br from-card to-secondary border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    Gestión de Reservas
                  </CardTitle>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar por deporte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="futbol">Fútbol</SelectItem>
                      <SelectItem value="paddle">Paddle</SelectItem>
                      <SelectItem value="tenis">Tenis</SelectItem>
                      <SelectItem value="golf">Golf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredReservations.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No hay reservas para mostrar</p>
                    </div>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <Card 
                        key={reservation.id} 
                        className="p-4 bg-card hover:bg-secondary/50 transition-all duration-200 border-l-4"
                        style={{
                          borderLeftColor: reservation.payment_status === 'completed' 
                            ? 'hsl(var(--success))' 
                            : reservation.payment_status === 'failed'
                            ? 'hsl(var(--destructive))'
                            : 'hsl(var(--warning))'
                        }}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl p-3 bg-primary/10 rounded-lg">
                              {getSportEmoji(reservation.sport)}
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{reservation.customer_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {reservation.sport.charAt(0).toUpperCase() + reservation.sport.slice(1)} • {reservation.date} • {reservation.time}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                📞 {reservation.customer_phone} {reservation.customer_email && `• ✉️ ${reservation.customer_email}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              ${reservation.amount}
                            </p>
                            <div className="flex items-center gap-2 justify-end mt-2">
                              {getPaymentStatusIcon(reservation.payment_status)}
                              <Badge className={getPaymentStatusColor(reservation.payment_status)}>
                                {getPaymentStatusText(reservation.payment_status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <GalleryManagement photos={photos} onPhotosUpdate={fetchPhotos} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-card to-secondary border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    Reservas por Deporte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(120, 65%, 32%)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="sport" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="reservas" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-secondary border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    Estados de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20 hover:border-success/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/20 rounded-full">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <span className="font-medium">Pagos Completados</span>
                      </div>
                      <span className="text-2xl font-bold text-success">{stats.completedPayments}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20 hover:border-warning/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning/20 rounded-full">
                          <Clock className="h-5 w-5 text-warning" />
                        </div>
                        <span className="font-medium">Pagos Pendientes</span>
                      </div>
                      <span className="text-2xl font-bold text-warning">{stats.pendingPayments}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/20 hover:border-destructive/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-destructive/20 rounded-full">
                          <XCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <span className="font-medium">Pagos Rechazados</span>
                      </div>
                      <span className="text-2xl font-bold text-destructive">{stats.failedPayments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManagement />
          </TabsContent>

          <TabsContent value="recurring">
            <RecurringReservationsManagement />
          </TabsContent>

          <TabsContent value="news">
            <NewsManagement />
          </TabsContent>

          <TabsContent value="shop">
            <ShopManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;