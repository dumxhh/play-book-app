import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Users, DollarSign, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Reservation, SportType } from "@/types/reservation";

interface ReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReserva: (reservation: Omit<Reservation, 'id'>) => void;
  existingReservations: Reservation[];
}

const ReservaModal = ({ isOpen, onClose, onReserva, existingReservations }: ReservaModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedSport, setSelectedSport] = useState<SportType | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const { toast } = useToast();

  const sports = [
    { id: 'futbol', name: 'Fútbol', price: 80, defaultDuration: 90, capacity: '10v10', emoji: '⚽' },
    { id: 'paddle', name: 'Paddle', price: 40, defaultDuration: 60, capacity: '2v2', emoji: '🏓' },
    { id: 'tenis', name: 'Tenis', price: 35, defaultDuration: 60, capacity: '1v1 o 2v2', emoji: '🎾' },
    { id: 'golf', name: 'Golf', price: 120, defaultDuration: 180, capacity: '1-4 jugadores', emoji: '🏌️' }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const selectedSportData = sports.find(s => s.id === selectedSport);

  const isTimeSlotAvailable = (time: string) => {
    if (!selectedDate) return false;
    
    return !existingReservations.some(reservation => {
      const reservationDate = new Date(reservation.date);
      if (reservationDate.toDateString() !== selectedDate.toDateString()) return false;
      if (reservation.sport !== selectedSport) return false;
      
      const startHour = parseInt(reservation.startTime.split(':')[0]);
      const endHour = parseInt(reservation.endTime.split(':')[0]);
      const timeHour = parseInt(time.split(':')[0]);
      
      return timeHour >= startHour && timeHour < endHour;
    });
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleReserva = () => {
    if (!selectedSportData || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const endTime = calculateEndTime(selectedTime, duration);
    
    const newReservation: Omit<Reservation, 'id'> = {
      sport: selectedSport as SportType,
      date: selectedDate,
      startTime: selectedTime,
      endTime: endTime,
      courtNumber: 1,
      status: 'confirmed'
    };

    onReserva(newReservation);
    
    toast({
      title: "¡Reserva confirmada!",
      description: `Tu cancha de ${selectedSportData.name} ha sido reservada para el ${format(selectedDate, "d 'de' MMMM", { locale: es })} a las ${selectedTime}`,
    });

    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedSport('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setCustomerName('');
    setCustomerPhone('');
    onClose();
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Realizar Reserva - Paso {step} de 4
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  num <= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {num < step ? <Check className="w-4 h-4" /> : num}
              </div>
            ))}
          </div>

          {/* Step 1: Select Sport */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Selecciona el deporte</h3>
              <div className="grid grid-cols-2 gap-4">
                {sports.map((sport) => (
                  <Card
                    key={sport.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedSport === sport.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => {
                      setSelectedSport(sport.id as SportType);
                      setDuration(sport.defaultDuration);
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{sport.emoji}</div>
                      <h4 className="font-medium">{sport.name}</h4>
                      <p className="text-sm text-muted-foreground">${sport.price}/hora</p>
                      <p className="text-xs text-muted-foreground">{sport.capacity}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Date */}
          {step === 2 && selectedSportData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Selecciona la fecha</h3>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={es}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="pointer-events-auto"
                />
              </div>
              {selectedDate && (
                <Card className="bg-accent/10">
                  <CardContent className="p-4 text-center">
                    <p className="font-medium">
                      {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSportData.name} - ${selectedSportData.price} por {selectedSportData.defaultDuration} min
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Select Time */}
          {step === 3 && selectedDate && selectedSportData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Selecciona el horario</h3>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {timeSlots.map((time) => {
                  const available = isTimeSlotAvailable(time);
                  return (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      disabled={!available}
                      onClick={() => setSelectedTime(time)}
                      className={`${
                        selectedTime === time 
                          ? 'bg-primary text-primary-foreground' 
                          : available 
                            ? 'hover:bg-accent' 
                            : 'opacity-50'
                      }`}
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
              
              {selectedTime && (
                <Card className="bg-accent/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Horario seleccionado</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedTime} - {calculateEndTime(selectedTime, duration)}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {duration} min
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 4: Customer Info */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Información de contacto</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Reservation Summary */}
              <Card className="bg-gradient-card border-primary/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Resumen de la reserva</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Deporte:</span>
                      <span className="font-medium">{selectedSportData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fecha:</span>
                      <span className="font-medium">
                        {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Horario:</span>
                      <span className="font-medium">
                        {selectedTime} - {selectedTime && calculateEndTime(selectedTime, duration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración:</span>
                      <span className="font-medium">{duration} minutos</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">${selectedSportData?.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={step === 1 ? handleClose : prevStep}
            >
              {step === 1 ? 'Cancelar' : 'Anterior'}
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (step === 1 && !selectedSport) ||
                  (step === 2 && !selectedDate) ||
                  (step === 3 && !selectedTime)
                }
                className="bg-gradient-primary text-primary-foreground"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleReserva}
                disabled={!customerName || !customerPhone}
                className="bg-gradient-primary text-primary-foreground"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmar Reserva
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservaModal;