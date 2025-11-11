import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface Reservation {
  id: string;
  customer_name: string;
  sport: string;
  date: string;
  time: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get reservations for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("*")
      .eq("date", tomorrowStr)
      .eq("payment_status", "completed");

    if (reservationsError) throw reservationsError;

    if (!reservations || reservations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reservations found for tomorrow" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get all push subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (subscriptionsError) throw subscriptionsError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No push subscriptions found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send notifications for each reservation
    const notificationPromises = reservations.map(async (reservation: Reservation) => {
      const message = {
        title: "🎾 Recordatorio de Reserva - MatchPoint",
        body: `¡Hola ${reservation.customer_name}! Tu reserva de ${reservation.sport} es mañana a las ${reservation.time}. ¡Te esperamos!`,
        tag: `reservation-${reservation.id}`,
        url: "/"
      };

      // Send to all subscriptions (in production, you'd filter by customer)
      const sendPromises = subscriptions.map(async (subscription: PushSubscription) => {
        try {
          // Note: In production, you need to use web-push library with proper VAPID keys
          // This is a simplified example
          console.log(`Would send notification to ${subscription.endpoint}:`, message);
          
          // For now, just log - in production use proper web-push implementation
          return { success: true, endpoint: subscription.endpoint };
        } catch (error) {
          console.error(`Failed to send to ${subscription.endpoint}:`, error);
          return { success: false, endpoint: subscription.endpoint, error };
        }
      });

      return Promise.all(sendPromises);
    });

    const results = await Promise.all(notificationPromises);

    return new Response(
      JSON.stringify({
        message: "Notifications processed",
        reservationsCount: reservations.length,
        subscriptionsCount: subscriptions.length,
        results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-reservation-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
