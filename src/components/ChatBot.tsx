import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente virtual de MatchPoint. ¿En qué puedo ayudarte hoy? Puedo darte información sobre reservas, horarios, precios y nuestros deportes disponibles.',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Sistema de respuestas predefinidas
  const getPresetResponse = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('horario') || lowerMessage.includes('hora')) {
      return 'Nuestros horarios son: Lunes a Viernes de 8:00 a 22:00, Sábados de 9:00 a 23:00, y Domingos de 10:00 a 20:00.';
    }
    
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('tarifa')) {
      return 'Nuestros precios por hora son: Fútbol $120, Paddle $40, Tenis $35, Golf $80. Incluyen todos los servicios básicos.';
    }
    
    if (lowerMessage.includes('reserva') || lowerMessage.includes('reservar')) {
      return 'Para hacer una reserva, haz clic en el botón "RESERVA AHORA" en la página principal. Podrás elegir deporte, fecha, hora y realizar el pago con MercadoPago.';
    }
    
    if (lowerMessage.includes('ubicación') || lowerMessage.includes('dirección') || lowerMessage.includes('donde')) {
      return 'Nos encontramos en Av. Principal 123, Ciudad Deportiva. Tenemos estacionamiento gratuito y fácil acceso en transporte público.';
    }
    
    if (lowerMessage.includes('pago') || lowerMessage.includes('mercadopago')) {
      return 'Aceptamos pagos con MercadoPago de forma segura. Puedes pagar con tarjeta de crédito, débito o efectivo en Rapipago/Pago Fácil.';
    }
    
    if (lowerMessage.includes('contacto') || lowerMessage.includes('teléfono') || lowerMessage.includes('whatsapp')) {
      return 'Puedes contactarnos por WhatsApp al 2246-536537 o visitarnos en nuestras instalaciones. ¡Estamos aquí para ayudarte!';
    }
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
      return '¡Hola! Bienvenido a MatchPoint. ¿En qué puedo ayudarte? Puedo darte información sobre horarios, precios, reservas o ubicación.';
    }
    
    return null;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Primero intentar respuesta predefinida
    const presetResponse = getPresetResponse(currentMessage);
    
    if (presetResponse) {
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: presetResponse,
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 800);
      return;
    }

    // Si no hay respuesta predefinida, usar OpenAI
    try {
      const { data, error } = await supabase.functions.invoke('chatbot-help', {
        body: { message: currentMessage }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Lo siento, no tengo información específica sobre eso. ¿Puedes ser más específico sobre horarios, precios, reservas o ubicación?',
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, no pude procesar tu consulta. Prueba preguntando sobre horarios, precios, reservas o ubicación. Para asistencia directa contacta al 2246-536537.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg animate-pulse"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 h-96 shadow-xl border-0 bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">Asistente Virtual</span>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <CardContent className="p-0 h-64 overflow-y-auto">
            <div className="p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-sm ${
                      message.isBot
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-2 rounded-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Escribiendo...</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatBot;