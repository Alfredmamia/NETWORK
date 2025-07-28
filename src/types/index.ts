export interface NetworkElement {
  id: string;
  type: 'cable' | 'junction_box' | 'dslam' | 'client_point' | 'pole' | 'conduit';
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'fault';
  properties: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  contractType: 'residential' | 'business' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
  bandwidth: number;
  installationDate: Date;
  region: string;
  commune: string;
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo: string;
  location: {
    lat: number;
    lng: number;
  };
  affectedElements: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface ConnectionPath {
  id: string;
  clientId: string;
  clientName: string;
  clientLocation: { lat: number; lng: number };
  startPoint: {
    id: string;
    name: string;
    type: 'central_office' | 'optical_splice' | 'junction_box';
    location: { lat: number; lng: number };
  };
  path: Array<{ lat: number; lng: number; elementType?: string; elementId?: string }>;
  distance: number;
  estimatedCost: number;
  fiberCount: number;
  installationType: 'aerial' | 'underground' | 'mixed';
  status: 'simulated' | 'approved' | 'in_progress' | 'completed';
  createdAt: Date;
  lastMileElements: NetworkElement[];
}