import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Edit, 
  Trash2, 
  Plus, 
  DollarSign, 
  Ban, 
  CalendarIcon,
  Clock,
  FileText,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  internal_notes?: string;
  is_blocked?: boolean;
  blocked_reason?: string;
  refund_amount?: number;
  refund_status?: string;
  refund_date?: string;
  created_at: string;
}

interface TimeBlock {
  id: string;
  sport: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_by?: string;
}

const AdminReservationManagement = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    sport: '',
    date: null as Date | null,
    time: '',
    duration: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    amount: '',
    payment_status: 'pending' as 'pending' | 'completed' | 'failed',
    internal_notes: ''
  });

  const [createForm, setCreateForm] = useState({
    sport: '',
    date: null as Date | null,
    time: '',
    duration: '60',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    amount: '',
    payment_status: 'completed' as 'pending' | 'completed' | 'failed'
  });

  const [blockForm, setBlockForm] = useState({
    sport: '',
    date: null as Date | null,
    start_time: '',
    end_time: '',
    reason: ''
  });

  const [refundForm, setRefundForm] = useState({
    refund_amount: '',
    refund_reason: ''
  });

  const sports = [
    { value: 'futbol', label: 'Fútbol' },
    { value: 'paddle', label: 'Paddle' },
    { value: 'tenis', label: 'Tenis' },
    { value: 'golf', label: 'Golf' }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchReservations(), fetchTimeBlocks()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations((data || []) as Reservation[]);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive"
      });
    }
  };

  const fetchTimeBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('time_blocks')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setTimeBlocks(data || []);
    } catch (error) {
      console.error('Error fetching time blocks:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios bloqueados",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (reservation: Reservation) => {
    try {
      setSelectedReservation(reservation);
      setEditForm({
        sport: reservation.sport,
        date: reservation.date ? new Date(reservation.date) : null,
        time: reservation.time || '',
        duration: reservation.duration ? reservation.duration.toString() : '60',
        customer_name: reservation.customer_name || '',
        customer_phone: reservation.customer_phone || '',
        customer_email: reservation.customer_email || '',
        amount: reservation.amount ? reservation.amount.toString() : '0',
        payment_status: reservation.payment_status || 'pending',
        internal_notes: reservation.internal_notes || ''
      });
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error opening edit modal:', error);
      toast({
        title: "Error",
        description: "No se pudo abrir el editor de reserva",
        variant: "destructive"
      });
    }
  };

  const handleUpdateReservation = async () => {
    if (!selectedReservation || !editForm.date) {
      toast({
        title: "Error",
        description: "Datos incompletos para actualizar la reserva",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          sport: editForm.sport,
          date: format(editForm.date, 'yyyy-MM-dd'),
          time: editForm.time,
          duration: parseInt(editForm.duration) || 60,
          customer_name: editForm.customer_name,
          customer_phone: editForm.customer_phone,
          customer_email: editForm.customer_email || null,
          amount: parseFloat(editForm.amount) || 0,
          payment_status: editForm.payment_status,
          internal_notes: editForm.internal_notes || null
        })
        .eq('id', selectedReservation.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Reserva actualizada correctamente"
      });

      setIsEditModalOpen(false);
      await fetchReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la reserva",
        variant: "destructive"
      });
    }
  };

  const handleCreateReservation = async () => {
    try {
      const { error } = await supabase
        .from('reservations')
        .insert([{
          sport: createForm.sport,
          date: createForm.date?.toISOString().split('T')[0],
          time: createForm.time,
          duration: parseInt(createForm.duration),
          customer_name: createForm.customer_name,
          customer_phone: createForm.customer_phone,
          customer_email: createForm.customer_email || null,
          amount: parseFloat(createForm.amount),
          payment_status: createForm.payment_status
        }]);

      if (error) throw error;

      toast({
        title: "Reserva creada",
        description: "La reserva se ha creado correctamente."
      });

      setIsCreateModalOpen(false);
      setCreateForm({
        sport: '',
        date: null,
        time: '',
        duration: '60',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        amount: '',
        payment_status: 'completed'
      });
      fetchReservations();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la reserva.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reserva?')) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);

      if (error) throw error;

      toast({
        title: "Reserva eliminada",
        description: "La reserva se ha eliminado correctamente."
      });

      fetchReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la reserva.",
        variant: "destructive"
      });
    }
  };

  const handleCreateTimeBlock = async () => {
    try {
      const { error } = await supabase
        .from('time_blocks')
        .insert([{
          sport: blockForm.sport,
          date: blockForm.date?.toISOString().split('T')[0],
          start_time: blockForm.start_time,
          end_time: blockForm.end_time,
          reason: blockForm.reason,
          created_by: 'Admin'
        }]);

      if (error) throw error;

      toast({
        title: "Horario bloqueado",
        description: "El horario se ha bloqueado correctamente."
      });

      setIsBlockModalOpen(false);
      setBlockForm({
        sport: '',
        date: null,
        start_time: '',
        end_time: '',
        reason: ''
      });
      fetchTimeBlocks();
    } catch (error) {
      console.error('Error creating time block:', error);
      toast({
        title: "Error",
        description: "No se pudo bloquear el horario.",
        variant: "destructive"
      });
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedReservation) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          refund_amount: parseFloat(refundForm.refund_amount),
          refund_status: 'processed',
          refund_date: new Date().toISOString(),
          internal_notes: `${selectedReservation.internal_notes || ''}\nReembolso procesado: $${refundForm.refund_amount} - ${refundForm.refund_reason}`.trim()
        })
        .eq('id', selectedReservation.id);

      if (error) throw error;

      toast({
        title: "Reembolso procesado",
        description: "El reembolso se ha procesado correctamente."
      });

      setIsRefundModalOpen(false);
      setRefundForm({ refund_amount: '', refund_reason: '' });
      fetchReservations();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el reembolso.",
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

  const getSportEmoji = (sport: string) => {
    switch (sport) {
      case 'futbol': return '⚽';
      case 'paddle': return '🏓';
      case 'tenis': return '🎾';
      case 'golf': return '⛳';
      default: return '🏃';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Reserva Manual
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Reserva</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deporte</Label>
                <Select value={createForm.sport} onValueChange={(value) => setCreateForm({...createForm, sport: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar deporte" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map(sport => (
                      <SelectItem key={sport.value} value={sport.value}>{sport.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {createForm.date ? format(createForm.date, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={createForm.date || undefined}
                      onSelect={(date) => setCreateForm({...createForm, date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Select value={createForm.time} onValueChange={(value) => setCreateForm({...createForm, time: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duración (minutos)</Label>
                <Input
                  type="number"
                  value={createForm.duration}
                  onChange={(e) => setCreateForm({...createForm, duration: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre del Cliente</Label>
                <Input
                  value={createForm.customer_name}
                  onChange={(e) => setCreateForm({...createForm, customer_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={createForm.customer_phone}
                  onChange={(e) => setCreateForm({...createForm, customer_phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email (opcional)</Label>
                <Input
                  type="email"
                  value={createForm.customer_email}
                  onChange={(e) => setCreateForm({...createForm, customer_email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({...createForm, amount: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Estado de Pago</Label>
                <Select value={createForm.payment_status} onValueChange={(value: any) => setCreateForm({...createForm, payment_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="failed">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleCreateReservation} className="flex-1">
                Crear Reserva
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Ban className="h-4 w-4 mr-2" />
              Bloquear Horario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bloquear Horario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deporte</Label>
                  <Select value={blockForm.sport} onValueChange={(value) => setBlockForm({...blockForm, sport: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar deporte" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map(sport => (
                        <SelectItem key={sport.value} value={sport.value}>{sport.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {blockForm.date ? format(blockForm.date, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={blockForm.date || undefined}
                        onSelect={(date) => setBlockForm({...blockForm, date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Hora de Inicio</Label>
                  <Select value={blockForm.start_time} onValueChange={(value) => setBlockForm({...blockForm, start_time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hora inicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hora de Fin</Label>
                  <Select value={blockForm.end_time} onValueChange={(value) => setBlockForm({...blockForm, end_time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hora fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Motivo del Bloqueo</Label>
                <Textarea
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                  placeholder="Ej: Mantenimiento de cancha, evento especial, etc."
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsBlockModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleCreateTimeBlock} className="flex-1">
                Bloquear Horario
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Reservations List */}
      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getSportEmoji(reservation.sport)}</span>
                  <div>
                    <h3 className="font-semibold">{reservation.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {reservation.sport.charAt(0).toUpperCase() + reservation.sport.slice(1)} • 
                      {reservation.date} {reservation.time} • 
                      {reservation.duration} min • 
                      ${reservation.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.customer_phone}
                      {reservation.customer_email && ` • ${reservation.customer_email}`}
                    </p>
                    {reservation.internal_notes && (
                      <p className="text-sm text-blue-600 mt-1">
                        <FileText className="h-3 w-3 inline mr-1" />
                        {reservation.internal_notes}
                      </p>
                    )}
                    {reservation.refund_status === 'processed' && (
                      <Badge className="bg-orange-100 text-orange-800 mt-1">
                        Reembolsado: ${reservation.refund_amount}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getPaymentStatusIcon(reservation.payment_status)}
                    <Badge className={`
                      ${reservation.payment_status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${reservation.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${reservation.payment_status === 'failed' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {reservation.payment_status === 'completed' ? 'Completado' :
                       reservation.payment_status === 'pending' ? 'Pendiente' : 'Rechazado'}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(reservation)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setRefundForm({
                        refund_amount: reservation.amount.toString(),
                        refund_reason: ''
                      });
                      setIsRefundModalOpen(true);
                    }}
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Reembolso
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteReservation(reservation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deporte</Label>
              <Select value={editForm.sport} onValueChange={(value) => setEditForm({...editForm, sport: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sports.map(sport => (
                    <SelectItem key={sport.value} value={sport.value}>{sport.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editForm.date ? format(editForm.date, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editForm.date || undefined}
                    onSelect={(date) => setEditForm({...editForm, date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Select value={editForm.time} onValueChange={(value) => setEditForm({...editForm, time: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duración (minutos)</Label>
              <Input
                type="number"
                value={editForm.duration}
                onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre del Cliente</Label>
              <Input
                value={editForm.customer_name}
                onChange={(e) => setEditForm({...editForm, customer_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={editForm.customer_phone}
                onChange={(e) => setEditForm({...editForm, customer_phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.customer_email}
                onChange={(e) => setEditForm({...editForm, customer_email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Estado de Pago</Label>
              <Select value={editForm.payment_status} onValueChange={(value: any) => setEditForm({...editForm, payment_status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="failed">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notas Internas</Label>
              <Textarea
                value={editForm.internal_notes}
                onChange={(e) => setEditForm({...editForm, internal_notes: e.target.value})}
                placeholder="Notas internas para el equipo..."
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleUpdateReservation} className="flex-1">
              Actualizar Reserva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Reembolso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monto a Reembolsar</Label>
              <Input
                type="number"
                step="0.01"
                value={refundForm.refund_amount}
                onChange={(e) => setRefundForm({...refundForm, refund_amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo del Reembolso</Label>
              <Textarea
                value={refundForm.refund_reason}
                onChange={(e) => setRefundForm({...refundForm, refund_reason: e.target.value})}
                placeholder="Motivo del reembolso..."
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsRefundModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleProcessRefund} className="flex-1">
              Procesar Reembolso
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Blocks Display */}
      {timeBlocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Horarios Bloqueados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeBlocks.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {getSportEmoji(block.sport)} {block.sport.charAt(0).toUpperCase() + block.sport.slice(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {block.date} • {block.start_time} - {block.end_time}
                    </p>
                    <p className="text-sm text-red-600">{block.reason}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const { error } = await supabase
                        .from('time_blocks')
                        .delete()
                        .eq('id', block.id);

                      if (!error) {
                        fetchTimeBlocks();
                        toast({
                          title: "Bloqueo eliminado",
                          description: "El bloqueo de horario se ha eliminado."
                        });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReservationManagement;