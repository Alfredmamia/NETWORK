import { 
  OpticalSplice, 
  CableConnection, 
  FiberSpliceMapping, 
  SpliceTestResult, 
  SpliceFiber,
  asianFiberColors, 
  networkTypeConfig,
  OpticalBudget,
  SpliceAnalysis 
} from '../types/splice';

class SpliceService {
  private splices: OpticalSplice[] = [];

  // Gestion des manchons
  async getSplices(filters?: {
    networkType?: string;
    status?: string;
    region?: string;
    type?: string;
  }): Promise<OpticalSplice[]> {
    let filtered = [...this.splices];

    if (filters) {
      if (filters.networkType && filters.networkType !== 'all') {
        filtered = filtered.filter(s => s.networkType === filters.networkType);
      }
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(s => s.status === filters.status);
      }
      if (filters.region) {
        filtered = filtered.filter(s => s.region === filters.region);
      }
      if (filters.type) {
        filtered = filtered.filter(s => s.type === filters.type);
      }
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createSplice(spliceData: Omit<OpticalSplice, 'id' | 'fiberMapping' | 'testResults' | 'createdAt' | 'updatedAt'>): Promise<OpticalSplice> {
    const newSplice: OpticalSplice = {
      ...spliceData,
      id: this.generateId('SPL'),
      fiberMapping: this.generateDefaultFiberMapping(spliceData.inputCable.capacity, spliceData.outputCable.capacity),
      testResults: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.splices.push(newSplice);
    this.saveToStorage();
    return newSplice;
  }

  async updateSplice(id: string, updates: Partial<OpticalSplice>): Promise<OpticalSplice | null> {
    const index = this.splices.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.splices[index] = {
      ...this.splices[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToStorage();
    return this.splices[index];
  }

  async deleteSplice(id: string): Promise<boolean> {
    const index = this.splices.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.splices.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Gestion des raccordements fibre par fibre
  private generateDefaultFiberMapping(inputCapacity: number, outputCapacity: number): FiberSpliceMapping[] {
    const mappings: FiberSpliceMapping[] = [];
    const maxFibers = Math.min(inputCapacity, outputCapacity);

    for (let i = 1; i <= maxFibers; i++) {
      mappings.push({
        inputFiber: i,
        outputFiber: i,
        insertionLoss: 0.3 + Math.random() * 0.4, // 0.3-0.7 dB typique
        testDate: new Date(),
        continuityStatus: 'untested',
        technician: 'Auto-généré'
      });
    }

    return mappings;
  }

  async updateFiberMapping(spliceId: string, mapping: FiberSpliceMapping): Promise<boolean> {
    const splice = this.splices.find(s => s.id === spliceId);
    if (!splice) return false;

    const mappingIndex = splice.fiberMapping.findIndex(
      m => m.inputFiber === mapping.inputFiber
    );

    if (mappingIndex === -1) {
      splice.fiberMapping.push(mapping);
    } else {
      splice.fiberMapping[mappingIndex] = mapping;
    }

    // Mettre à jour les statuts des fibres
    this.updateFiberStatuses(splice);

    splice.updatedAt = new Date();
    this.saveToStorage();
    return true;
  }

  private updateFiberStatuses(splice: OpticalSplice): void {
    // Mettre à jour les statuts des fibres d'entrée
    splice.inputCable.fibers.forEach(fiber => {
      const mapping = splice.fiberMapping.find(m => m.inputFiber === fiber.id);
      if (mapping) {
        fiber.status = mapping.continuityStatus === 'ok' ? 'spliced' : 'fault';
        fiber.connectedTo = mapping.outputFiber;
        fiber.insertionLoss = mapping.insertionLoss;
      } else {
        fiber.status = 'free';
        fiber.connectedTo = undefined;
      }
    });

    // Mettre à jour les statuts des fibres de sortie
    splice.outputCable.fibers.forEach(fiber => {
      const mapping = splice.fiberMapping.find(m => m.outputFiber === fiber.id);
      if (mapping) {
        fiber.status = mapping.continuityStatus === 'ok' ? 'spliced' : 'fault';
        fiber.connectedTo = mapping.inputFiber;
        fiber.insertionLoss = mapping.insertionLoss;
      } else {
        fiber.status = 'free';
        fiber.connectedTo = undefined;
      }
    });
  }

  // Tests de continuité
  async performContinuityTest(spliceId: string, inputFiber: number, outputFiber: number): Promise<SpliceTestResult> {
    const splice = this.splices.find(s => s.id === spliceId);
    if (!splice) throw new Error('Manchon introuvable');

    // Simulation de test
    const loss = 0.2 + Math.random() * 0.6; // 0.2-0.8 dB
    const result: SpliceTestResult = {
      id: this.generateId('TEST'),
      inputFiber,
      outputFiber,
      testDate: new Date(),
      testType: 'continuity',
      result: loss < 0.5 ? 'pass' : loss < 0.8 ? 'warning' : 'fail',
      measurement: loss,
      unit: 'dB',
      technician: 'Système Auto',
      notes: `Test automatique - Perte: ${loss.toFixed(2)} dB`
    };

    splice.testResults.push(result);

    // Mettre à jour le mapping
    const mapping = splice.fiberMapping.find(m => m.inputFiber === inputFiber && m.outputFiber === outputFiber);
    if (mapping) {
      mapping.insertionLoss = loss;
      mapping.testDate = new Date();
      mapping.continuityStatus = result.result === 'pass' ? 'ok' : 'fault';
      mapping.otdrMeasurement = loss;
    }

    this.updateFiberStatuses(splice);
    this.saveToStorage();
    return result;
  }

  // Calcul du budget optique
  async calculateOpticalBudget(spliceId: string): Promise<OpticalBudget> {
    const splice = this.splices.find(s => s.id === spliceId);
    if (!splice) throw new Error('Manchon introuvable');

    const totalLoss = splice.fiberMapping.reduce((sum, mapping) => sum + mapping.insertionLoss, 0) / splice.fiberMapping.length;
    const maxAllowedLoss = this.getMaxAllowedLoss(splice.networkType);
    const margin = maxAllowedLoss - totalLoss;

    const budget: OpticalBudget = {
      totalLoss,
      maxAllowedLoss,
      margin,
      status: margin > 3 ? 'ok' : margin > 1 ? 'warning' : 'critical',
      recommendations: []
    };

    if (budget.status === 'warning') {
      budget.recommendations.push('Vérifier les soudures');
      budget.recommendations.push('Nettoyer les connecteurs');
    } else if (budget.status === 'critical') {
      budget.recommendations.push('Refaire les soudures défectueuses');
      budget.recommendations.push('Vérifier l\'alignement des fibres');
      budget.recommendations.push('Considérer un amplificateur optique');
    }

    return budget;
  }

  private getMaxAllowedLoss(networkType: string): number {
    switch (networkType) {
      case 'backbone_international':
      case 'backbone_national':
        return 35; // Budget élevé pour longue distance
      case 'metropolitan':
        return 30;
      case 'ftth_gpon':
        return 28;
      case 'p2p_dedicated':
        return 25;
      default:
        return 28;
    }
  }

  // Analyse des manchons
  async analyzeSplice(spliceId: string): Promise<SpliceAnalysis> {
    const splice = this.splices.find(s => s.id === spliceId);
    if (!splice) throw new Error('Manchon introuvable');

    const losses = splice.fiberMapping.map(m => m.insertionLoss);
    const averageInsertionLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length;
    const maxInsertionLoss = Math.max(...losses);
    const faultyConnections = splice.fiberMapping.filter(m => m.continuityStatus === 'fault').length;
    const utilizationRate = splice.fiberMapping.length / Math.min(splice.inputCable.capacity, splice.outputCable.capacity) * 100;

    const analysis: SpliceAnalysis = {
      averageInsertionLoss,
      maxInsertionLoss,
      faultyConnections,
      utilizationRate,
      recommendations: []
    };

    if (averageInsertionLoss > 0.6) {
      analysis.recommendations.push('Pertes moyennes élevées - Vérifier la qualité des soudures');
    }
    if (maxInsertionLoss > 1.0) {
      analysis.recommendations.push('Perte maximale critique - Refaire la soudure défectueuse');
    }
    if (faultyConnections > 0) {
      analysis.recommendations.push(`${faultyConnections} connexion(s) défectueuse(s) détectée(s)`);
    }
    if (utilizationRate > 90) {
      analysis.recommendations.push('Taux d\'utilisation élevé - Prévoir une extension');
    }

    return analysis;
  }

  // Génération de câbles avec fibres
  generateCableConnection(
    cableId: string, 
    cableName: string, 
    capacity: number, 
    networkType: string
  ): CableConnection {
    const fibers: SpliceFiber[] = [];
    
    for (let i = 1; i <= capacity; i++) {
      const colorIndex = ((i - 1) % 12);
      const color = asianFiberColors[colorIndex];
      const tubeNumber = Math.ceil(i / 12);

      fibers.push({
        id: i,
        color: color.color,
        colorHex: color.hex,
        colorEnglish: color.english,
        tubeNumber: capacity > 12 ? tubeNumber : undefined,
        status: 'free',
        notes: ''
      });
    }

    const networkConfig = networkTypeConfig[networkType as keyof typeof networkTypeConfig];

    return {
      cableId,
      cableName,
      capacity: capacity as any,
      cableType: 'single_mode',
      networkType,
      color: networkConfig?.color || '#10B981',
      fibers
    };
  }

  // Rapports
  async generateSpliceReport(spliceId?: string): Promise<{
    totalSplices: number;
    activeSplices: number;
    averageInsertionLoss: number;
    faultyConnections: number;
    byNetworkType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const splices = spliceId 
      ? this.splices.filter(s => s.id === spliceId)
      : this.splices;

    const totalSplices = splices.length;
    const activeSplices = splices.filter(s => s.status === 'active').length;
    
    const allMappings = splices.flatMap(s => s.fiberMapping);
    const averageInsertionLoss = allMappings.length > 0 
      ? allMappings.reduce((sum, m) => sum + m.insertionLoss, 0) / allMappings.length 
      : 0;
    
    const faultyConnections = allMappings.filter(m => m.continuityStatus === 'fault').length;

    const byNetworkType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    splices.forEach(splice => {
      byNetworkType[splice.networkType] = (byNetworkType[splice.networkType] || 0) + 1;
      byStatus[splice.status] = (byStatus[splice.status] || 0) + 1;
    });

    return {
      totalSplices,
      activeSplices,
      averageInsertionLoss,
      faultyConnections,
      byNetworkType,
      byStatus
    };
  }

  // Utilitaires
  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  private saveToStorage(): void {
    localStorage.setItem('opticalSplices', JSON.stringify(this.splices));
  }

  private loadFromStorage(): void {
    const splicesData = localStorage.getItem('opticalSplices');

    if (splicesData) {
      this.splices = JSON.parse(splicesData).map((splice: any) => ({
        ...splice,
        installDate: new Date(splice.installDate),
        createdAt: new Date(splice.createdAt),
        updatedAt: new Date(splice.updatedAt),
        fiberMapping: splice.fiberMapping.map((mapping: any) => ({
          ...mapping,
          testDate: new Date(mapping.testDate)
        })),
        testResults: splice.testResults.map((result: any) => ({
          ...result,
          testDate: new Date(result.testDate)
        }))
      }));
    }
  }

  // Initialisation avec données de démo
  initializeDemoData(): void {
    this.loadFromStorage();
    
    if (this.splices.length === 0) {
      // Créer quelques manchons de démonstration
      const demoSplices = [
        {
          name: 'Manchon Backbone Douala-Yaoundé KM45',
          location: { lat: 4.2511, lng: 10.5679, name: 'Route Nationale N°1 - KM45' },
          type: 'underground' as const,
          networkType: 'backbone_national' as const,
          status: 'active' as const,
          installDate: new Date('2023-03-15'),
          technician: 'Jean Mballa',
          inputCable: this.generateCableConnection('CBL-IN-001', 'Câble Douala-Edéa 144F', 144, 'backbone_national'),
          outputCable: this.generateCableConnection('CBL-OUT-001', 'Câble Edéa-Yaoundé 144F', 144, 'backbone_national'),
          materialReference: 'SPLICE-UG-144F-001',
          photos: [],
          notes: 'Manchon principal backbone - Surveillance 24/7',
          region: 'Littoral',
          department: 'Wouri',
          commune: 'Douala 1er'
        },
        {
          name: 'Manchon FTTH Makepe Distribution',
          location: { lat: 4.0711, lng: 9.7479, name: 'Point Distribution Makepe Nord' },
          type: 'cabinet' as const,
          networkType: 'ftth_gpon' as const,
          status: 'active' as const,
          installDate: new Date('2024-01-20'),
          technician: 'Marie Fotso',
          inputCable: this.generateCableConnection('CBL-IN-002', 'Câble Feeder Makepe 48F', 48, 'ftth_gpon'),
          outputCable: this.generateCableConnection('CBL-OUT-002', 'Câble Distribution Makepe 24F', 24, 'ftth_gpon'),
          materialReference: 'SPLICE-CAB-48F-002',
          photos: [],
          notes: 'Distribution FTTH quartier Makepe',
          region: 'Littoral',
          department: 'Wouri',
          commune: 'Douala 5ème'
        }
      ];

      demoSplices.forEach(async (spliceData) => {
        await this.createSplice(spliceData);
      });
    }
  }

  constructor() {
    this.initializeDemoData();
  }
}

export const spliceService = new SpliceService();