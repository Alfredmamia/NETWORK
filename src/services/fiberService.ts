import { 
  FiberSection, 
  Fiber, 
  Splice, 
  FiberMapping, 
  TestResult, 
  asianFiberColors, 
  ServiceType,
  OpticalBudget,
  AIAnalysis 
} from '../types/fiber';

class FiberService {
  private sections: FiberSection[] = [];
  private splices: Splice[] = [];

  // Gestion des tronçons
  async getFiberSections(filters?: {
    status?: string;
    region?: string;
    installationType?: string;
  }): Promise<FiberSection[]> {
    let filtered = [...this.sections];

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(s => s.status === filters.status);
      }
      if (filters.installationType) {
        filtered = filtered.filter(s => s.installationType === filters.installationType);
      }
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createFiberSection(sectionData: Omit<FiberSection, 'id' | 'fibers' | 'splices' | 'createdAt' | 'updatedAt'>): Promise<FiberSection> {
    const newSection: FiberSection = {
      ...sectionData,
      id: this.generateId('FS'),
      fibers: this.generateFibers(sectionData.capacity),
      splices: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sections.push(newSection);
    this.saveToStorage();
    return newSection;
  }

  async updateFiberSection(id: string, updates: Partial<FiberSection>): Promise<FiberSection | null> {
    const index = this.sections.findIndex(s => s.id === id);
    if (index === -1) return null;

    // Si la capacité change, régénérer les fibres
    if (updates.capacity && updates.capacity !== this.sections[index].capacity) {
      updates.fibers = this.generateFibers(updates.capacity);
    }

    this.sections[index] = {
      ...this.sections[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToStorage();
    return this.sections[index];
  }

  async deleteFiberSection(id: string): Promise<boolean> {
    const index = this.sections.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.sections.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Gestion des fibres
  private generateFibers(capacity: number): Fiber[] {
    const fibers: Fiber[] = [];
    
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
        assignedService: 'free',
        status: 'free',
        notes: '',
        isProjected: false
      });
    }

    return fibers;
  }

  async updateFiber(sectionId: string, fiberId: number, updates: Partial<Fiber>): Promise<boolean> {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return false;

    const fiberIndex = section.fibers.findIndex(f => f.id === fiberId);
    if (fiberIndex === -1) return false;

    section.fibers[fiberIndex] = {
      ...section.fibers[fiberIndex],
      ...updates
    };

    section.updatedAt = new Date();
    this.saveToStorage();
    return true;
  }

  // Gestion des manchons
  async getSplices(sectionId?: string): Promise<Splice[]> {
    if (sectionId) {
      return this.splices.filter(s => 
        s.inputSection === sectionId || s.outputSection === sectionId
      );
    }
    return [...this.splices];
  }

  async createSplice(spliceData: Omit<Splice, 'id' | 'fiberMapping' | 'testResults'>): Promise<Splice> {
    const inputSection = this.sections.find(s => s.id === spliceData.inputSection);
    const outputSection = this.sections.find(s => s.id === spliceData.outputSection);
    
    if (!inputSection || !outputSection) {
      throw new Error('Sections d\'entrée ou de sortie introuvables');
    }

    const newSplice: Splice = {
      ...spliceData,
      id: this.generateId('MAN'),
      fiberMapping: this.generateDefaultFiberMapping(inputSection.capacity, outputSection.capacity),
      testResults: []
    };

    this.splices.push(newSplice);
    this.saveToStorage();
    return newSplice;
  }

  private generateDefaultFiberMapping(inputCapacity: number, outputCapacity: number): FiberMapping[] {
    const mappings: FiberMapping[] = [];
    const maxFibers = Math.min(inputCapacity, outputCapacity);

    for (let i = 1; i <= maxFibers; i++) {
      mappings.push({
        inputFiber: i,
        outputFiber: i,
        insertionLoss: 0.3 + Math.random() * 0.4, // 0.3-0.7 dB typique
        testDate: new Date(),
        continuityStatus: 'untested'
      });
    }

    return mappings;
  }

  async updateFiberMapping(spliceId: string, mapping: FiberMapping): Promise<boolean> {
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

    this.saveToStorage();
    return true;
  }

  // Tests de continuité
  async performContinuityTest(spliceId: string, fiberNumber: number): Promise<TestResult> {
    const splice = this.splices.find(s => s.id === spliceId);
    if (!splice) throw new Error('Manchon introuvable');

    // Simulation de test
    const loss = 0.2 + Math.random() * 0.6; // 0.2-0.8 dB
    const result: TestResult = {
      id: this.generateId('TEST'),
      fiberNumber,
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
    const mapping = splice.fiberMapping.find(m => m.inputFiber === fiberNumber);
    if (mapping) {
      mapping.insertionLoss = loss;
      mapping.testDate = new Date();
      mapping.continuityStatus = result.result === 'pass' ? 'ok' : 'fault';
      mapping.otdrMeasurement = loss;
    }

    this.saveToStorage();
    return result;
  }

  // Calcul du budget optique
  async calculateOpticalBudget(sectionId: string, fiberNumber: number): Promise<OpticalBudget> {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) throw new Error('Section introuvable');

    // Calculs simplifiés pour la démo
    const fiberLoss = (section.length / 1000) * 0.35; // 0.35 dB/km
    const splicesLoss = this.splices
      .filter(s => s.inputSection === sectionId || s.outputSection === sectionId)
      .reduce((total, splice) => {
        const mapping = splice.fiberMapping.find(m => m.inputFiber === fiberNumber);
        return total + (mapping?.insertionLoss || 0.5);
      }, 0);

    const connectorLoss = 0.5; // Pertes connecteurs
    const totalLoss = fiberLoss + splicesLoss + connectorLoss;
    const maxAllowedLoss = 28; // Budget typique pour GPON
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
      budget.recommendations.push('Remplacer les soudures défectueuses');
      budget.recommendations.push('Vérifier l\'intégrité du câble');
      budget.recommendations.push('Considérer un amplificateur optique');
    }

    return budget;
  }

  // Analyse IA (simulation)
  async performAIAnalysis(sectionId: string): Promise<AIAnalysis> {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) throw new Error('Section introuvable');

    // Simulation d'analyse IA
    const analysis: AIAnalysis = {
      anomalies: [],
      predictedFailures: [],
      optimizationSuggestions: [
        'Optimiser le routage des fibres haute priorité',
        'Planifier la maintenance préventive des manchons',
        'Surveiller les fibres avec pertes élevées'
      ]
    };

    // Générer quelques anomalies aléatoirement
    if (Math.random() > 0.7) {
      analysis.anomalies.push({
        fiberNumber: Math.floor(Math.random() * section.capacity) + 1,
        type: 'loss_increase',
        severity: 'medium',
        description: 'Augmentation progressive des pertes détectée',
        recommendation: 'Vérifier l\'état du manchon et nettoyer les connecteurs'
      });
    }

    if (Math.random() > 0.8) {
      analysis.predictedFailures.push({
        fiberNumber: Math.floor(Math.random() * section.capacity) + 1,
        probability: 0.75,
        timeframe: '3-6 mois',
        reason: 'Dégradation progressive de la soudure'
      });
    }

    return analysis;
  }

  // Rapports
  async generateUtilizationReport(sectionId?: string): Promise<{
    totalFibers: number;
    usedFibers: number;
    utilizationRate: number;
    byService: Record<ServiceType, number>;
    byStatus: Record<string, number>;
  }> {
    const sections = sectionId 
      ? this.sections.filter(s => s.id === sectionId)
      : this.sections;

    const allFibers = sections.flatMap(s => s.fibers);
    const totalFibers = allFibers.length;
    const usedFibers = allFibers.filter(f => f.assignedService !== 'free').length;

    const byService: Record<ServiceType, number> = {
      free: 0,
      internet_residential: 0,
      internet_enterprise: 0,
      telephony: 0,
      backbone: 0,
      dedicated_client: 0,
      maintenance: 0,
      reserved: 0
    };

    const byStatus: Record<string, number> = {
      active: 0,
      reserved: 0,
      fault: 0,
      test: 0,
      free: 0
    };

    allFibers.forEach(fiber => {
      byService[fiber.assignedService]++;
      byStatus[fiber.status]++;
    });

    return {
      totalFibers,
      usedFibers,
      utilizationRate: totalFibers > 0 ? (usedFibers / totalFibers) * 100 : 0,
      byService,
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
    localStorage.setItem('fiberSections', JSON.stringify(this.sections));
    localStorage.setItem('fiberSplices', JSON.stringify(this.splices));
  }

  private loadFromStorage(): void {
    const sectionsData = localStorage.getItem('fiberSections');
    const splicesData = localStorage.getItem('fiberSplices');

    if (sectionsData) {
      this.sections = JSON.parse(sectionsData).map((section: any) => ({
        ...section,
        installationDate: new Date(section.installationDate),
        createdAt: new Date(section.createdAt),
        updatedAt: new Date(section.updatedAt)
      }));
    }

    if (splicesData) {
      this.splices = JSON.parse(splicesData).map((splice: any) => ({
        ...splice,
        installDate: new Date(splice.installDate),
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
    
    if (this.sections.length === 0) {
      // Créer quelques tronçons de démonstration
      const demoSections = [
        {
          name: 'Douala-Yaoundé Segment 1',
          startPoint: { lat: 4.0511, lng: 9.7679, name: 'Central Douala Bonanjo' },
          endPoint: { lat: 3.8480, lng: 11.5021, name: 'Central Yaoundé Centre' },
          length: 245000,
          capacity: 144 as const,
          installationType: 'underground' as const,
          installationDate: new Date('2023-03-15'),
          status: 'existing' as const
        },
        {
          name: 'Extension Makepe Phase 2',
          startPoint: { lat: 4.0611, lng: 9.7579, name: 'DSLAM Makepe' },
          endPoint: { lat: 4.0711, lng: 9.7479, name: 'Point Distribution Makepe Nord' },
          length: 3500,
          capacity: 48 as const,
          installationType: 'aerial' as const,
          installationDate: new Date('2024-01-20'),
          status: 'projected' as const
        }
      ];

      demoSections.forEach(async (sectionData) => {
        await this.createFiberSection(sectionData);
      });
    }
  }

  constructor() {
    this.initializeDemoData();
  }
}

export const fiberService = new FiberService();