import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];

  const footerLinks = [
    { title: "Sobre Nosotros", href: "#" },
    { title: "Políticas de Privacidad", href: "#" },
    { title: "Términos y Condiciones", href: "#" },
    { title: "FAQ", href: "#" }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold">🏆</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">MatchPoint</h3>
                <p className="text-sm text-white/80">Tu mejor jugada deportiva</p>
              </div>
            </div>
            <p className="text-white/80 text-sm">
              MatchPoint - El mejor lugar para disfrutar del fútbol, paddle, tenis y golf. 
              Reserva tu cancha fácilmente y vive la experiencia deportiva que mereces.
            </p>
          </div>

          {/* Enlaces útiles */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Descubre más</h4>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contacto directo</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm">reservas@matchpoint.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm">Santa Teresita, Buenos Aires, Argentina</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm">Lun-Dom: 8:00 - 23:00</span>
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Redes sociales</h4>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 bg-white/10 hover:bg-white/20 text-white border-none"
                    asChild
                  >
                    <a 
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <IconComponent className="w-4 h-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                <span className="text-xs">🇦🇷</span>
                <span className="text-white/80 text-sm">Argentina</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-white/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/60 text-sm">
              © {currentYear} MatchPoint. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">
                Política de Privacidad
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;