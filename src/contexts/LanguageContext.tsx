import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    'nav.dashboard': 'Tableau de Bord',
    'nav.network': 'Réseau',
    'nav.assets': 'Inventaire',
    'nav.clients': 'Clients',
    'nav.maintenance': 'Maintenance',
    'nav.reports': 'Rapports',
    'nav.planning': 'Planification',
    'common.search': 'Rechercher...',
    'dashboard.title': 'Tableau de Bord Network Way',
    'dashboard.welcome': 'Bienvenue dans votre système de gestion réseau fibre optique',
    'dashboard.networkOverview': 'Vue d\'Ensemble Réseau',
    'dashboard.quickAccess': 'Accès Rapide aux Modules',
    'dashboard.geographicOverview': 'Aperçu Géographique Cameroun',
    'dashboard.kpi': 'Indicateurs Clés de Performance',
    'dashboard.realTimeCharts': 'Graphiques Temps Réel',
    'dashboard.notifications': 'Notifications et Alertes',
    'dashboard.quickActions': 'Actions Rapides',
    'dashboard.totalClients': 'Clients Totaux',
    'dashboard.activeConnections': 'Connexions Actives',
    'dashboard.networkUptime': 'Disponibilité Réseau',
    'dashboard.pendingTickets': 'Tickets en Attente',
    'dashboard.recentActivity': 'Activité Récente',
    'dashboard.performanceMetrics': 'Métriques de Performance',
    'network.title': 'Gestion du Réseau',
    'network.addElement': 'Ajouter un Élément',
    'assets.title': 'Inventaire des Actifs',
    'assets.addAsset': 'Ajouter un Actif',
    'assets.totalValue': 'Valeur Totale',
    'clients.title': 'Gestion des Clients',
    'clients.addClient': 'Ajouter un Client',
    'maintenance.title': 'Maintenance',
    'maintenance.addTicket': 'Créer un Ticket',
    'reports.title': 'Rapports',
    'reports.generate': 'Générer un Rapport',
    'planning.title': 'Planification Réseau',
    'planning.addProject': 'Nouveau Projet',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'network.interactiveMap': 'Carte Interactive',
    'network.layers': 'Couches',
    'network.allElements': 'Tous les éléments',
    'network.cables': 'Câbles',
    'network.equipment': 'Équipements',
    'network.clientPoints': 'Points clients',
    'network.poles': 'Poteaux',
    'network.chambers': 'Chambres',
    'network.status.active': 'Actif',
    'network.status.maintenance': 'Maintenance',
    'network.status.fault': 'Panne',
    'network.status.inactive': 'Inactif',
    'network.region': 'Région',
    'network.department': 'Département',
    'network.commune': 'Commune',
    'network.coordinates': 'Coordonnées',
    'network.properties': 'Propriétés',
    'network.selectElement': 'Sélectionnez un élément sur la carte',
    'network.totalCables': 'Câbles Totaux',
    'network.totalEquipment': 'Équipements',
    'network.totalClients': 'Points Clients',
    'network.coverage': 'Couverture',
    'art.compliance': 'Conformité ART',
    'art.generateReport': 'Générer Rapport ART',
    'art.quarterlyReport': 'Rapport Trimestriel',
    'art.networkAvailability': 'Disponibilité Réseau',
    'art.averageLatency': 'Latence Moyenne',
    'art.throughput': 'Débit',
    'art.clientSatisfaction': 'Satisfaction Client',
    'art.incidentCount': 'Nombre d\'Incidents',
    'art.resolutionTime': 'Temps de Résolution',
    'art.complianceScore': 'Score de Conformité',
    'maintenance.preventive': 'Préventive',
    'maintenance.corrective': 'Corrective',
    'maintenance.emergency': 'Urgence',
    'maintenance.workLog': 'Journal de Travail',
    'maintenance.affectedClients': 'Clients Affectés',
    'maintenance.estimatedTime': 'Temps Estimé',
    'maintenance.actualTime': 'Temps Réel',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.network': 'Network',
    'nav.assets': 'Assets',
    'nav.clients': 'Clients',
    'nav.maintenance': 'Maintenance',
    'nav.reports': 'Reports',
    'nav.planning': 'Planning',
    'common.search': 'Search...',
    'dashboard.title': 'Network Way Dashboard',
    'dashboard.welcome': 'Welcome to your fiber optic network management system',
    'dashboard.networkOverview': 'Network Overview',
    'dashboard.quickAccess': 'Quick Access to Modules',
    'dashboard.geographicOverview': 'Cameroon Geographic Overview',
    'dashboard.kpi': 'Key Performance Indicators',
    'dashboard.realTimeCharts': 'Real-Time Charts',
    'dashboard.notifications': 'Notifications and Alerts',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.totalClients': 'Total Clients',
    'dashboard.activeConnections': 'Active Connections',
    'dashboard.networkUptime': 'Network Uptime',
    'dashboard.pendingTickets': 'Pending Tickets',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.performanceMetrics': 'Performance Metrics',
    'network.title': 'Network Management',
    'network.addElement': 'Add Element',
    'assets.title': 'Asset Inventory',
    'assets.addAsset': 'Add Asset',
    'assets.totalValue': 'Total Value',
    'clients.title': 'Client Management',
    'clients.addClient': 'Add Client',
    'maintenance.title': 'Maintenance',
    'maintenance.addTicket': 'Create Ticket',
    'reports.title': 'Reports',
    'reports.generate': 'Generate Report',
    'planning.title': 'Network Planning',
    'planning.addProject': 'New Project',
    'common.export': 'Export',
    'common.import': 'Import',
    'network.interactiveMap': 'Interactive Map',
    'network.layers': 'Layers',
    'network.allElements': 'All elements',
    'network.cables': 'Cables',
    'network.equipment': 'Equipment',
    'network.clientPoints': 'Client points',
    'network.poles': 'Poles',
    'network.chambers': 'Chambers',
    'network.status.active': 'Active',
    'network.status.maintenance': 'Maintenance',
    'network.status.fault': 'Fault',
    'network.status.inactive': 'Inactive',
    'network.region': 'Region',
    'network.department': 'Department',
    'network.commune': 'Commune',
    'network.coordinates': 'Coordinates',
    'network.properties': 'Properties',
    'network.selectElement': 'Select an element on the map',
    'network.totalCables': 'Total Cables',
    'network.totalEquipment': 'Equipment',
    'network.totalClients': 'Client Points',
    'network.coverage': 'Coverage',
    'art.compliance': 'ART Compliance',
    'art.generateReport': 'Generate ART Report',
    'art.quarterlyReport': 'Quarterly Report',
    'art.networkAvailability': 'Network Availability',
    'art.averageLatency': 'Average Latency',
    'art.throughput': 'Throughput',
    'art.clientSatisfaction': 'Client Satisfaction',
    'art.incidentCount': 'Incident Count',
    'art.resolutionTime': 'Resolution Time',
    'art.complianceScore': 'Compliance Score',
    'maintenance.preventive': 'Preventive',
    'maintenance.corrective': 'Corrective',
    'maintenance.emergency': 'Emergency',
    'maintenance.workLog': 'Work Log',
    'maintenance.affectedClients': 'Affected Clients',
    'maintenance.estimatedTime': 'Estimated Time',
    'maintenance.actualTime': 'Actual Time',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};