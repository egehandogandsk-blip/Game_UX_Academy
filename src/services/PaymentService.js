/**
 * Payment Service for GDA Tool
 * Handles credit card validation, formatting, and payment simulation.
 */

export const PaymentService = {
    // 1. Detect Card Type (Visa, Mastercard, Troy, Amex)
    getCardType: (number) => {
        const re = {
            troy: /^9792/,
            visa: /^4/,
            mastercard: /^5[1-5]/,
            amex: /^3[47]/,
            discover: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/
        };

        if (re.troy.test(number)) return 'Troy';
        if (re.visa.test(number)) return 'Visa';
        if (re.mastercard.test(number)) return 'Mastercard';
        if (re.amex.test(number)) return 'Amex';
        if (re.discover.test(number)) return 'Discover';

        return 'Unknown';
    },

    // 2. Format Card Number (0000 0000 0000 0000)
    formatCardNumber: (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    },

    // 3. Format Expiry Date (MM/YY)
    formatExpiry: (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    },

    // 4. Luhn Algorithm for Validity Check
    isValidLuhn: (number) => {
        const sanitized = number.replace(/[\s-]/g, '');
        if (!/^[0-9]{13,19}$/.test(sanitized)) return false;

        let sum = 0;
        let shouldDouble = false;

        for (let i = sanitized.length - 1; i >= 0; i--) {
            let digit = parseInt(sanitized.charAt(i));

            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return (sum % 10) === 0;
    },

    // 5. Simulate Payment Process
    processPayment: async (paymentData) => {
        return new Promise((resolve, reject) => {
            console.log("Processing Payment...", paymentData);

            setTimeout(() => {
                // Simulate success rate (90%)
                const isSuccess = Math.random() > 0.1;

                if (isSuccess) {
                    resolve({
                        status: 'success',
                        transactionId: 'TRX-' + Math.floor(Math.random() * 1000000),
                        date: new Date().toISOString()
                    });
                } else {
                    reject({
                        status: 'failure',
                        message: 'Bank declined transaction (Insufficient Funds or Fraud Risk)'
                    });
                }
            }, 2500); // 2.5s delay for realism
        });
    }
};
