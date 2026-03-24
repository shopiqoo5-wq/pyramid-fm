import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId } = await req.json()
    
    // 1. Initialize Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch Order Data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        company:companies(*),
        location:locations(*),
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) throw orderError || new Error('Order not found')

    // 3. Simulated PDF Generation Logic 
    // (In production, use a library like jspdf on edge or a specialized PDF API)
    const invoiceNumber = `INV-${order.custom_id}`
    const pdfUrl = `https://storage.pyramidfm.com/invoices/${invoiceNumber}.pdf`

    // 4. Update Invoice Record
    const { error: invoiceError } = await supabase
      .from('invoices')
      .upsert({
        order_id: orderId,
        invoice_number: invoiceNumber,
        pdf_url: pdfUrl
      })

    if (invoiceError) throw invoiceError

    return new Response(
      JSON.stringify({ message: 'Invoice generated successfully', invoiceNumber, pdfUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
