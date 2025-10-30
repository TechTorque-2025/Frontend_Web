// services/payhereService.ts - PayHere Integration for TechTorque

interface PayHerePayment {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface PaymentData {
  orderId: string;
  amount: number;
  currency: string;
  itemDescription: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  hash: string;
  merchantId: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  sandbox: boolean;
}

interface PayHereSDK {
  startPayment: (payment: PayHerePayment) => void;
  onCompleted: (paymentId: string) => void;
  onDismissed: () => void;
  onError: (error: string) => void;
}

interface PaymentResult {
  paymentId: string;
  orderId: string;
  transactionId: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  paidAt: string;
}

declare global {
  interface Window {
    payhere: PayHereSDK;
  }
}

class PayHereService {
  // Load PayHere JS SDK
  loadPayHereScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.payhere) {
        console.log('PayHere already loaded');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.payhere.lk/lib/payhere.js';

      script.onload = () => {
        console.log('PayHere JS SDK loaded');
        resolve();
      };

      script.onerror = () => {
        console.error('Failed to load PayHere SDK');
        reject(new Error('Failed to load PayHere SDK'));
      };

      document.head.appendChild(script);
    });
  }

  // Start payment with PayHere
  async startPayment(
    paymentData: PaymentData,
    onSuccess: (paymentResult: PaymentResult) => void,
    onError: (error: string) => void,
    onCancel: () => void
  ) {
    try {
      // Load PayHere SDK
      await this.loadPayHereScript();

      const payment: PayHerePayment = {
        sandbox: paymentData.sandbox,
        merchant_id: paymentData.merchantId,
        return_url: paymentData.returnUrl,
        cancel_url: paymentData.cancelUrl,
        notify_url: paymentData.notifyUrl,
        order_id: paymentData.orderId,
        items: paymentData.itemDescription,
        amount: paymentData.amount.toFixed(2),
        currency: paymentData.currency,
        hash: paymentData.hash,
        first_name: paymentData.customerFirstName,
        last_name: paymentData.customerLastName,
        email: paymentData.customerEmail,
        phone: paymentData.customerPhone,
        address: paymentData.customerAddress,
        city: paymentData.customerCity,
        country: 'Sri Lanka'
      };

      console.log('Starting PayHere payment:', {
        sandbox: payment.sandbox,
        orderId: payment.order_id,
        amount: payment.amount,
        merchantId: payment.merchant_id
      });

      // Setup callbacks
      window.payhere.onCompleted = function (paymentId: string) {
        console.log('Payment completed:', paymentId);
        onSuccess({
          paymentId,
          orderId: payment.order_id,
          transactionId: paymentId,
          method: 'payhere',
          status: 'completed',
          amount: parseFloat(payment.amount),
          currency: payment.currency,
          paidAt: new Date().toISOString()
        });
      };

      window.payhere.onDismissed = function () {
        console.log('Payment cancelled');
        onCancel();
      };

      window.payhere.onError = function (error: string) {
        console.error('Payment error:', error);
        onError(`PayHere Error: ${error}`);
      };

      // Start payment
      window.payhere.startPayment(payment);

    } catch (error) {
      console.error('PayHere error:', error);
      onError(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

const payHereService = new PayHereService();
export default payHereService;
