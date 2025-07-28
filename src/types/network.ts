export interface NetworkElement {
  id: string;
  type: 'cable' | 'junction_box' | 'dslam' | 'distribution_point' | 'client_equipment' | 'pole' | 'conduit' | 'chamber' | 
        'repeater' | 'wdm_multiplexer' | 'otn_equipment' | 'pop' | 'cti' | 'ixp' | 'datacenter' | 'adm' | 'router' | 
        'switch' | 'mpls_equipment' | 'bts' | 'antenna' | 'bbu' | 'microwave' | 'satellite' | 'cpe' | 'splitter' | 
        'fat' | 'mdu' | 'atb' | 'rg' | 'sr' | 'pc' | 'dslam_street' | 'modem' | 'filter' | 'amplifier' | 'odf' | 
        'otdr' | 'ups' | 'generator' | 'hvac' | 'access_control' | 'fire_detection';
  name: string;
  location: {
    lat: number;
    lng: number;
    altitude?: number;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'fault' | 'planned';
  properties: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  region: string;
  department: string;
  commune: string;
  networkLayer: 'backbone' | 'metropolitan' | 'access' | 'client';
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface FiberCable extends NetworkElement {
  type: 'cable';
  properties: {
    length: number; // en mètres
    fiberCount: 2 | 6 | 12 | 24 | 48 | 96 | 144 | 288 | 576;
    cableType: 'single_mode' | 'multi_mode';
    installation: 'aerial' | 'underground' | 'submarine';
    capacity: number; // pourcentage d'utilisation
    manufacturer: string;
    installationDate: string;
    specifications: string;
    networkType: 'backbone_international' | 'backbone_national' | 'metropolitan' | 'ftth_gpon' | 'p2p_dedicated' | 'adsl_copper';
  };
  path: Array<{ lat: number; lng: number }>;
  color: string; // Couleur selon le type de réseau
}

export interface Equipment extends NetworkElement {
  type: 'dslam' | 'junction_box' | 'distribution_point' | 'client_equipment' | 'repeater' | 'wdm_multiplexer' | 
        'otn_equipment' | 'pop' | 'cti' | 'ixp' | 'datacenter' | 'adm' | 'router' | 'switch' | 'mpls_equipment' | 
        'bts' | 'antenna' | 'bbu' | 'cpe' | 'splitter' | 'fat' | 'mdu' | 'atb' | 'rg' | 'sr' | 'pc' | 'dslam_street';
  properties: {
    model: string;
    manufacturer: string;
    serialNumber: string;
    installationDate: string;
    capacity: number;
    currentLoad: number;
    firmware?: string;
    ports?: number;
    specifications: Record<string, any>;
    powerConsumption?: number;
    operatingTemp?: string;
  };
}

export interface Infrastructure extends NetworkElement {
  type: 'pole' | 'conduit' | 'chamber';
  properties: {
    material: 'wood' | 'metal' | 'concrete' | 'plastic' | 'fiber';
    poleType?: 'wood' | 'metal' | 'concrete'; // Pour les poteaux spécifiquement
    chamberType?: 'L1T' | 'L2T' | 'L3T' | 'L4T' | 'L5T' | 'custom'; // Pour les chambres
    dimensions: {
      height?: number;
      diameter?: number;
      length?: number;
      width?: number;
      depth?: number;
    };
    loadCapacity?: number;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    installationDate: string;
    maintenanceHistory: Array<{
      date: string;
      type: string;
      description: string;
      technician: string;
    }>;
  };
}

export interface ClientConnection {
  id: string;
  clientId: string;
  networkElementId: string;
  connectionType: 'fiber' | 'copper' | 'radio' | 'satellite';
  bandwidth: number;
  installationDate: string;
  status: 'active' | 'suspended' | 'pending' | 'disconnected';
  serviceLevel: 'residential' | 'business' | 'enterprise' | 'government';
  coordinates: { lat: number; lng: number };
}

export interface NetworkProject {
  id: string;
  name: string;
  description: string;
  type: 'extension' | 'maintenance' | 'upgrade' | 'new_installation';
  status: 'planning' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  budget: number;
  estimatedCost: number;
  actualCost?: number;
  startDate: string;
  endDate: string;
  completionDate?: string;
  progress: number;
  coverage: {
    region: string;
    departments: string[];
    communes: string[];
    estimatedClients: number;
    area: number; // en km²
    coordinates: Array<{ lat: number; lng: number }>;
  };
  team: {
    manager: string;
    technicians: string[];
    contractors?: string[];
  };
  feasibilityStudy?: {
    technicalFeasibility: number;
    financialViability: number;
    riskAssessment: string;
    recommendations: string[];
  };
  plannedElements: NetworkElement[]; // Éléments prévus dans le projet
  existingElements: NetworkElement[]; // Éléments existants à modifier
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  type: 'preventive' | 'corrective' | 'emergency';
  assignedTo?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    region: string;
    department: string;
    commune: string;
  };
  affectedElements: string[];
  affectedClients: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  estimatedResolutionTime?: number;
  actualResolutionTime?: number;
  workLog: Array<{
    timestamp: Date;
    technician: string;
    action: string;
    notes: string;
    photos?: string[];
  }>;
}

export interface ARTReport {
  id: string;
  period: {
    start: string;
    end: string;
    quarter: number;
    year: number;
  };
  metrics: {
    networkAvailability: number;
    averageLatency: number;
    throughput: number;
    clientSatisfaction: number;
    incidentCount: number;
    resolutionTime: number;
  };
  regionalData: Array<{
    region: string;
    coverage: number;
    clients: number;
    revenue: number;
    incidents: number;
  }>;
  complianceScore: number;
  recommendations: string[];
  generatedAt: Date;
  submittedAt?: Date;
  status: 'draft' | 'submitted' | 'approved';
}

export interface CameroonRegion {
  name: string;
  nameFr: string;
  nameEn: string;
  code: string;
  departments: CameroonDepartment[];
  coordinates: {
    lat: number;
    lng: number;
  };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface CameroonDepartment {
  name: string;
  nameFr: string;
  nameEn: string;
  code: string;
  region: string;
  communes: CameroonCommune[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface CameroonCommune {
  name: string;
  nameFr: string;
  nameEn: string;
  code: string;
  department: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  population?: number;
  area?: number;
}

// Types pour l'import de fichiers
export interface ImportedNetworkData {
  elements: Array<{
    name: string;
    type: string;
    lat: number;
    lng: number;
    region?: string;
    department?: string;
    commune?: string;
    properties?: Record<string, any>;
  }>;
  metadata: {
    fileName: string;
    importDate: Date;
    totalElements: number;
    validElements: number;
    errors: string[];
  };
}

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

// Configuration des icônes par type d'équipement
export const EQUIPMENT_ICONS = {
  // Backbone
  repeater: '🔄',
  wdm_multiplexer: '📡',
  otn_equipment: '🔧',
  pop: '🏢',
  cti: '🌐',
  ixp: '🔗',
  datacenter: '🏭',
  
  // Métropolitain
  adm: '⚙️',
  router: '📶',
  switch: '🔀',
  mpls_equipment: '🛠️',
  
  // Accès
  bts: '📡',
  antenna: '📶',
  bbu: '📦',
  dslam: '🔌',
  splitter: '🔀',
  fat: '📍',
  mdu: '🏠',
  
  // Infrastructure
  pole: '│',
  chamber: '⬜',
  conduit: '━',
  cable: '━',
  
  // Client
  cpe: '📟',
  atb: '🔌',
  modem: '📡',
} as const;

// Types de fibres disponibles
export const FIBER_TYPES = [2, 6, 12, 24, 48, 96, 144, 288, 576] as const;

// Types de poteaux
export const POLE_TYPES = ['wood', 'metal', 'concrete'] as const;

// Types de chambres
export const CHAMBER_TYPES = ['L1T', 'L2T', 'L3T', 'L4T', 'L5T', 'custom'] as const;