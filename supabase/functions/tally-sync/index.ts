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
    const { companyId, startDate, endDate } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch invoices for the period
    const { data: invoices, error } = await supabase
      .from('orders')
      .select(`
        *,
        company:companies(*),
        items:order_items(*)
      `)
      .eq('company_id', companyId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error) throw error

    // Generate Tally-compatible XML
    let xml = `<?xml version="1.0"?>\n<ENVELOPE>\n  <HEADER>\n    <TALLYREQUEST>Import Data</TALLYREQUEST>\n  </HEADER>\n  <BODY>\n    <IMPORTDATA>\n      <REQUESTDESC>\n        <REPORTNAME>Vouchers</REPORTNAME>\n      </REQUESTDESC>\n      <REQUESTDATA>\n`

    invoices.forEach(inv => {
      xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n          <VOUCHER VCHTYPE="Sales" ACTION="Create">\n            <DATE>${inv.created_at.split('T')[0].replace(/-/g, '')}</DATE>\n            <VOUCHERNUMBER>${inv.custom_id}</VOUCHERNUMBER>\n            <PARTYLEDGERNAME>${inv.company.name}</PARTYLEDGERNAME>\n            <AMOUNT>${inv.net_amount}</AMOUNT>\n          </VOUCHER>\n        </TALLYMESSAGE>\n`
    })

    xml += `      </REQUESTDATA>\n    </IMPORTDATA>\n  </BODY>\n</ENVELOPE>`

    return new Response(xml, { 
      headers: { ...corsHeaders, 'Content-Type': 'application/xml' }, 
      status: 200 
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
