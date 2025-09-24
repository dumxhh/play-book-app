import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Clock, DollarSign, MapPin, Phone, Mail, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Tournament {
  id: string;
  name: string;
  club_name: string;
  sport: string;
  court_type?: string;
  tournament_date: string;
  start_time: string;
  end_time: string;
  participants_count: number;
  max_participants?: number;
  entry_fee: number;
  total_prize?: number;
  description?: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  status: string;
  created_at: string;
}

interface TournamentFormData {
  name: string;
  club_name: string;
  sport: string;
  court_type: string;
  tournament_date: string;
  start_time: string;
  end_time: string;
  max_participants: string;
  entry_fee: string;
  total_prize: string;
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

const TournamentSection = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    club_name: '',
    sport: '',
    court_type: '',
    tournament_date: '',
    start_time: '',
    end_time: '',
    max_participants: '',
    entry_fee: '',
    total_prize: '',
    description: '',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  });

  const sports = [
    { value: 'futbol', label: 'Fútbol', emoji: '⚽' },
    { value: 'paddle', label: 'Paddle', emoji: '🏓' },
    { value: 'tenis', label: 'Tenis', emoji: '🎾' },
    { value: 'golf', label: 'Golf', emoji: '⛳' }
  ];

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .gte('tournament_date', new Date().toISOString().split('T')[0])
        .order('tournament_date', { ascending: true });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TournamentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const tournamentData = {
        name: formData.name,
        club_name: formData.club_name,
        sport: formData.sport,
        court_type: formData.court_type || null,
        tournament_date: formData.tournament_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        entry_fee: parseFloat(formData.entry_fee),
        total_prize: formData.total_prize ? parseFloat(formData.total_prize) : null,
        description: formData.description || null,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('tournaments')
        .insert([tournamentData]);

      if (error) throw error;

      toast({
        title: "¡Torneo registrado!",
        description: "Tu propuesta de torneo ha sido enviada. Te contactaremos pronto.",
      });

      // Reset form
      setFormData({
        name: '',
        club_name: '',
        sport: '',
        court_type: '',
        tournament_date: '',
        start_time: '',
        end_time: '',
        max_participants: '',
        entry_fee: '',
        total_prize: '',
        description: '',
        contact_name: '',
        contact_phone: '',
        contact_email: ''
      });

      setIsModalOpen(false);
      fetchTournaments();
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el torneo. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSportEmoji = (sport: string) => {
    const sportObj = sports.find(s => s.value === sport);
    return sportObj?.emoji || '🏃';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>;
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando torneos...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-accent/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Torneos Deportivos</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Participa en torneos emocionantes o organiza el tuyo propio con precios especiales
          </p>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white">
                <Plus className="h-5 w-5 mr-2" />
                Organizar Torneo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Registrar Nuevo Torneo</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Torneo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Copa de Verano 2024"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="club_name">Club/Organizador *</Label>
                    <Input
                      id="club_name"
                      value={formData.club_name}
                      onChange={(e) => handleInputChange('club_name', e.target.value)}
                      placeholder="Club Deportivo Los Campeones"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sport">Deporte *</Label>
                    <Select value={formData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un deporte" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.value} value={sport.value}>
                            {sport.emoji} {sport.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="court_type">Tipo de Cancha</Label>
                    <Input
                      id="court_type"
                      value={formData.court_type}
                      onChange={(e) => handleInputChange('court_type', e.target.value)}
                      placeholder="Pasto sintético, Clay, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tournament_date">Fecha del Torneo *</Label>
                    <Input
                      id="tournament_date"
                      type="date"
                      value={formData.tournament_date}
                      onChange={(e) => handleInputChange('tournament_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Hora de Inicio *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Hora de Fin *</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => handleInputChange('end_time', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Máx. Participantes</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => handleInputChange('max_participants', e.target.value)}
                      placeholder="16"
                      min="2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="entry_fee">Precio de Entrada *</Label>
                    <Input
                      id="entry_fee"
                      type="number"
                      step="0.01"
                      value={formData.entry_fee}
                      onChange={(e) => handleInputChange('entry_fee', e.target.value)}
                      placeholder="50.00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="total_prize">Premio Total</Label>
                    <Input
                      id="total_prize"
                      type="number"
                      step="0.01"
                      value={formData.total_prize}
                      onChange={(e) => handleInputChange('total_prize', e.target.value)}
                      placeholder="500.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del Torneo</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe las reglas, categorías, premios y cualquier información relevante..."
                    rows={3}
                  />
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Información de Contacto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Nombre de Contacto *</Label>
                      <Input
                        id="contact_name"
                        value={formData.contact_name}
                        onChange={(e) => handleInputChange('contact_name', e.target.value)}
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">Teléfono *</Label>
                      <Input
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        placeholder="+54 11 1234-5678"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        placeholder="juan@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Registrando..." : "Registrar Torneo"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tournaments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getSportEmoji(tournament.sport)}</span>
                    <div>
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{tournament.club_name}</p>
                    </div>
                  </div>
                  {getStatusBadge(tournament.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{formatDate(tournament.tournament_date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{formatTime(tournament.start_time)} - {formatTime(tournament.end_time)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-semibold">${tournament.entry_fee}</span>
                    {tournament.total_prize && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>${tournament.total_prize} en premios</span>
                      </>
                    )}
                  </div>
                  
                  {tournament.max_participants && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        {tournament.participants_count}/{tournament.max_participants} participantes
                      </span>
                    </div>
                  )}
                </div>

                {tournament.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {tournament.description}
                  </p>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{tournament.contact_phone}</span>
                  </div>
                  {tournament.contact_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{tournament.contact_email}</span>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  variant={tournament.status === 'confirmed' ? 'default' : 'outline'}
                  disabled={tournament.status !== 'confirmed'}
                >
                  {tournament.status === 'confirmed' ? 'Inscribirse' : 'Pendiente de Confirmación'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              No hay torneos próximos
            </h3>
            <p className="text-muted-foreground mb-6">
              ¡Sé el primero en organizar un torneo emocionante!
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Organizar Torneo
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TournamentSection;