import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { sport, date, time, duration, customerName, customerPhone, customerEmail, amount } = await req.json()

    console.log('Creating payment for:', { sport, date, time, customerName, amount })

    // Create reservation first
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        sport,
        date,
        time,
        duration,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        amount,
        payment_status: 'pending'
      })
      .select()
      .single()

    if (reservationError) {
      console.error('Error creating reservation:', reservationError)
      throw reservationError
    }

    console.log('Reservation created:', reservation)

    // Create MercadoPago preference
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('MercadoPago access token not configured')
    }

    const preference = {
      items: [
        {
          title: `Reserva de ${sport}`,
          description: `${date} a las ${time} - ${duration} minutos`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: parseFloat(amount)
        }
      ],
      payer: {
        name: customerName,
        phone: {
          number: customerPhone
        }
      },
      back_urls: {
        success: `${req.headers.get('origin')}/payment/success`,
        failure: `${req.headers.get('origin')}/payment/failure`,
        pending: `${req.headers.get('origin')}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: reservation.id
    }

    console.log('Creating MercadoPago preference:', preference)

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference)
    })

    const mpData = await mpResponse.json()
    
    if (!mpResponse.ok) {
      console.error('MercadoPago error:', mpData)
      throw new Error(`MercadoPago error: ${mpData.message || 'Unknown error'}`)
    }

    console.log('MercadoPago preference created:', mpData)

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        reservation_id: reservation.id,
        mercadopago_preference_id: mpData.id,
        amount,
        currency: 'ARS',
        status: 'pending'
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      throw transactionError
    }

    // Update reservation with payment_id
    await supabase
      .from('reservations')
      .update({ payment_id: transaction.id })
      .eq('id', reservation.id)

    console.log('Transaction created and linked:', transaction)

    // Send QR code email
    try {
      await supabase.functions.invoke('send-qr-email', {
        body: {
          email: customerEmail,
          customerName,
          sport,
          date,
          time,
          amount
        }
      });
      console.log('QR email sent successfully');
    } catch (emailError) {
      console.error('Error sending QR email:', emailError);
      // Don't fail the payment if email fails
    }

    return new Response(
      JSON.stringify({ 
        reservation_id: reservation.id,
        init_point: mpData.init_point,
        preference_id: mpData.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-payment function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})