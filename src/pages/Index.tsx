import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HorarioSection from "@/components/HorarioSection";
import UbicacionSection from "@/components/UbicacionSection";
import PreciosSection from "@/components/PreciosSection";
import ReservaModal from "@/components/ReservaModal";
import ReservationsSection from "@/components/ReservationsSection";
import type { Reservation } from "@/types/reservation";

const Index = () => {
  const [activeSection, setActiveSection] = useState("inicio");
  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([
    // Sample reservations
    {
      id: "1",
      sport: "futbol",
      date: "2024-01-06",
      time: "14:00",
      duration: 90,
      customer_name: "Juan Pérez",
      customer_phone: "1234567890",
      amount: 120,
      payment_status: "completed"
    },
    {
      id: "2",
      sport: "paddle", 
      date: "2024-01-06",
      time: "16:00",
      duration: 60,
      customer_name: "María González",
      customer_phone: "0987654321",
      amount: 40,
      payment_status: "completed"
    }
  ]);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section !== "inicio") {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReserva = (newReservation: Omit<Reservation, 'id'>) => {
    const reservation: Reservation = {
      ...newReservation,
      id: Date.now().toString()
    };
    setReservations(prev => [...prev, reservation]);
    setIsReservaModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
      
      <main className="pt-16">
        <HeroSection onReservarClick={() => setIsReservaModalOpen(true)} />
        <HorarioSection reservations={reservations} />
        <ReservationsSection />
        <UbicacionSection />
        <PreciosSection onReservarClick={() => setIsReservaModalOpen(true)} />
      </main>

      <ReservaModal
        isOpen={isReservaModalOpen}
        onClose={() => setIsReservaModalOpen(false)}
        onReserva={handleReserva}
        existingReservations={reservations}
      />
    </div>
  );
};

export default Index;
