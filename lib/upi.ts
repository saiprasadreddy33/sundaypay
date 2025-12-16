export interface UPIPaymentOptions {
  upiId: string;
  name: string;
  amount: number;
  transactionNote?: string;
}

export function generateUPILink(options: UPIPaymentOptions): string {
  const { upiId, name, amount, transactionNote = 'Cricket Match Payment' } = options;
  
  const params = new URLSearchParams({
    pa: upiId, // Payee address
    pn: name, // Payee name
    am: amount.toString(), // Amount
    cu: 'INR', // Currency
    tn: transactionNote, // Transaction note
  });
  
  return `upi://pay?${params.toString()}`;
}

export function isValidUPIId(upiId: string): boolean {
  // UPI ID format: something@provider (e.g., user@paytm, 9876543210@ybl)
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
  return upiRegex.test(upiId);
}
