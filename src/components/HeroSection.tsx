import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";
import sportsCourtBackground from "@/assets/sports-court-background.jpg";

interface HeroSectionProps {
  onReservarClick: () => void;
}

const HeroSection = ({ onReservarClick }: HeroSectionProps) => {
  const sports = [
    { name: "Fútbol", emoji: "⚽" },
    { name: "Paddle", emoji: "🏓" },
    { name: "Tenis", emoji: "🎾" },
    { name: "Golf", emoji: "🏌️" },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-hero text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${sportsCourtBackground})`,
          opacity: 0.3
        }}
      ></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse-glow delay-1000"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-bounce-soft">
            Reserva tu Cancha
            <span className="block text-2xl md:text-4xl font-medium mt-2 text-white/90">
              en el mejor club deportivo
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/80 max-w-2xl mx-auto">
            Disfruta de nuestras canchas de primera calidad para fútbol, paddle, tenis y golf
          </p>

          {/* Sports Icons */}
          <div className="flex justify-center space-x-6 mb-8">
            {sports.map((sport, index) => (
              <Card key={sport.name} className="p-4 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-3xl mb-2">{sport.emoji}</div>
                <p className="text-sm font-medium text-white">{sport.name}</p>
              </Card>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={onReservarClick}
            size="lg"
            className="text-xl px-12 py-6 bg-white text-primary hover:bg-white/90 shadow-glow hover:scale-105 transition-all duration-300 font-bold"
          >
            <CalendarCheck className="w-6 h-6 mr-3" />
            RESERVA AHORA
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;