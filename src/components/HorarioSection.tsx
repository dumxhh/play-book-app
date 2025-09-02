import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Reservation, SportType } from "@/types/reservation";

interface HorarioSectionProps {
  reservations: Reservation[];
}

const HorarioSection = ({ reservations }: HorarioSectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');

  const sports = [
    { id: 'all' as const, name: 'Todos', color: 'bg-primary' },
    { id: 'futbol' as const, name: 'Fútbol', color: 'bg-success' },
    { id: 'paddle' as const, name: 'Paddle', color: 'bg-accent' },
    { id: 'tenis' as const, name: 'Tenis', color: 'bg-warning' },
    { id: 'golf' as const, name: 'Golf', color: 'bg-primary' }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const getReservationsForDate = (date: Date | undefined) => {
    if (!date) return [];
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      return reservationDate.toDateString() === date.toDateString() &&
             (selectedSport === 'all' || reservation.sport === selectedSport);
    });
  };

  const isTimeSlotOccupied = (time: string) => {
    const dayReservations = getReservationsForDate(selectedDate);
    return dayReservations.some(reservation => {
      const reservationTime = reservation.time;
      return reservationTime === time;
    });
  };

  const getReservationForTime = (time: string) => {
    const dayReservations = getReservationsForDate(selectedDate);
    return dayReservations.find(reservation => {
      return reservation.time === time;
    });
  };

  return (
    <section id="horarios" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Horarios Disponibles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Consulta la disponibilidad de nuestras canchas y planifica tu reserva
          </p>
        </div>

        {/* Unified Date and Time Selection */}
        <Card className="bg-gradient-card border-border shadow-soft max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Selecciona fecha y horario</span>
            </CardTitle>
            {/* Sport Filter */}
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <Button
                  key={sport.id}
                  variant={selectedSport === sport.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSport(sport.id)}
                  className={selectedSport === sport.id ? "bg-gradient-primary text-primary-foreground" : ""}
                >
                  {sport.name}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Fecha</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={es}
                  className="w-full p-3 pointer-events-auto border rounded-lg"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
                
                {selectedDate && (
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <p className="font-medium text-foreground">
                      Fecha seleccionada:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                )}
              </div>

              {/* Time Slots Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Horarios disponibles</h3>
                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {timeSlots.map((time) => {
                      const isOccupied = isTimeSlotOccupied(time);
                      const reservation = getReservationForTime(time);
                      
                      return (
                        <div
                          key={time}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            isOccupied
                              ? 'bg-destructive/10 border-destructive/30'
                              : 'bg-success/10 border-success/30 hover:bg-success/20 cursor-pointer'
                          }`}
                        >
                          <div className="text-sm font-medium">{time}</div>
                          <Badge
                            variant={isOccupied ? "destructive" : "default"}
                            className="text-xs mt-1"
                          >
                            {isOccupied ? 'Ocupado' : 'Disponible'}
                          </Badge>
                          {reservation && (
                            <div className="text-xs text-muted-foreground mt-1 capitalize">
                              {reservation.sport}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Selecciona una fecha para ver los horarios disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HorarioSection;