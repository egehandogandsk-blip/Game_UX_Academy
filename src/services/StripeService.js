import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with the publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const StripeService = {
    /**
     * Get the Stripe instance promise
     */
    getStripe: () => stripePromise,

    /**
     * Create a real payment intent (Usually requires a backend)
     * For now, we simulate the backend call but use real Stripe validation
     */
    confirmPayment: async (stripe, elements, billingDetails) => {
        if (!stripe || !elements) {
            return { error: { message: 'Stripe not initialized' } };
        }

        const cardElement = elements.getElement('card');

        // In a real app, you would fetch a clientSecret from your backend here
        // const { clientSecret } = await fetch('/api/create-payment-intent', { ... }).then(r => r.json());

        // Since we don't have a backend, we simulate the success if validation passes
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: `${billingDetails.firstName} ${billingDetails.lastName}`,
                address: {
                    line1: billingDetails.address,
                    city: billingDetails.city,
                    postal_code: billingDetails.zip,
                },
            },
        });

        if (error) {
            return { error };
        }

        // Simulate confirmed payment
        return { paymentMethod, success: true };
    },
};
