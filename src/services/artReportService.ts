import { ARTReport } from '../types/network';

class ARTReportService {
  private reports: ARTReport[] = [];

  async generateQuarterlyReport(quarter: number, year: number): Promise<ARTReport> {
    const reportId = `ART-${year}-Q${quarter}`;
    
    // Simulation de génération de rapport
    const report: ARTReport = {
      id: reportId,
      period: {
        start: `${year}-${(quarter - 1) * 3 + 1}-01`,
        end: `${year}-${quarter * 3}-${this.getLastDayOfMonth(quarter * 3, year)}`,
        quarter,
        year
      },
      metrics: {
        networkAvailability: 99.2 + Math.random() * 0.7, // 99.2% - 99.9%
        averageLatency: 15 + Math.random() * 10, // 15-25ms
        throughput: 85 + Math.random() * 10, // 85-95%
        clientSatisfaction: 4.2 + Math.random() * 0.6, // 4.2-4.8/5
        incidentCount: Math.floor(Math.random() * 20) + 5, // 5-25 incidents
        resolutionTime: 2 + Math.random() * 4 // 2-6 heures moyenne
      },
      regionalData: [
        {
          region: 'Littoral',
          coverage: 82.5,
          clients: 1247,
          revenue: 1850000000,
          incidents: 8
        },
        {
          region: 'Centre',
          coverage: 78.3,
          clients: 1089,
          revenue: 1620000000,
          incidents: 6
        },
        {
          region: 'Ouest',
          coverage: 45.2,
          clients: 234,
          revenue: 350000000,
          incidents: 3
        }
      ],
      complianceScore: 95 + Math.random() * 4, // 95-99%
      recommendations: [
        'Améliorer la redondance des liaisons principales',
        'Renforcer la maintenance préventive',
        'Étendre la couverture dans les zones rurales',
        'Optimiser les temps de réponse aux incidents'
      ],
      generatedAt: new Date(),
      status: 'draft'
    };

    this.reports.push(report);
    return report;
  }

  async getReports(filters?: { year?: number; quarter?: number; status?: string }): Promise<ARTReport[]> {
    let filtered = [...this.reports];

    if (filters) {
      if (filters.year) {
        filtered = filtered.filter(r => r.period.year === filters.year);
      }
      if (filters.quarter) {
        filtered = filtered.filter(r => r.period.quarter === filters.quarter);
      }
      if (filters.status) {
        filtered = filtered.filter(r => r.status === filters.status);
      }
    }

    return filtered.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  async submitReport(reportId: string): Promise<ARTReport | null> {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return null;

    report.status = 'submitted';
    report.submittedAt = new Date();
    
    return report;
  }

  async exportReportToPDF(reportId: string): Promise<Blob> {
    // Simulation d'export PDF
    const report = this.reports.find(r => r.id === reportId);
    if (!report) throw new Error('Rapport non trouvé');

    // En réalité, ici on utiliserait une bibliothèque comme jsPDF
    const pdfContent = `Rapport ART ${report.period.quarter}/${report.period.year}\n\nDisponibilité réseau: ${report.metrics.networkAvailability.toFixed(2)}%\nScore de conformité: ${report.complianceScore.toFixed(1)}%`;
    
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  private getLastDayOfMonth(month: number, year: number): string {
    const lastDay = new Date(year, month, 0).getDate();
    return lastDay.toString().padStart(2, '0');
  }

  // Initialisation avec des données de démonstration
  initializeDemoData(): void {
    // Rapport Q4 2023
    this.reports.push({
      id: 'ART-2023-Q4',
      period: {
        start: '2023-10-01',
        end: '2023-12-31',
        quarter: 4,
        year: 2023
      },
      metrics: {
        networkAvailability: 99.4,
        averageLatency: 18.5,
        throughput: 91.2,
        clientSatisfaction: 4.3,
        incidentCount: 12,
        resolutionTime: 3.2
      },
      regionalData: [
        {
          region: 'Littoral',
          coverage: 80.1,
          clients: 1156,
          revenue: 1720000000,
          incidents: 7
        },
        {
          region: 'Centre',
          coverage: 75.8,
          clients: 987,
          revenue: 1480000000,
          incidents: 4
        },
        {
          region: 'Ouest',
          coverage: 42.3,
          clients: 198,
          revenue: 297000000,
          incidents: 1
        }
      ],
      complianceScore: 97.2,
      recommendations: [
        'Améliorer la redondance des liaisons principales',
        'Renforcer la maintenance préventive',
        'Étendre la couverture dans les zones rurales'
      ],
      generatedAt: new Date('2024-01-05'),
      submittedAt: new Date('2024-01-15'),
      status: 'submitted'
    });
  }
}

export const artReportService = new ARTReportService();