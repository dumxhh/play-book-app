import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RecurringReservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  sport: string;
  day_of_week: number;
  time: string;
  duration: number;
  amount: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  payment_method: string;
  created_at: string;
}

const RecurringReservationsManagement = () => {
  const [reservations, setReservations] = useState<RecurringReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<RecurringReservation | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    sport: "futbol",
    day_of_week: 1,
    time: "18:00",
    duration: 60,
    amount: 0,
    start_date: "",
    end_date: "",
    payment_method: "monthly",
  });

  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("recurring_reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReservations(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingReservation) {
      const { error } = await supabase
        .from("recurring_reservations")
        .update(formData)
        .eq("id", editingReservation.id);

      if (!error) {
        toast({ title: "Reserva recurrente actualizada" });
        fetchReservations();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("recurring_reservations").insert(formData);

      if (!error) {
        toast({ title: "Reserva recurrente creada" });
        fetchReservations();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      sport: "futbol",
      day_of_week: 1,
      time: "18:00",
      duration: 60,
      amount: 0,
      start_date: "",
      end_date: "",
      payment_method: "monthly",
    });
    setEditingReservation(null);
    setIsDialogOpen(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("recurring_reservations")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (!error) {
      toast({ title: currentStatus ? "Reserva pausada" : "Reserva activada" });
      fetchReservations();
    }
  };

  const deleteReservation = async (id: string) => {
    const { error } = await supabase.from("recurring_reservations").delete().eq("id", id);

    if (!error) {
      toast({ title: "Reserva recurrente eliminada" });
      fetchReservations();
    }
  };

  const startEdit = (reservation: RecurringReservation) => {
    setEditingReservation(reservation);
    setFormData({
      customer_name: reservation.customer_name,
      customer_phone: reservation.customer_phone,
      customer_email: reservation.customer_email || "",
      sport: reservation.sport,
      day_of_week: reservation.day_of_week,
      time: reservation.time,
      duration: reservation.duration,
      amount: reservation.amount,
      start_date: reservation.start_date,
      end_date: reservation.end_date || "",
      payment_method: reservation.payment_method,
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reservas Recurrentes</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingReservation(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Reserva Recurrente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingReservation ? "Editar" : "Nueva"} Reserva Recurrente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Cliente</Label>
                    <Input
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Email (opcional)</Label>
                  <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Deporte</Label>
                    <Select value={formData.sport} onValueChange={(v) => setFormData({ ...formData, sport: v })}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label>Día de la Semana</Label>
                    <Select
                      value={formData.day_of_week.toString()}
                      onValueChange={(v) => setFormData({ ...formData, day_of_week: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dayNames.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Hora</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Duración (min)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Precio</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha de Inicio</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Fecha de Fin (opcional)</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Método de Pago</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual Automático</SelectItem>
                      <SelectItem value="prepaid">Prepago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingReservation ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando...</p>
        ) : reservations.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay reservas recurrentes</p>
        ) : (
          <div className="space-y-3">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{reservation.customer_name}</h3>
                        {reservation.is_active ? (
                          <Badge className="bg-green-500">Activa</Badge>
                        ) : (
                          <Badge variant="secondary">Pausada</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {dayNames[reservation.day_of_week]}s a las {reservation.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{reservation.duration} min - {reservation.sport}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span>${reservation.amount} - {reservation.payment_method}</span>
                        </div>
                        <div className="text-muted-foreground">
                          <span>
                            Desde {format(new Date(reservation.start_date), "dd/MM/yyyy")}
                            {reservation.end_date && ` hasta ${format(new Date(reservation.end_date), "dd/MM/yyyy")}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(reservation.id, reservation.is_active)}
                      >
                        {reservation.is_active ? "Pausar" : "Activar"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => startEdit(reservation)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteReservation(reservation.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecurringReservationsManagement;