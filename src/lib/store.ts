// ===== Types =====
export type Role = 'super_admin' | 'admin' | 'professeur' | 'membre_administratif' | 'etudiant_concours' | 'etudiant_externe';
export type Filiere = 'LIC' | 'LAP';
export type Annee = 'L1' | 'L2' | 'L3';
export type OptionLIC = 'GL' | 'SR';

export interface User {
  id: string;
  email: string;
  password: string;
  nom_complet: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  filiere?: Filiere;
  annee?: Annee;
  option?: OptionLIC;
  specialite?: string;
  grade?: string;
  service?: string;
  payment_blocked?: boolean;
}

export interface ConcoursCode {
  id: string;
  code: string;
  nom_complet: string;
  filiere: Filiere;
  annee: Annee;
  option?: OptionLIC;
  used: boolean;
  used_by?: string;
  created_at: string;
}

export interface ValidationCode {
  id: string;
  code: string;
  used: boolean;
  used_by?: string;
  expires_at: string;
  created_at: string;
}

export interface PaymentCode {
  id: string;
  code: string;
  student_id: string;
  student_name: string;
  month: string;
  used: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  month: string;
  amount: number;
  paid: boolean;
  paid_at?: string;
  deadline: string;
}

// ===== Helpers =====
const generateId = () => crypto.randomUUID();
const generateCode = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// ===== localStorage CRUD =====
function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== Keys =====
const KEYS = {
  users: 'cfi_users',
  currentUser: 'cfi_current_user',
  concoursCodes: 'cfi_concours_codes',
  validationCodes: 'cfi_validation_codes',
  paymentCodes: 'cfi_payment_codes',
  payments: 'cfi_payments',
  initialized: 'cfi_initialized',
};

// ===== Seed =====
export function initializeStore() {
  if (getItem(KEYS.initialized, false)) return;

  const superAdmin: User = {
    id: generateId(),
    email: 'admin@cfi-ciras.org',
    password: 'Lord@123@admin',
    nom_complet: 'Super Administrateur',
    role: 'super_admin',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const adminUser: User = {
    id: generateId(),
    email: 'directeur@cfi-ciras.org',
    password: 'Dir@2024',
    nom_complet: 'Dr. Michel Fouda',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const prof1: User = {
    id: generateId(),
    email: 'owona@cfi-ciras.org',
    password: 'Prof@2024',
    nom_complet: 'Dr. Owona',
    role: 'professeur',
    is_active: true,
    created_at: new Date().toISOString(),
    specialite: 'Informatique',
    grade: 'Maître de Conférences',
  };

  const prof2: User = {
    id: generateId(),
    email: 'mbarga@cfi-ciras.org',
    password: 'Prof@2024',
    nom_complet: 'Prof. Mbarga',
    role: 'professeur',
    is_active: true,
    created_at: new Date().toISOString(),
    specialite: 'Algorithmique',
    grade: 'Professeur Titulaire',
  };

  const staff1: User = {
    id: generateId(),
    email: 'secretariat@cfi-ciras.org',
    password: 'Staff@2024',
    nom_complet: 'Mme. Ngo Bassa',
    role: 'membre_administratif',
    is_active: true,
    created_at: new Date().toISOString(),
    service: 'Scolarité',
  };

  const etudiantConcours1: User = {
    id: generateId(),
    email: 'jean.kamga@etud.cfi-ciras.org',
    password: 'Etud@2024',
    nom_complet: 'Jean Kamga',
    role: 'etudiant_concours',
    is_active: true,
    created_at: new Date().toISOString(),
    filiere: 'LIC',
    annee: 'L1',
  };

  const etudiantConcours2: User = {
    id: generateId(),
    email: 'paul.essomba@etud.cfi-ciras.org',
    password: 'Etud@2024',
    nom_complet: 'Paul Essomba',
    role: 'etudiant_concours',
    is_active: true,
    created_at: new Date().toISOString(),
    filiere: 'LIC',
    annee: 'L3',
    option: 'GL',
  };

  const etudiantExterne1: User = {
    id: generateId(),
    email: 'sophie.ateba@gmail.com',
    password: 'Etud@2024',
    nom_complet: 'Sophie Ateba',
    role: 'etudiant_externe',
    is_active: true,
    created_at: new Date().toISOString(),
    filiere: 'LAP',
    annee: 'L2',
  };

  const etudiantExterne2: User = {
    id: generateId(),
    email: 'boris.ndongo@gmail.com',
    password: 'Etud@2024',
    nom_complet: 'Boris Ndongo',
    role: 'etudiant_externe',
    is_active: false,
    created_at: new Date().toISOString(),
    filiere: 'LIC',
    annee: 'L2',
  };

  const sampleConcoursCodes: ConcoursCode[] = [
    { id: generateId(), code: 'CONC-ABC123', nom_complet: 'Jean Kamga', filiere: 'LIC', annee: 'L1', used: true, used_by: etudiantConcours1.id, created_at: new Date().toISOString() },
    { id: generateId(), code: 'CONC-DEF456', nom_complet: 'Marie Nkoulou', filiere: 'LAP', annee: 'L1', used: false, created_at: new Date().toISOString() },
    { id: generateId(), code: 'CONC-GHI789', nom_complet: 'Paul Essomba', filiere: 'LIC', annee: 'L3', option: 'GL', used: true, used_by: etudiantConcours2.id, created_at: new Date().toISOString() },
  ];

  const sampleValidationCodes: ValidationCode[] = [
    { id: generateId(), code: 'EXT-XYZ001', used: true, used_by: etudiantExterne1.id, expires_at: new Date(Date.now() + 30 * 86400000).toISOString(), created_at: new Date().toISOString() },
    { id: generateId(), code: 'EXT-XYZ002', used: false, expires_at: new Date(Date.now() + 30 * 86400000).toISOString(), created_at: new Date().toISOString() },
  ];

  setItem(KEYS.users, [superAdmin, adminUser, prof1, prof2, staff1, etudiantConcours1, etudiantConcours2, etudiantExterne1, etudiantExterne2]);
  setItem(KEYS.concoursCodes, sampleConcoursCodes);
  setItem(KEYS.validationCodes, sampleValidationCodes);
  setItem(KEYS.paymentCodes, []);
  setItem(KEYS.payments, []);
  setItem(KEYS.initialized, true);
}

// ===== User CRUD =====
export function getUsers(): User[] { return getItem<User[]>(KEYS.users, []); }
export function setUsers(users: User[]) { setItem(KEYS.users, users); }
export function getUserById(id: string) { return getUsers().find(u => u.id === id); }
export function getUserByEmail(email: string) { return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()); }

export function createUser(data: Omit<User, 'id' | 'created_at'>): User {
  const user: User = { ...data, id: generateId(), created_at: new Date().toISOString() };
  setUsers([...getUsers(), user]);
  return user;
}

export function updateUser(id: string, data: Partial<User>) {
  setUsers(getUsers().map(u => u.id === id ? { ...u, ...data } : u));
}

export function deleteUser(id: string) {
  setUsers(getUsers().filter(u => u.id !== id));
}

// ===== Auth =====
export function getCurrentUser(): User | null { return getItem<User | null>(KEYS.currentUser, null); }
export function setCurrentUser(user: User | null) { setItem(KEYS.currentUser, user); }

export function login(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const user = getUserByEmail(email);
  if (!user) return { success: false, error: 'Email ou mot de passe incorrect.' };
  if (user.password !== password) return { success: false, error: 'Email ou mot de passe incorrect.' };
  if (!user.is_active) return { success: false, error: 'Votre compte n\'est pas encore activé. Contactez l\'administration.' };
  if (user.payment_blocked) {
    setCurrentUser(user);
    return { success: false, user, error: 'PAYMENT_BLOCKED' };
  }
  // Refresh user data from store
  const freshUser = getUserById(user.id);
  setCurrentUser(freshUser || user);
  return { success: true, user: freshUser || user };
}

export function logout() { setCurrentUser(null); }

// ===== Concours Codes =====
export function getConcoursCodes(): ConcoursCode[] { return getItem<ConcoursCode[]>(KEYS.concoursCodes, []); }
export function setConcoursCodes(codes: ConcoursCode[]) { setItem(KEYS.concoursCodes, codes); }

export function createConcoursCode(data: { nom_complet: string; filiere: Filiere; annee: Annee; option?: OptionLIC }): ConcoursCode {
  const code: ConcoursCode = {
    id: generateId(),
    code: generateCode('CONC'),
    ...data,
    used: false,
    created_at: new Date().toISOString(),
  };
  setConcoursCodes([...getConcoursCodes(), code]);
  return code;
}

export function validateConcoursCode(code: string): { valid: boolean; data?: ConcoursCode; error?: string } {
  const codes = getConcoursCodes();
  const found = codes.find(c => c.code === code);
  if (!found) return { valid: false, error: 'Code concours invalide.' };
  if (found.used) return { valid: false, error: 'Ce code a déjà été utilisé.' };
  return { valid: true, data: found };
}

export function markConcoursCodeUsed(codeId: string, userId: string) {
  setConcoursCodes(getConcoursCodes().map(c => c.id === codeId ? { ...c, used: true, used_by: userId } : c));
}

// ===== Validation Codes =====
export function getValidationCodes(): ValidationCode[] { return getItem<ValidationCode[]>(KEYS.validationCodes, []); }
export function setValidationCodes(codes: ValidationCode[]) { setItem(KEYS.validationCodes, codes); }

export function createValidationCode(expiresInDays = 30): ValidationCode {
  const code: ValidationCode = {
    id: generateId(),
    code: generateCode('EXT'),
    used: false,
    expires_at: new Date(Date.now() + expiresInDays * 86400000).toISOString(),
    created_at: new Date().toISOString(),
  };
  setValidationCodes([...getValidationCodes(), code]);
  return code;
}

export function validateExternalCode(code: string): { valid: boolean; data?: ValidationCode; error?: string } {
  const codes = getValidationCodes();
  const found = codes.find(c => c.code === code);
  if (!found) return { valid: false, error: 'Code de validation invalide.' };
  if (found.used) return { valid: false, error: 'Ce code a déjà été utilisé.' };
  if (new Date(found.expires_at) < new Date()) return { valid: false, error: 'Ce code a expiré.' };
  return { valid: true, data: found };
}

export function markValidationCodeUsed(codeId: string, userId: string) {
  setValidationCodes(getValidationCodes().map(c => c.id === codeId ? { ...c, used: true, used_by: userId } : c));
}

// ===== Payment Codes =====
export function getPaymentCodes(): PaymentCode[] { return getItem<PaymentCode[]>(KEYS.paymentCodes, []); }
export function setPaymentCodes(codes: PaymentCode[]) { setItem(KEYS.paymentCodes, codes); }

export function createPaymentCode(studentId: string, studentName: string, month: string): PaymentCode {
  const code: PaymentCode = {
    id: generateId(),
    code: generateCode('PAY'),
    student_id: studentId,
    student_name: studentName,
    month,
    used: false,
    created_at: new Date().toISOString(),
  };
  setPaymentCodes([...getPaymentCodes(), code]);
  return code;
}

export function validatePaymentCode(code: string, studentId: string): { valid: boolean; error?: string } {
  const found = getPaymentCodes().find(c => c.code === code && c.student_id === studentId && !c.used);
  if (!found) return { valid: false, error: 'Code de paiement invalide.' };
  // Mark used and unblock
  setPaymentCodes(getPaymentCodes().map(c => c.id === found.id ? { ...c, used: true } : c));
  updateUser(studentId, { payment_blocked: false });
  return { valid: true };
}

// ===== Payments =====
export function getPayments(): Payment[] { return getItem<Payment[]>(KEYS.payments, []); }
export function setPayments(payments: Payment[]) { setItem(KEYS.payments, payments); }

// ===== Role helpers =====
export function isAdmin(role: Role) { return role === 'super_admin' || role === 'admin'; }
export function isStudent(role: Role) { return role === 'etudiant_concours' || role === 'etudiant_externe'; }
export function isProfessor(role: Role) { return role === 'professeur'; }
export function isStaff(role: Role) { return role === 'membre_administratif'; }

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Directeur',
  professeur: 'Professeur',
  membre_administratif: 'Membre Administratif',
  etudiant_concours: 'Étudiant (Concours)',
  etudiant_externe: 'Étudiant (Externe)',
};

export const FILIERE_LABELS: Record<Filiere, string> = {
  LIC: 'Licence Informatique',
  LAP: 'Licence Administrative',
};

/*
 * Mapping semestre ↔ niveau d'études
 * L1 = S1, S2 | L2 = S3, S4 | L3 = S5, S6
 */
export const ANNEE_TO_SEMESTERS: Record<Annee, ['S1','S2'] | ['S3','S4'] | ['S5','S6']> = {
  L1: ['S1', 'S2'],
  L2: ['S3', 'S4'],
  L3: ['S5', 'S6'],
};
