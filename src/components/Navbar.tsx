import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Navbar = ({ activeSection, onNavigate }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "inicio", label: "Inicio" },
    { id: "horarios", label: "Horarios" },
    { id: "ubicacion", label: "Ubicación" },
    { id: "precios", label: "Precios" },
  ];

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavClick("inicio")}
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚽</span>
            </div>
            <span className="text-xl font-bold text-foreground">Deportes Club</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === item.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Admin Access */}
            <Link to="/admin/panel">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left py-2 px-4 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              <Link to="/admin/panel" className="py-2 px-4">
                <Button variant="outline" size="sm" className="w-full flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Acceso Admin</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;