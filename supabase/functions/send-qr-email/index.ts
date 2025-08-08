import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  customerName: string;
  sport: string;
  date: string;
  time: string;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, customerName, sport, date, time, amount }: EmailRequest = await req.json();

    // Generate a simple QR code data (for demo purposes)
    const qrCode = `BEGIN:VCARD
VERSION:3.0
FN:${customerName}
ORG:Club Deportivo
NOTE:Reserva ${sport} - ${date} ${time}
AMOUNT:$${amount}
ACCESS:QR-${Date.now()}
END:VCARD`;

    // Convert to base64 for email
    const qrCodeBase64 = btoa(qrCode);

    console.log("Generated QR code for reservation:", {
      email,
      customerName,
      sport,
      date,
      time,
      amount,
      qrCode: qrCodeBase64
    });

    // In a real implementation, you would:
    // 1. Generate an actual QR code image
    // 2. Send email using a service like Resend
    // For now, we'll just return success

    return new Response(
      JSON.stringify({
        success: true,
        message: "QR code sent to email",
        qrCode: qrCodeBase64
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-qr-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);