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
    console.log('Webhook called - Method:', req.method);
    console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      console.error('MercadoPago access token not configured')
      throw new Error('MercadoPago access token not configured')
    }

    // Get the raw text first to debug
    const rawBody = await req.text()
    console.log('Raw body received:', rawBody)
    
    if (!rawBody || rawBody.trim() === '') {
      console.log('Empty body received, returning success')
      return new Response(
        JSON.stringify({ success: true, message: 'Empty body received' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = JSON.parse(rawBody)
    console.log('Webhook received:', JSON.stringify(body, null, 2))

    // Verify webhook is from MercadoPago
    if (body.type === 'payment' || body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data?.id || body.id
      
      if (!paymentId) {
        console.error('No payment ID found in webhook body')
        return new Response(
          JSON.stringify({ error: 'No payment ID found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Fetching payment details for ID:', paymentId)
      
      // Get payment details from MercadoPago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (!mpResponse.ok) {
        console.error('MercadoPago API error:', mpResponse.status, await mpResponse.text())
        throw new Error(`MercadoPago API returned ${mpResponse.status}`)
      }

      const paymentData = await mpResponse.json()
      console.log('Payment data from MP:', JSON.stringify(paymentData, null, 2))

      if (paymentData.external_reference) {
        const reservationId = paymentData.external_reference
        console.log('Processing payment for reservation:', reservationId)

        // Update transaction status
        const { error: transactionError } = await supabase
          .from('transactions')
          .update({
            mercadopago_payment_id: paymentId.toString(),
            status: paymentData.status,
            payment_method: paymentData.payment_method_id
          })
          .eq('reservation_id', reservationId)

        if (transactionError) {
          console.error('Error updating transaction:', transactionError)
        } else {
          console.log('Transaction updated successfully')
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
          console.log('Reservation data:', reservationData)
          
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
      } else {
        console.log('No external_reference found in payment data')
      }
    } else {
      console.log('Webhook type not handled:', body.type || body.action)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { 
        status: 200,
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