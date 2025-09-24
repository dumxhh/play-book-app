import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon, Trophy, Send, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface TournamentFormData {
  name: string;
  club_name: string;
  sport: string;
  court_type: string;
  tournament_date: Date | null;
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

const TournamentRequest = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    club_name: '',
    sport: '',
    court_type: '',
    tournament_date: null,
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

  const handleInputChange = (field: keyof TournamentFormData, value: string | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Call the email sending edge function
      const { error } = await supabase.functions.invoke('send-tournament-request', {
        body: {
          ...formData,
          tournament_date: formData.tournament_date?.toISOString().split('T')[0]
        }
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud de torneo ha sido enviada. Te contactaremos pronto.",
      });

    } catch (error) {
      console.error('Error sending tournament request:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-primary mb-4">
                  ¡Solicitud Enviada con Éxito!
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Tu solicitud de torneo ha sido enviada a nuestro equipo. 
                  Revisaremos los detalles y te contactaremos dentro de las próximas 24-48 horas.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/">
                    <Button>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver al Inicio
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        club_name: '',
                        sport: '',
                        court_type: '',
                        tournament_date: null,
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
                    }}
                  >
                    Enviar Otra Solicitud
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
            <div className="text-center">
              <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-primary mb-4">
                Solicitud de Torneo
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                ¿Quieres organizar un torneo en nuestras instalaciones? 
                Completa este formulario y nos pondremos en contacto contigo.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Detalles del Torneo</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <Label htmlFor="court_type">Tipo de Cancha Preferida</Label>
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
                    <Label htmlFor="tournament_date">Fecha Preferida del Torneo *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.tournament_date ? format(formData.tournament_date, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.tournament_date || undefined}
                          onSelect={(date) => handleInputChange('tournament_date', date || null)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Hora de Inicio Estimada</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Hora de Fin Estimada</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => handleInputChange('end_time', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Participantes Esperados</Label>
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
                    <Label htmlFor="entry_fee">Precio de Entrada Propuesto</Label>
                    <Input
                      id="entry_fee"
                      type="number"
                      step="0.01"
                      value={formData.entry_fee}
                      onChange={(e) => handleInputChange('entry_fee', e.target.value)}
                      placeholder="50.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="total_prize">Premio Total Estimado</Label>
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
                    rows={4}
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
                      <Label htmlFor="contact_email">Email *</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        placeholder="juan@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">¿Qué pasa después?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Revisaremos tu solicitud dentro de 24-48 horas</li>
                    <li>• Te contactaremos para coordinar detalles y disponibilidad</li>
                    <li>• Trabajaremos juntos para hacer realidad tu torneo</li>
                    <li>• Recibirás precios especiales para eventos</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white text-lg py-6"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando Solicitud...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Enviar Solicitud de Torneo
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TournamentRequest;