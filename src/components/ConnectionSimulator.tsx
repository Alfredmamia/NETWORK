import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ConnectionMapEditor from './ConnectionMapEditor';
import { NetworkElement, Client } from '../types';
import { networkService } from '../services/networkService';
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Route,
  Calculator,
  Zap,
  Settings,
  Users,
  Cable,
  Target,
  Navigation,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface ConnectionPath {
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

const ConnectionSimulator: React.FC = () => {
  const { t } = useLanguage();
  const [connections, setConnections] = useState<ConnectionPath[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionPath | null>(null);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnections();
    initializeDemoData();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      // Charger les connexions depuis le localStorage ou service
      const savedConnections = localStorage.getItem('connectionPaths');
      if (savedConnections) {
        const parsed = JSON.parse(savedConnections).map((conn: any) => ({
          ...conn,
          createdAt: new Date(conn.createdAt)
        }));
        setConnections(parsed);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des connexions:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDemoData = () => {
    const demoConnections: ConnectionPath[] = [
      {
        id: 'CONN-001',
        clientId: 'CL-001',
        clientName: 'Jean Mballa - Résidentiel',
        clientLocation: { lat: 4.0611, lng: 9.7579 },
        startPoint: {
          id: 'CO-DOUALA-01',
          name: 'Central Office Bonanjo',
          type: 'central_office',
          location: { lat: 4.0511, lng: 9.7679 }
        },
        path: [
          { lat: 4.0511, lng: 9.7679, elementType: 'central_office', elementId: 'CO-DOUALA-01' },
          { lat: 4.0561, lng: 9.7629 },
          { lat: 4.0611, lng: 9.7579, elementType: 'client_equipment', elementId: 'CL-001' }
        ],
        distance: 1250,
        estimatedCost: 875000,
        fiberCount: 1,
        installationType: 'aerial',
        status: 'simulated',
        createdAt: new Date('2024-01-15'),
        lastMileElements: []
      },
      {
        id: 'CONN-002',
        clientId: 'CL-002',
        clientName: 'CAMTECH SARL - Entreprise',
        clientLocation: { lat: 4.0711, lng: 9.7479 },
        startPoint: {
          id: 'SPL-MAKEPE-01',
          name: 'Manchon Optique Makepe',
          type: 'optical_splice',
          location: { lat: 4.0661, lng: 9.7529 }
        },
        path: [
          { lat: 4.0661, lng: 9.7529, elementType: 'optical_splice', elementId: 'SPL-MAKEPE-01' },
          { lat: 4.0686, lng: 9.7504 },
          { lat: 4.0711, lng: 9.7479, elementType: 'client_equipment', elementId: 'CL-002' }
        ],
        distance: 650,
        estimatedCost: 455000,
        fiberCount: 2,
        installationType: 'underground',
        status: 'approved',
        createdAt: new Date('2024-01-10'),
        lastMileElements: []
      }
    ];

    if (connections.length === 0) {
      setConnections(demoConnections);
      localStorage.setItem('connectionPaths', JSON.stringify(demoConnections));
    }
  };

  const handleMapSave = async (connectionData: Omit<ConnectionPath, 'id' | 'createdAt'>) => {
    try {
      const newConnection: ConnectionPath = {
        ...connectionData,
        id: `CONN-${Date.now()}`,
        createdAt: new Date()
      };

      const updatedConnections = [...connections, newConnection];
      setConnections(updatedConnections);
      localStorage.setItem('connectionPaths', JSON.stringify(updatedConnections));

      // Sauvegarder les éléments last mile dans le réseau
      for (const element of connectionData.lastMileElements) {
        await networkService.addNetworkElement(element);
      }

      setShowMapEditor(false);
      alert('Simulation de raccordement sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la simulation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'simulated':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'simulated':
        return Calculator;
      case 'approved':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      case 'completed':
        return CheckCircle;
      default:
        return Activity;
    }
  };

  const getStartPointIcon = (type: string) => {
    switch (type) {
      case 'central_office':
        return Settings;
      case 'optical_splice':
        return Zap;
      case 'junction_box':
        return Target;
      default:
        return MapPin;
    }
  };

  const filteredConnections = connections.filter((connection) => {
    const matchesSearch = connection.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.startPoint.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || connection.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalSimulations = connections.length;
  const totalDistance = connections.reduce((sum, conn) => sum + conn.distance, 0);
  const totalCost = connections.reduce((sum, conn) => sum + conn.estimatedCost, 0);
  const approvedConnections = connections.filter(conn => conn.status === 'approved').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simulateur de Raccordement</h1>
          <p className="mt-1 text-sm text-gray-500">
            Simulation et planification des raccordements last mile avec calcul d'itinéraires optimaux
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Importer Clients
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Exporter Simulations
          </button>
          <button
            onClick={() => setShowMapEditor(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Simulation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Simulations Totales</p>
              <p className="text-2xl font-semibold text-gray-900">{totalSimulations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approuvées</p>
              <p className="text-2xl font-semibold text-gray-900">{approvedConnections}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Distance Totale</p>
              <p className="text-2xl font-semibold text-gray-900">{(totalDistance / 1000).toFixed(2)} km</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Coût Estimé</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalCost).replace('XAF', '').trim()}M
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Simulateur de Raccordement Last Mile</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-green-100 text-sm">Points de Départ Disponibles</p>
                <p className="text-xl font-bold text-white">Central Office • Manchons • Boîtiers</p>
              </div>
              <div>
                <p className="text-green-100 text-sm">Calcul Automatique</p>
                <p className="text-xl font-bold text-white">Distance • Coût • Faisabilité</p>
              </div>
              <div>
                <p className="text-green-100 text-sm">Types d'Installation</p>
                <p className="text-xl font-bold text-white">Aérien • Souterrain • Mixte</p>
              </div>
            </div>
          </div>
          <div className="text-green-100">
            <Route className="h-16 w-16" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Rechercher une simulation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="simulated">Simulé</option>
              <option value="approved">Approuvé</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </button>
        </div>
      </div>

      {/* Connections List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredConnections.map((connection) => {
            const StatusIcon = getStatusIcon(connection.status);
            const StartPointIcon = getStartPointIcon(connection.startPoint.type);
            
            return (
              <li key={connection.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <StatusIcon className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{connection.clientName}</p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                            {connection.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <StartPointIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          Depuis: {connection.startPoint.name}
                          <span className="mx-2">•</span>
                          <Route className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {(connection.distance / 1000).toFixed(2)} km
                          <span className="mx-2">•</span>
                          <Cable className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {connection.fiberCount} fibre(s)
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span className="capitalize">{connection.installationType}</span>
                          <span className="mx-2">•</span>
                          Créé le {connection.createdAt.toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(connection.estimatedCost)}
                        </p>
                        <p className="text-sm text-gray-500">#{connection.id}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setSelectedConnection(connection)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Connection Map Editor */}
      {showMapEditor && (
        <ConnectionMapEditor
          onSave={handleMapSave}
          onCancel={() => setShowMapEditor(false)}
          existingConnections={connections}
        />
      )}
    </div>
  );
};

export default ConnectionSimulator;