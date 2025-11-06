import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HorarioSection from "@/components/HorarioSection";
import UbicacionSection from "@/components/UbicacionSection";
import PreciosSection from "@/components/PreciosSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import InteractiveGallery from "@/components/InteractiveGallery";
import FloatingWeather from "@/components/FloatingWeather";
import ReservaModal from "@/components/ReservaModal";
import ChatBot from "@/components/ChatBot";
import { supabase } from "@/integrations/supabase/client";
import type { Reservation } from "@/types/reservation";

const Index = () => {
  const [activeSection, setActiveSection] = useState("inicio");
  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("payment_status", "completed");

    if (!error && data) {
      setReservations(data as Reservation[]);
    }
  };

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

  const handleReserva = () => {
    // Refresh reservations after successful payment
    fetchReservations();
    setIsReservaModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
      
      <main className="pt-16">
        <HeroSection onReservarClick={() => setIsReservaModalOpen(true)} />
        <HorarioSection />
        <UbicacionSection />
        <PreciosSection onReservarClick={() => setIsReservaModalOpen(true)} />
        <InteractiveGallery />
        <ReviewsSection />
      </main>

      <Footer />

      <ReservaModal
        isOpen={isReservaModalOpen}
        onClose={() => setIsReservaModalOpen(false)}
        onReserva={handleReserva}
        existingReservations={reservations}
      />

      <FloatingWeather />
      <ChatBot />
    </div>
  );
};

export default Index;
