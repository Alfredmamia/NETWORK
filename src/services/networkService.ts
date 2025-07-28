import { NetworkElement, FiberCable, Equipment, Infrastructure, NetworkProject, MaintenanceTicket } from '../types/network';

class NetworkService {
  private elements: NetworkElement[] = [];
  private projects: NetworkProject[] = [];
  private tickets: MaintenanceTicket[] = [];

  // Gestion des éléments réseau
  async getNetworkElements(filters?: {
    type?: string;
    region?: string;
    status?: string;
    bounds?: { north: number; south: number; east: number; west: number };
  }): Promise<NetworkElement[]> {
    let filtered = [...this.elements];

    if (filters) {
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(el => el.type === filters.type);
      }
      if (filters.region) {
        filtered = filtered.filter(el => el.region === filters.region);
      }
      if (filters.status) {
        filtered = filtered.filter(el => el.status === filters.status);
      }
      if (filters.bounds) {
        filtered = filtered.filter(el => 
          el.location.lat >= filters.bounds!.south &&
          el.location.lat <= filters.bounds!.north &&
          el.location.lng >= filters.bounds!.west &&
          el.location.lng <= filters.bounds!.east
        );
      }
    }

    return filtered;
  }

  async addNetworkElement(element: Omit<NetworkElement, 'id' | 'createdAt' | 'updatedAt'>): Promise<NetworkElement> {
    const newElement: NetworkElement = {
      ...element,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.elements.push(newElement);
    return newElement;
  }

  async updateNetworkElement(id: string, updates: Partial<NetworkElement>): Promise<NetworkElement | null> {
    const index = this.elements.findIndex(el => el.id === id);
    if (index === -1) return null;

    this.elements[index] = {
      ...this.elements[index],
      ...updates,
      updatedAt: new Date()
    };

    return this.elements[index];
  }

  async deleteNetworkElement(id: string): Promise<boolean> {
    const index = this.elements.findIndex(el => el.id === id);
    if (index === -1) return false;

    this.elements.splice(index, 1);
    return true;
  }

  // Calculs de faisabilité et optimisation
  async calculateOptimalPath(start: { lat: number; lng: number }, end: { lat: number; lng: number }): Promise<{
    path: Array<{ lat: number; lng: number }>;
    distance: number;
    estimatedCost: number;
    feasibilityScore: number;
  }> {
    // Simulation d'un calcul d'optimisation de tracé
    const distance = this.calculateDistance(start, end);
    const path = [start, end]; // Simplifié pour la démo
    
    return {
      path,
      distance,
      estimatedCost: distance * 15000, // 15,000 FCFA par mètre
      feasibilityScore: Math.random() * 100 // Score simulé
    };
  }

  async analyzeNetworkCoverage(region: string): Promise<{
    totalArea: number;
    coveredArea: number;
    coveragePercentage: number;
    gaps: Array<{ lat: number; lng: number; priority: number }>;
  }> {
    // Simulation d'analyse de couverture
    return {
      totalArea: 1000, // km²
      coveredArea: 780, // km²
      coveragePercentage: 78,
      gaps: [
        { lat: 4.0511, lng: 9.7679, priority: 85 },
        { lat: 3.8480, lng: 11.5021, priority: 72 }
      ]
    };
  }

  // Gestion des projets
  async getProjects(filters?: { status?: string; region?: string }): Promise<NetworkProject[]> {
    let filtered = [...this.projects];

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      if (filters.region) {
        filtered = filtered.filter(p => p.coverage.region === filters.region);
      }
    }

    return filtered;
  }

  async createProject(project: Omit<NetworkProject, 'id'>): Promise<NetworkProject> {
    const newProject: NetworkProject = {
      ...project,
      id: this.generateId()
    };

    this.projects.push(newProject);
    return newProject;
  }

  // Gestion des tickets de maintenance
  async getMaintenanceTickets(filters?: { 
    status?: string; 
    priority?: string; 
    region?: string;
    assignedTo?: string;
  }): Promise<MaintenanceTicket[]> {
    let filtered = [...this.tickets];

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(t => t.status === filters.status);
      }
      if (filters.priority) {
        filtered = filtered.filter(t => t.priority === filters.priority);
      }
      if (filters.region) {
        filtered = filtered.filter(t => t.location.region === filters.region);
      }
      if (filters.assignedTo) {
        filtered = filtered.filter(t => t.assignedTo === filters.assignedTo);
      }
    }

    return filtered.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async createMaintenanceTicket(ticket: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt' | 'workLog'>): Promise<MaintenanceTicket> {
    const newTicket: MaintenanceTicket = {
      ...ticket,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      workLog: []
    };

    this.tickets.push(newTicket);
    return newTicket;
  }

  // Utilitaires
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Initialisation avec des données de démonstration
  initializeDemoData(): void {
    // Initialiser les données de toutes les régions du Cameroun
    this.initializeAllRegionsData();
    
    // Câbles fibre
    this.elements.push({
      id: 'cable-001',
      type: 'cable',
      name: 'Câble Principal Douala-Yaoundé',
      location: { lat: 4.0511, lng: 9.7679 },
      status: 'active',
      region: 'Littoral',
      department: 'Wouri',
      commune: 'Douala 1er',
      properties: {
        length: 245000,
        fiberCount: 144,
        cableType: 'single_mode',
        installation: 'aerial',
        capacity: 85,
        manufacturer: 'Corning',
        installationDate: '2022-03-15',
        specifications: 'G.652.D standard'
      },
      createdAt: new Date('2022-03-15'),
      updatedAt: new Date()
    });

    // DSLAM
    this.elements.push({
      id: 'dslam-001',
      type: 'dslam',
      name: 'DSLAM Bonanjo Principal',
      location: { lat: 4.0611, lng: 9.7579 },
      status: 'active',
      region: 'Littoral',
      department: 'Wouri',
      commune: 'Douala 1er',
      properties: {
        model: 'MA5608T',
        manufacturer: 'Huawei',
        serialNumber: 'HW-MA5608T-001',
        installationDate: '2022-01-20',
        capacity: 1000,
        currentLoad: 750,
        firmware: 'V800R017C10',
        ports: 48,
        specifications: {
          maxThroughput: '10Gbps',
          powerConsumption: '150W',
          operatingTemp: '-5°C to +45°C'
        }
      },
      createdAt: new Date('2022-01-20'),
      updatedAt: new Date()
    });

    // Projets de démonstration
    this.projects.push({
      id: 'proj-001',
      name: 'Extension Réseau Makepe Phase 2',
      description: 'Déploiement de la fibre optique dans les nouveaux quartiers de Makepe pour couvrir 800 nouveaux foyers',
      type: 'extension',
      status: 'in_progress',
      budget: 650000000,
      estimatedCost: 620000000,
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      progress: 45,
      coverage: {
        region: 'Littoral',
        departments: ['Wouri'],
        communes: ['Douala 5ème'],
        estimatedClients: 800,
        area: 4.2,
        coordinates: [
          { lat: 4.0711, lng: 9.7479 },
          { lat: 4.0811, lng: 9.7379 },
          { lat: 4.0611, lng: 9.7579 }
        ]
      },
      team: {
        manager: 'Jean Mballa',
        technicians: ['Paul Nkomo', 'Marie Fotso', 'André Biya'],
        contractors: ['CAMTEL Fiber Solutions']
      },
      feasibilityStudy: {
        technicalFeasibility: 92,
        financialViability: 87,
        riskAssessment: 'Risque faible - Zone urbaine bien desservie',
        recommendations: [
          'Coordination avec ENEO pour les poteaux électriques',
          'Négociation des droits de passage avec les propriétaires',
          'Installation de protection contre la foudre'
        ]
      }
    });

    // Tickets de maintenance
    this.tickets.push({
      id: 'TK-2024-001',
      title: 'Panne fibre optique - Secteur Akwa',
      description: 'Interruption complète du service dans le quartier Akwa suite à une coupure de câble lors de travaux de voirie',
      priority: 'critical',
      status: 'in_progress',
      type: 'emergency',
      assignedTo: 'Équipe Intervention Rapide',
      location: {
        lat: 4.0411, lng: 9.7779,
        address: 'Avenue de la Liberté, Akwa',
        region: 'Littoral',
        department: 'Wouri',
        commune: 'Douala 1er'
      },
      affectedElements: ['cable-001'],
      affectedClients: 156,
      createdAt: new Date('2024-01-15T08:30:00Z'),
      updatedAt: new Date('2024-01-15T14:20:00Z'),
      estimatedResolutionTime: 4,
      workLog: [
        {
          timestamp: new Date('2024-01-15T09:00:00Z'),
          technician: 'Paul Nkomo',
          action: 'Localisation de la panne',
          notes: 'Câble sectionné au niveau du carrefour Akwa. Dégâts causés par pelleteuse.'
        },
        {
          timestamp: new Date('2024-01-15T11:30:00Z'),
          technician: 'Marie Fotso',
          action: 'Préparation du matériel',
          notes: 'Commande de 50m de câble fibre et boîtier de raccordement d\'urgence.'
        }
      ]
    });
  }

  private initializeAllRegionsData(): void {
    // Ajouter des éléments de démonstration pour toutes les régions
    const regionsData = [
      { region: 'Adamaoua', lat: 6.5000, lng: 12.5000, clients: 45 },
      { region: 'Centre', lat: 3.8480, lng: 11.5021, clients: 1089 },
      { region: 'Est', lat: 4.5000, lng: 14.0000, clients: 78 },
      { region: 'Extrême-Nord', lat: 10.5000, lng: 14.5000, clients: 123 },
      { region: 'Littoral', lat: 4.0511, lng: 9.7679, clients: 1247 },
      { region: 'Nord', lat: 8.5000, lng: 13.5000, clients: 156 },
      { region: 'Nord-Ouest', lat: 6.2000, lng: 10.2000, clients: 234 },
      { region: 'Ouest', lat: 5.4737, lng: 10.4176, clients: 345 },
      { region: 'Sud', lat: 2.9167, lng: 11.5167, clients: 89 },
      { region: 'Sud-Ouest', lat: 4.1500, lng: 9.2500, clients: 167 }
    ];

    regionsData.forEach((regionData, index) => {
      // Ajouter un DSLAM principal par région
      this.elements.push({
        id: `dslam-${regionData.region.toLowerCase().replace(/[^a-z]/g, '')}-001`,
        type: 'dslam',
        name: `DSLAM Principal ${regionData.region}`,
        location: { lat: regionData.lat, lng: regionData.lng },
        status: 'active',
        region: regionData.region,
        department: 'Principal',
        commune: 'Centre-ville',
        networkLayer: 'access',
        criticality: 'high',
        properties: {
          model: 'MA5608T',
          manufacturer: 'Huawei',
          serialNumber: `HW-MA5608T-${String(index + 1).padStart(3, '0')}`,
          installationDate: '2023-01-15',
          capacity: 1000,
          currentLoad: regionData.clients,
          firmware: 'V800R017C10',
          ports: 48,
          specifications: {
            maxThroughput: '10Gbps',
            powerConsumption: '150W',
            operatingTemp: '-5°C to +45°C'
          }
        },
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date()
      });

      // Ajouter un câble de liaison par région
      this.elements.push({
        id: `cable-backbone-${regionData.region.toLowerCase().replace(/[^a-z]/g, '')}-001`,
        type: 'cable',
        name: `Liaison Backbone ${regionData.region}`,
        location: { lat: regionData.lat + 0.01, lng: regionData.lng + 0.01 },
        status: 'active',
        region: regionData.region,
        department: 'Principal',
        commune: 'Centre-ville',
        networkLayer: 'backbone',
        criticality: 'critical',
        properties: {
          length: 50000 + Math.random() * 100000,
          fiberCount: 144,
          cableType: 'single_mode',
          installation: 'underground',
          capacity: 75 + Math.random() * 20,
          manufacturer: 'Corning',
          installationDate: '2022-06-15',
          specifications: 'G.652.D standard',
          networkType: 'backbone_national'
        },
        createdAt: new Date('2022-06-15'),
        updatedAt: new Date()
      });
    });
  }
}

export const networkService = new NetworkService();