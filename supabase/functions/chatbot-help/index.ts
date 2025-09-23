import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    console.log('Received chatbot message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente virtual para un club deportivo que ofrece canchas de fútbol, paddle, tenis y golf. 

INFORMACIÓN DEL CLUB:
- Deportes disponibles: Fútbol, Paddle, Tenis, Golf
- Horarios: Lunes a Domingo de 8:00 a 22:00
- Ubicación: Dirección del club deportivo
- Teléfono WhatsApp: 2246-536537
- Duración estándar: 90 min (fútbol), 60 min (paddle/tenis/golf)
- Sistema de reservas: Se pueden hacer reservas online con pago por MercadoPago
- Precios varían según deporte y horario

INSTRUCCIONES:
- Sé amigable y profesional
- Ayuda con información sobre reservas, horarios, precios y deportes
- Si no sabes algo específico, recomienda contactar por WhatsApp al 2246-536537
- Mantén respuestas concisas pero informativas
- Siempre promociona la facilidad del sistema de reservas online
- Si preguntan por cancelaciones o cambios, dirigir a WhatsApp o administración

Responde en español y ayuda a los usuarios con sus consultas sobre el club deportivo.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    console.log('Bot response:', botResponse);

    return new Response(
      JSON.stringify({ response: botResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chatbot function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error procesando tu consulta. Intenta de nuevo o contacta por WhatsApp al 2246-536537.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});