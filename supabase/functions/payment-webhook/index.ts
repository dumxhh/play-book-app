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

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('MercadoPago access token not configured')
    }

    const body = await req.json()
    console.log('Webhook received:', body)

    // Verify webhook is from MercadoPago
    if (body.type === 'payment') {
      const paymentId = body.data.id
      
      // Get payment details from MercadoPago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      const paymentData = await mpResponse.json()
      console.log('Payment data from MP:', paymentData)

      if (paymentData.external_reference) {
        const reservationId = paymentData.external_reference

        // Update transaction status
        const { error: transactionError } = await supabase
          .from('transactions')
          .update({
            mercadopago_payment_id: paymentId,
            status: paymentData.status,
            payment_method: paymentData.payment_method_id
          })
          .eq('reservation_id', reservationId)

        if (transactionError) {
          console.error('Error updating transaction:', transactionError)
        }

        // Update reservation payment status
        let paymentStatus = 'pending'
        if (paymentData.status === 'approved') {
          paymentStatus = 'completed'
        } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
          paymentStatus = 'failed'
        }

        const { data: reservationData, error: reservationError } = await supabase
          .from('reservations')
          .update({ payment_status: paymentStatus })
          .eq('id', reservationId)
          .select()
          .single()

        if (reservationError) {
          console.error('Error updating reservation:', reservationError)
        } else {
          console.log(`Reservation ${reservationId} updated to status: ${paymentStatus}`)
          
          // Si el pago fue aprobado y hay email, enviar QR automáticamente
          if (paymentStatus === 'completed' && reservationData?.customer_email) {
            try {
              console.log('Sending QR email to:', reservationData.customer_email)
              
              const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-qr-email`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: reservationData.customer_email,
                  customerName: reservationData.customer_name,
                  sport: reservationData.sport,
                  date: reservationData.date,
                  time: reservationData.time,
                  amount: reservationData.amount
                })
              })
              
              if (emailResponse.ok) {
                console.log('QR email sent successfully')
              } else {
                console.error('Failed to send QR email:', await emailResponse.text())
              }
            } catch (emailError) {
              console.error('Error sending QR email:', emailError)
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in payment webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})