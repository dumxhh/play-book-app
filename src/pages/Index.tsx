import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HorarioSection from "@/components/HorarioSection";
import UbicacionSection from "@/components/UbicacionSection";
import PreciosSection from "@/components/PreciosSection";
import ReservaModal from "@/components/ReservaModal";
import type { Reservation } from "@/types/reservation";

const Index = () => {
  const [activeSection, setActiveSection] = useState("inicio");
  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([
    // Sample reservations
    {
      id: "1",
      sport: "futbol",
      date: new Date(),
      startTime: "14:00",
      endTime: "15:30",
      courtNumber: 1,
      status: "confirmed"
    },
    {
      id: "2",
      sport: "paddle",
      date: new Date(),
      startTime: "16:00",
      endTime: "17:00",
      courtNumber: 1,
      status: "confirmed"
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
