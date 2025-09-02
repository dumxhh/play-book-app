import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Users, DollarSign, Check, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const sports = [
    { id: 'futbol', name: 'Fútbol', price: 15000, defaultDuration: 90, capacity: '10v10', emoji: '⚽' },
    { id: 'paddle', name: 'Paddle', price: 8000, defaultDuration: 60, capacity: '2v2', emoji: '🏓' },
    { id: 'tenis', name: 'Tenis', price: 7000, defaultDuration: 60, capacity: '1v1 o 2v2', emoji: '🎾' },
    { id: 'golf', name: 'Golf', price: 25000, defaultDuration: 180, capacity: '1-4 jugadores', emoji: '🏌️' }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const selectedSportData = sports.find(s => s.id === selectedSport);

  const isTimeSlotAvailable = (time: string) => {
    if (!selectedDate) return false;
    
    return !existingReservations.some(reservation => {
      const reservationDate = reservation.date;
      const isSameDate = format(new Date(reservationDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      if (!isSameDate || reservation.sport !== selectedSport) return false;
      
      const reservationTime = reservation.time;
      return reservationTime === time;
    });
  };

  const calculateAmount = () => {
    if (!selectedSportData) return 0;
    return (selectedSportData.price * duration) / 60;
  };

  const handlePayment = async () => {
    if (!selectedSportData || !selectedDate || !selectedTime || !customerName || !customerPhone || !customerEmail) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          sport: selectedSport,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          duration,
          customerName,
          customerPhone,
          customerEmail,
          amount: calculateAmount()
        }
      });

      if (error) throw error;

      // Redirect to MercadoPago
      window.open(data.init_point, '_blank');

      toast({
        title: "Redirigiendo a MercadoPago",
        description: "Serás redirigido para completar el pago",
      });

      handleClose();

    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el pago. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedSport('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setDuration(60);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setIsProcessing(false);
    onClose();
  };

  const nextStep = () => {
    if (step === 1 && selectedSport) {
      const sportData = sports.find(s => s.id === selectedSport);
      if (sportData) {
        setDuration(sportData.defaultDuration);
      }
    }
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1: return selectedSport !== '';
      case 2: return selectedDate !== undefined;
      case 3: return selectedTime !== '';
      case 4: return customerName.trim() !== '' && customerPhone.trim() !== '' && customerEmail.trim() !== '';
      default: return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto court-background backdrop-blur-sm border-2 animate-rainbow-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center animate-neon-flicker text-white">
            ⚽ Reservar Cancha 🏓
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-8 h-0.5 ${
                      step > stepNumber ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Sport Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Selecciona tu deporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sports.map((sport) => (
                <Card
                  key={sport.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSport === sport.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedSport(sport.id as SportType)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{sport.emoji}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold">{sport.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${sport.price.toLocaleString('es-AR')}/h</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{sport.defaultDuration}min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{sport.capacity}</span>
                          </div>
                        </div>
                      </div>
                      {selectedSport === sport.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Selecciona la fecha</h3>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={es}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            {selectedDate && (
              <div className="text-center p-3 bg-accent rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Time Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Selecciona el horario</h3>
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((time) => {
                const available = isTimeSlotAvailable(time);
                return (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    disabled={!available}
                    onClick={() => setSelectedTime(time)}
                    className="h-12"
                  >
                    <div className="text-center">
                      <div className="font-medium">{time}</div>
                      {!available && (
                        <div className="text-xs text-muted-foreground">Ocupado</div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
            {selectedTime && selectedSportData && (
              <div className="p-4 bg-accent rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span>Duración:</span>
                  <Badge variant="secondary">{duration} minutos</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Precio:</span>
                  <Badge variant="secondary">${calculateAmount().toLocaleString('es-AR')}</Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Customer Information and Payment */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datos del cliente</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Nombre completo</Label>
                <Input
                  id="customerName"
                  placeholder="Tu nombre completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone">Teléfono</Label>
                <Input
                  id="customerPhone"
                  placeholder="Tu número de teléfono"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="tu@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Reservation Summary */}
            <div className="p-4 bg-accent rounded-lg space-y-3">
              <h4 className="font-semibold">Resumen de tu reserva</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Deporte:</span>
                  <span>{selectedSportData?.name} {selectedSportData?.emoji}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span>{selectedDate && format(selectedDate, "d/MM/yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horario:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración:</span>
                  <span>{duration} minutos</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateAmount().toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handlePayment}
                disabled={!canProceedToNextStep() || isProcessing}
                className="min-w-[150px] neon-button animate-float"
              >
                {isProcessing ? (
                  "Procesando..."
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>💳 Pagar con MercadoPago ✨</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservaModal;