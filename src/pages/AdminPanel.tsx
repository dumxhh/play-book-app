import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

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

  // Form states for photo management
  const [newPhoto, setNewPhoto] = useState({
    sport: '',
    image_url: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchReservations();
    fetchPhotos();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReservations((data || []) as Reservation[]);
      calculateStats((data || []) as Reservation[]);
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

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('court_photos')
        .select('*')
        .order('sport', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-primary">Panel Administrativo</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchReservations}>
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reservas</p>
                  <p className="text-2xl font-bold">{stats.totalReservations}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pagos Completados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedPayments}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pagos Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pagos Rechazados</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedPayments}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
            <TabsTrigger value="photos">Fotos Canchas</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Deporte</CardTitle>
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
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Día (Últimos 7 días)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                      <Area type="monotone" dataKey="ingresos" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestión de Reservas</CardTitle>
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
                <div className="space-y-4">
                  {filteredReservations.map((reservation) => (
                    <Card key={reservation.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{getSportEmoji(reservation.sport)}</span>
                          <div>
                            <p className="font-semibold">{reservation.customer_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {reservation.sport.charAt(0).toUpperCase() + reservation.sport.slice(1)} - {reservation.date} {reservation.time}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {reservation.customer_phone} {reservation.customer_email && `• ${reservation.customer_email}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${reservation.amount}</p>
                          <div className="flex items-center gap-2 justify-end">
                            {getPaymentStatusIcon(reservation.payment_status)}
                            <Badge className={getPaymentStatusColor(reservation.payment_status)}>
                              {getPaymentStatusText(reservation.payment_status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Fotos de Canchas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Agregar Nueva Foto</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="sport">Deporte</Label>
                        <Select value={newPhoto.sport} onValueChange={(value) => setNewPhoto({...newPhoto, sport: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar deporte" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="futbol">Fútbol</SelectItem>
                            <SelectItem value="paddle">Paddle</SelectItem>
                            <SelectItem value="tenis">Tenis</SelectItem>
                            <SelectItem value="golf">Golf</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="image_url">URL de Imagen</Label>
                        <Input
                          id="image_url"
                          value={newPhoto.image_url}
                          onChange={(e) => setNewPhoto({...newPhoto, image_url: e.target.value})}
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Título (opcional)</Label>
                        <Input
                          id="title"
                          value={newPhoto.title}
                          onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                          placeholder="Título de la foto"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción (opcional)</Label>
                        <Textarea
                          id="description"
                          value={newPhoto.description}
                          onChange={(e) => setNewPhoto({...newPhoto, description: e.target.value})}
                          placeholder="Descripción de la cancha"
                        />
                      </div>
                      <Button onClick={addPhoto} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Foto
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Fotos Existentes</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {photos.map((photo) => (
                        <Card key={photo.id} className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={photo.image_url}
                              alt={photo.title || `Cancha de ${photo.sport}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{photo.title || `Cancha de ${photo.sport}`}</p>
                              <p className="text-sm text-muted-foreground capitalize">{photo.sport}</p>
                              {photo.description && (
                                <p className="text-xs text-muted-foreground">{photo.description}</p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deletePhoto(photo.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Deporte (Barras)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sport" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="reservas" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estados de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Pagos Completados</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">{stats.completedPayments}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Pagos Pendientes</span>
                      </div>
                      <span className="text-xl font-bold text-yellow-600">{stats.pendingPayments}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Pagos Rechazados</span>
                      </div>
                      <span className="text-xl font-bold text-red-600">{stats.failedPayments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;