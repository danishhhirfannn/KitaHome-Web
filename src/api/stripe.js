import { supabase } from './supabase';

// Get Stripe publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY;

// Function to create a Stripe checkout session for an invoice
export async function createStripeCheckoutSession(invoice) {
  try {
    console.log('Creating Stripe checkout session for invoice:', invoice);
    
    // Call the Supabase Edge Function directly via its URL
    const response = await fetch('https://gpbtkggpbuarrvkpiqzq.supabase.co/functions/v1/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Get the user's auth token for authentication (if needed)
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
      },
      body: JSON.stringify({
        invoiceId: invoice.id || invoice.invoiceID, // Handle both possible formats
        title: invoice.title || invoice.invoiceTitle,
        description: invoice.description || invoice.invoiceDescription,
        amount: typeof invoice.amount === 'string' 
          ? parseFloat(invoice.amount.replace('RM ', '')) 
          : invoice.invoiceAmount,
        currency: 'myr', // Malaysian Ringgit
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    console.log('Checkout session created:', data);
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Function to redirect to Stripe Checkout
export function redirectToCheckout(sessionId) {
  // Load Stripe.js dynamically
  const script = document.createElement('script');
  script.src = 'https://js.stripe.com/v3/';
  script.async = true;
  
  script.onload = () => {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error('Stripe publishable key is missing');
      throw new Error('Stripe publishable key is not configured. Please check your environment variables.');
    }
    
    const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
    
    // Redirect to Stripe Checkout
    stripe.redirectToCheckout({ sessionId }).then((result) => {
      if (result.error) {
        console.error('Error redirecting to checkout:', result.error);
      }
    });
  };
  
  document.head.appendChild(script);
}

// Function to verify session status with the backend
export async function verifyStripeSession(sessionId) {
  try {
    // Call our Supabase function to verify the session
    const response = await fetch('https://gpbtkggpbuarrvkpiqzq.supabase.co/functions/v1/verify-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
      },
      body: JSON.stringify({
        sessionId: sessionId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to verify session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying session:', error);
    throw error;
  }
}

// Function to process a successful payment on the client side
export async function processSuccessfulPayment(invoice) {
  try {
    // Create transaction record
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
    
    if (transactionError) throw transactionError;
    
    // Update invoice as paid
    const { error: updateError } = await supabase
      .from('Invoice')
      .update({ 
        isPaid: true,
        invoiceTransactionID: transaction[0].transactionID
      })
      .eq('invoiceID', invoice.invoiceID);
    
    if (updateError) throw updateError;
    
    return {
      success: true,
      transactionId: transaction[0].transactionID
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
} 