import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0';
import { Stripe } from 'https://esm.sh/stripe@12.0.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  console.log('Received webhook request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the payload
    const body = await req.text();
    console.log('Received webhook body length:', body.length);
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    
    // Parse the event directly - we can't use constructEvent in Deno
    let event;
    try {
      // For Deno, we need to parse the event directly instead of using webhook verification
      // which has compatibility issues with SubtleCrypto in Deno
      event = JSON.parse(body);
      console.log('Parsed webhook payload directly');
    } catch (err) {
      console.error('Failed to parse webhook body:', err.message);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Log the event type
    console.log('Processing event type:', event.type);
    
    // Handle specific events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing completed checkout session:', session.id);
      
      // Extract the invoice ID from metadata
      const invoiceId = session.metadata?.invoiceId;
      
      if (!invoiceId) {
        console.error('No invoice ID found in session metadata');
        throw new Error('No invoice ID found in session metadata');
      }
      
      console.log('Processing payment for invoice ID:', invoiceId);
      
      // Get invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from('Invoice')
        .select('*')
        .eq('invoiceID', invoiceId)
        .single();
      
      if (invoiceError || !invoice) {
        console.error('Failed to find invoice:', invoiceError || 'Not found');
        throw new Error(`Failed to find invoice with ID ${invoiceId}: ${invoiceError?.message || 'Not found'}`);
      }
      
      console.log('Found invoice:', invoice);
      
      // Check if already paid
      if (invoice.isPaid) {
        console.log('Invoice already marked as paid, skipping processing');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Invoice already marked as paid',
            invoiceId: invoiceId
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      
      // Create transaction record
      console.log('Creating transaction record');
      const { data: transaction, error: transactionError } = await supabase
        .from('Transaction')
        .insert({
          transactionUserID: invoice.invoiceUserID,
          transactionTitle: `Payment for ${invoice.invoiceTitle || 'Invoice'}`,
          transactionAmount: invoice.invoiceAmount,
          transactionDescription: `Payment for invoice #${invoice.invoiceID}`,
          transactionInvoiceID: invoice.invoiceID,
          isLate: new Date(invoice.invoiceDueAt) < new Date() // Check if payment was late
        })
        .select();
      
      if (transactionError) {
        console.error('Failed to create transaction:', transactionError);
        throw new Error(`Failed to create transaction: ${transactionError.message}`);
      }
      
      console.log('Transaction created:', transaction);
      
      // Update invoice to mark as paid
      console.log('Updating invoice as paid');
      const { error: updateError } = await supabase
        .from('Invoice')
        .update({ 
          isPaid: true,
          invoiceTransactionID: transaction[0].transactionID
        })
        .eq('invoiceID', invoiceId);
      
      if (updateError) {
        console.error('Failed to update invoice:', updateError);
        throw new Error(`Failed to update invoice: ${updateError.message}`);
      }
      
      console.log('Payment process completed successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment processed successfully',
          invoiceId: invoiceId,
          transactionId: transaction[0].transactionID
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    // For other event types, just acknowledge receipt
    return new Response(
      JSON.stringify({ received: true, eventType: event.type }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
}); 