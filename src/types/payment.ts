// Payment & Billing TypeScript Interfaces

// ===== PAYMENT TYPES =====
export interface PaymentRequestDto {
  invoiceId: string;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE';
  paymentReference?: string;
  notes?: string;
}

export interface PaymentResponseDto {
  paymentId: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentReference?: string;
  transactionId?: string;
  notes?: string;
  processedAt?: string;
  createdAt: string;
}

// PayHere Integration Types
export interface PaymentInitiationDto {
  invoiceId: string;
  amount: number;
  currency: string;
  itemDescription: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
}

export interface PaymentInitiationResponseDto {
  merchantId: string;
  orderId: string;
  amount: number;
  currency: string;
  hash: string;
  itemDescription: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  sandbox: boolean;
}

// Scheduled Payment Types
export interface SchedulePaymentDto {
  invoiceId: string;
  scheduledDate: string; // YYYY-MM-DD
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface ScheduledPaymentResponseDto {
  scheduleId: string;
  invoiceId: string;
  customerId: string;
  scheduledDate: string;
  amount: number;
  paymentMethod: string;
  status: 'SCHEDULED' | 'PROCESSED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

// ===== INVOICE TYPES =====
export interface InvoiceItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  itemType?: string; // LABOR, PARTS, SERVICE_FEE, etc.
}

export interface CreateInvoiceDto {
  customerId: string;
  serviceOrProjectId: string; // Backend expects this field name
  items: InvoiceItemDto[];
  notes?: string;
  dueDate?: string;
  requiresDeposit?: boolean; // Enable 50-50 part-payment
}

export interface InvoiceResponseDto {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  serviceId?: string;
  projectId?: string;
  items: InvoiceItemDto[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIALLY_PAID';
  notes?: string;
  dueDate?: string;
  issuedAt: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  // Part-payment fields
  requiresDeposit?: boolean;
  depositAmount?: number;
  depositPaid?: number;
  depositPaidAt?: string;
  finalAmount?: number;
  finalPaid?: number;
  finalPaidAt?: string;
}

export interface SendInvoiceDto {
  recipientEmail: string;
  ccEmails?: string[];
  message?: string;
}
