// Types pour la gestion avancée des fibres optiques

export interface GPS_Coordinates {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface FiberSection {
  id: string;
  name: string;
  startPoint: GPS_Coordinates & { name: string };
  endPoint: GPS_Coordinates & { name: string };
  length: number; // en mètres
  capacity: 4 | 6 | 8 | 12 | 24 | 48 | 72 | 96 | 144 | 288 | 576;
  installationType: 'underground' | 'aerial' | 'conduit';
  installationDate: Date;
  status: 'projected' | 'existing' | 'maintenance' | 'offline';
  fibers: Fiber[];
  splices: Splice[];
  createdAt: Date;
  updatedAt: Date;
  path?: Array<{ lat: number; lng: number }>;
  networkType?: string;
  color?: string;
}

export interface Fiber {
  id: number; // 1-12 puis répétition
  color: string;
  colorHex: string;
  colorEnglish: string;
  tubeNumber?: number;
  assignedService: ServiceType;
  status: 'active' | 'reserved' | 'fault' | 'test' | 'free';
  notes: string;
  isProjected: boolean;
}

export type ServiceType = 
  | 'free'
  | 'internet_residential' 
  | 'internet_enterprise'
  | 'telephony'
  | 'backbone'
  | 'dedicated_client'
  | 'maintenance'
  | 'reserved';

export interface Splice {
  id: string;
  location: GPS_Coordinates & { name: string };
  type: 'aerial' | 'underground' | 'cabinet';
  inputSection: string;
  outputSection: string;
  fiberMapping: FiberMapping[];
  installDate: Date;
  technician: string;
  testResults: TestResult[];
  materialReference: string;
  photos: string[];
  notes: string;
}

export interface FiberMapping {
  inputFiber: number;
  outputFiber: number;
  insertionLoss: number; // en dB
  testDate: Date;
  continuityStatus: 'ok' | 'fault' | 'untested';
  otdrMeasurement?: number;
}

export interface TestResult {
  id: string;
  fiberNumber: number;
  testDate: Date;
  testType: 'continuity' | 'otdr' | 'power' | 'certification';
  result: 'pass' | 'fail' | 'warning';
  measurement: number;
  unit: 'dB' | 'dBm' | 'nm';
  technician: string;
  notes: string;
}

// Code couleur asiatique (Norme IEC 60304)
export const asianFiberColors = [
  { id: 1, color: "Bleu", hex: "#0000FF", english: "Blue" },
  { id: 2, color: "Orange", hex: "#FFA500", english: "Orange" },
  { id: 3, color: "Vert", hex: "#008000", english: "Green" },
  { id: 4, color: "Marron", hex: "#8B4513", english: "Brown" },
  { id: 5, color: "Gris", hex: "#808080", english: "Slate/Gray" },
  { id: 6, color: "Blanc", hex: "#FFFFFF", english: "White" },
  { id: 7, color: "Rouge", hex: "#FF0000", english: "Red" },
  { id: 8, color: "Noir", hex: "#000000", english: "Black" },
  { id: 9, color: "Jaune", hex: "#FFFF00", english: "Yellow" },
  { id: 10, color: "Violet", hex: "#8A2BE2", english: "Violet" },
  { id: 11, color: "Rose", hex: "#FFC0CB", english: "Rose/Pink" },
  { id: 12, color: "Aqua", hex: "#00FFFF", english: "Aqua" }
];

export const serviceTypeConfig = {
  free: { label: 'Libre', color: '#6B7280', bgColor: '#F3F4F6' },
  internet_residential: { label: 'Internet Résidentiel', color: '#3B82F6', bgColor: '#DBEAFE' },
  internet_enterprise: { label: 'Internet Entreprise', color: '#1E40AF', bgColor: '#BFDBFE' },
  telephony: { label: 'Téléphonie', color: '#10B981', bgColor: '#D1FAE5' },
  backbone: { label: 'Backbone/Transit', color: '#DC2626', bgColor: '#FEE2E2' },
  dedicated_client: { label: 'Client Dédié', color: '#7C3AED', bgColor: '#EDE9FE' },
  maintenance: { label: 'Maintenance/Test', color: '#F59E0B', bgColor: '#FEF3C7' },
  reserved: { label: 'Réservé', color: '#EAB308', bgColor: '#FEF08A' }
};

export interface OpticalBudget {
  totalLoss: number;
  maxAllowedLoss: number;
  margin: number;
  status: 'ok' | 'warning' | 'critical';
  recommendations: string[];
}

export interface AIAnalysis {
  anomalies: Array<{
    fiberNumber: number;
    type: 'loss_increase' | 'power_drop' | 'reflection';
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
  predictedFailures: Array<{
    fiberNumber: number;
    probability: number;
    timeframe: string;
    reason: string;
  }>;
  optimizationSuggestions: string[];
}

export const CHAMBER_TYPES = ['L1T', 'L2T', 'L3T', 'L4T', 'L5T', 'custom'] as const;

// Configuration des couleurs par type de réseau
export const NETWORK_COLORS = {
  backbone_international: '#DC2626', // Rouge
  backbone_national: '#DC2626',
  metropolitan: '#F97316', // Orange
  ftth_gpon: '#10B981', // Vert
  p2p_dedicated: '#10B981',
  adsl_copper: '#3B82F6', // Bleu
  radio_satellite: '#8B5CF6', // Violet
  critical_equipment: '#FBBF24', // Jaune
} as const;