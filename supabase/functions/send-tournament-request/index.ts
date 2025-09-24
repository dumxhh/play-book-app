import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TournamentRequest {
  name: string;
  club_name: string;
  sport: string;
  court_type?: string;
  tournament_date?: string;
  start_time?: string;
  end_time?: string;
  max_participants?: string;
  entry_fee?: string;
  total_prize?: string;
  description?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const tournamentData: TournamentRequest = await req.json();
    console.log("Tournament request received:", tournamentData);

    // Format the email content
    const emailContent = `
      <h2>Nueva Solicitud de Torneo</h2>
      
      <h3>Detalles del Torneo:</h3>
      <ul>
        <li><strong>Nombre del Torneo:</strong> ${tournamentData.name}</li>
        <li><strong>Club/Organizador:</strong> ${tournamentData.club_name}</li>
        <li><strong>Deporte:</strong> ${tournamentData.sport}</li>
        ${tournamentData.court_type ? `<li><strong>Tipo de Cancha:</strong> ${tournamentData.court_type}</li>` : ''}
        ${tournamentData.tournament_date ? `<li><strong>Fecha Preferida:</strong> ${tournamentData.tournament_date}</li>` : ''}
        ${tournamentData.start_time ? `<li><strong>Hora de Inicio:</strong> ${tournamentData.start_time}</li>` : ''}
        ${tournamentData.end_time ? `<li><strong>Hora de Fin:</strong> ${tournamentData.end_time}</li>` : ''}
        ${tournamentData.max_participants ? `<li><strong>Participantes Esperados:</strong> ${tournamentData.max_participants}</li>` : ''}
        ${tournamentData.entry_fee ? `<li><strong>Precio de Entrada:</strong> $${tournamentData.entry_fee}</li>` : ''}
        ${tournamentData.total_prize ? `<li><strong>Premio Total:</strong> $${tournamentData.total_prize}</li>` : ''}
      </ul>

      ${tournamentData.description ? `
        <h3>Descripción:</h3>
        <p>${tournamentData.description.replace(/\n/g, '<br>')}</p>
      ` : ''}

      <h3>Información de Contacto:</h3>
      <ul>
        <li><strong>Nombre:</strong> ${tournamentData.contact_name}</li>
        <li><strong>Teléfono:</strong> ${tournamentData.contact_phone}</li>
        <li><strong>Email:</strong> ${tournamentData.contact_email}</li>
      </ul>

      <hr>
      <p><em>Esta solicitud fue enviada desde el sitio web del club deportivo.</em></p>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Solicitudes Deportes Club <onboarding@resend.dev>",
      to: ["timodiscord.x@gmail.com"],
      replyTo: tournamentData.contact_email,
      subject: `Nueva Solicitud de Torneo - ${tournamentData.name}`,
      html: emailContent
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Solicitud enviada correctamente",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
    
  } catch (error: any) {
    console.error("Error in send-tournament-request function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Error interno del servidor",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);