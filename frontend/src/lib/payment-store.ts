export type PaymentMethod = 'cash' | 'mobile_money' | 'card';

export interface PaymentRecord {
  id: string;
  student_id: string;
  month: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'confirmed' | 'rejected';
  reference?: string;
  created_at: string;
  confirmed_at?: string;
}

const KEY = 'cfi_payment_records';

function getAll(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAll(records: PaymentRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function getPaymentRecords(): PaymentRecord[] {
  return getAll();
}

export function getStudentPayments(studentId: string): PaymentRecord[] {
  return getAll().filter(r => r.student_id === studentId);
}

export function createPaymentRecord(data: {
  student_id: string;
  month: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}): PaymentRecord {
  const record: PaymentRecord = {
    ...data,
    id: crypto.randomUUID(),
    status: data.method === 'cash' ? 'pending' : 'pending',
    created_at: new Date().toISOString(),
  };
  saveAll([...getAll(), record]);
  return record;
}

export function confirmPayment(id: string) {
  saveAll(getAll().map(r => r.id === id ? { ...r, status: 'confirmed' as const, confirmed_at: new Date().toISOString() } : r));
}

export function rejectPayment(id: string) {
  saveAll(getAll().map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
}

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Espèces (Caisse)',
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
};

export const MONTHLY_FEE = 25000; // FCFA
