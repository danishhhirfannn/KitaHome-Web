import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Stripe } from 'https://esm.sh/stripe@12.0.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { invoiceId, title, description, amount, currency, successUrl, cancelUrl } = await req.json();
    
    // Initialize Stripe with your secret key from environment variables
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'myr',
            product_data: {
              name: title,
              description: description,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents/smallest currency unit
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}`,
      cancel_url: cancelUrl,
      metadata: {
        invoiceId: invoiceId,
      },
    });

    // Return the session ID
    return new Response(
      JSON.stringify({ id: session.id, url: session.url }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
}); 