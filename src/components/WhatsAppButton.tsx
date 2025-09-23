import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = "2246536537";
  const message = "¡Hola! Me interesa hacer una reserva en el club deportivo. ¿Podrían ayudarme?";
  
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-4 left-4 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg animate-pulse z-40"
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};

export default WhatsAppButton;