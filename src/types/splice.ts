// Types pour la gestion des manchons optiques

export interface GPS_Coordinates {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface OpticalSplice {
  id: string;
  name: string;
  location: GPS_Coordinates & { name: string };
  type: 'aerial' | 'underground' | 'cabinet' | 'manhole';
  networkType: 'backbone_international' | 'backbone_national' | 'metropolitan' | 'ftth_gpon' | 'p2p_dedicated' | 'adsl_copper';
  status: 'active' | 'maintenance' | 'fault' | 'planned';
  installDate: Date;
  technician: string;
  inputCable: CableConnection;
  outputCable: CableConnection;
  fiberMapping: FiberSpliceMapping[];
  testResults: SpliceTestResult[];
  materialReference: string;
  photos: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  region: string;
  department: string;
  commune: string;
}

export interface CableConnection {
  cableId: string;
  cableName: string;
  capacity: 4 | 6 | 8 | 12 | 24 | 48 | 72 | 96 | 144 | 288 | 576;
  cableType: 'single_mode' | 'multi_mode';
  networkType: string;
  color: string;
  fibers: SpliceFiber[];
}

export interface SpliceFiber {
  id: number; // 1-12 puis répétition
  color: string;
  colorHex: string;
  colorEnglish: string;
  tubeNumber?: number;
  status: 'spliced' | 'free' | 'reserved' | 'fault';
  connectedTo?: number; // ID de la fibre connectée côté sortie
  insertionLoss?: number; // en dB
  notes: string;
}

export interface FiberSpliceMapping {
  inputFiber: number;
  outputFiber: number;
  insertionLoss: number; // en dB
  testDate: Date;
  continuityStatus: 'ok' | 'fault' | 'untested';
  otdrMeasurement?: number;
  technician: string;
}

export interface SpliceTestResult {
  id: string;
  inputFiber: number;
  outputFiber: number;
  testDate: Date;
  testType: 'continuity' | 'otdr' | 'power' | 'insertion_loss';
  result: 'pass' | 'fail' | 'warning';
  measurement: number;
  unit: 'dB' | 'dBm' | 'nm';
  technician: string;
  notes: string;
}

// Code couleur asiatique (Norme IEC 60304) - Réutilisé depuis fiber.ts
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

export const networkTypeConfig = {
  backbone_international: { label: 'Backbone International', color: '#DC2626', priority: 1 },
  backbone_national: { label: 'Backbone National', color: '#DC2626', priority: 2 },
  metropolitan: { label: 'Métropolitain', color: '#F97316', priority: 3 },
  ftth_gpon: { label: 'FTTH/GPON', color: '#10B981', priority: 4 },
  p2p_dedicated: { label: 'P2P Dédié', color: '#10B981', priority: 5 },
  adsl_copper: { label: 'ADSL/Cuivre', color: '#3B82F6', priority: 6 }
};

export const spliceTypeConfig = {
  aerial: { label: 'Aérien', color: '#10B981', icon: '🌤️' },
  underground: { label: 'Souterrain', color: '#8B4513', icon: '🕳️' },
  cabinet: { label: 'Armoire', color: '#6B7280', icon: '🗄️' },
  manhole: { label: 'Regard', color: '#374151', icon: '🕳️' }
};

export interface OpticalBudget {
  totalLoss: number;
  maxAllowedLoss: number;
  margin: number;
  status: 'ok' | 'warning' | 'critical';
  recommendations: string[];
}

export interface SpliceAnalysis {
  averageInsertionLoss: number;
  maxInsertionLoss: number;
  faultyConnections: number;
  utilizationRate: number;
  recommendations: string[];
}

// Configuration des couleurs par type de réseau
export const NETWORK_COLORS = {
  backbone_international: '#DC2626', // Rouge
  backbone_national: '#DC2626',
  metropolitan: '#F97316', // Orange
  ftth_gpon: '#10B981', // Vert
  p2p_dedicated: '#10B981',
  adsl_copper: '#3B82F6', // Bleu
} as const;

// Types de manchons disponibles
export const SPLICE_TYPES = ['aerial', 'underground', 'cabinet', 'manhole'] as const;

// Capacités de câbles supportées
export const CABLE_CAPACITIES = [4, 6, 8, 12, 24, 48, 72, 96, 144, 288, 576] as const;