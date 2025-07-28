import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { spliceService } from '../services/spliceService';
import { OpticalSplice, networkTypeConfig, spliceTypeConfig, asianFiberColors } from '../types/splice';
import SpliceMapEditor from './SpliceMapEditor';
import SpliceDetails from './SpliceDetails';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Zap,
  Cable,
  MapPin,
  Settings,
  Eye,
  Edit,
  Trash2,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

const SpliceManagement: React.FC = () => {
  const { t } = useLanguage();
  const [splices, setSplices] = useState<OpticalSplice[]>([]);
  const [selectedSplice, setSelectedSplice] = useState<OpticalSplice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNetworkType, setSelectedNetworkType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSplices();
  }, []);

  const loadSplices = async () => {
    try {
      setLoading(true);
      const spliceList = await spliceService.getSplices({
        networkType: selectedNetworkType,
        status: selectedStatus
      });
      setSplices(spliceList);
    } catch (error) {
      console.error('Erreur lors du chargement des manchons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSplices();
  }, [selectedNetworkType, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'fault':
        return 'bg-red-100 text-red-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'maintenance':
        return Settings;
      case 'fault':
        return AlertTriangle;
      case 'planned':
        return Clock;
      default:
        return Activity;
    }
  };

  const getNetworkTypeColor = (networkType: string) => {
    return networkTypeConfig[networkType as keyof typeof networkTypeConfig]?.color || '#6B7280';
  };

  const getNetworkTypeLabel = (networkType: string) => {
    return networkTypeConfig[networkType as keyof typeof networkTypeConfig]?.label || networkType;
  };

  const getSpliceTypeIcon = (type: string) => {
    return spliceTypeConfig[type as keyof typeof spliceTypeConfig]?.icon || '⚡';
  };

  const filteredSplices = splices.filter((splice) => {
    const matchesSearch = splice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         splice.location.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSpliceSelect = (splice: OpticalSplice) => {
    setSelectedSplice(splice);
    setShowDetails(true);
  };

  const handleMapSave = async (spliceData: any) => {
    try {
      await spliceService.createSplice(spliceData);
      await loadSplices();
      setShowMapEditor(false);
    } catch (error) {
      console.error('Erreur lors de la création du manchon:', error);
    }
  };

  const CreateSpliceModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      location: { lat: 0, lng: 0, name: '' },
      type: 'underground' as const,
      networkType: 'ftth_gpon' as const,
      technician: '',
      inputCableId: '',
      inputCableName: '',
      inputCapacity: 24,
      outputCableId: '',
      outputCableName: '',
      outputCapacity: 24,
      materialReference: '',
      notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const inputCable = spliceService.generateCableConnection(
          formData.inputCableId || `CBL-IN-${Date.now()}`,
          formData.inputCableName,
          formData.inputCapacity,
          formData.networkType
        );

        const outputCable = spliceService.generateCableConnection(
          formData.outputCableId || `CBL-OUT-${Date.now()}`,
          formData.outputCableName,
          formData.outputCapacity,
          formData.networkType
        );

        await spliceService.createSplice({
          ...formData,
          installDate: new Date(),
          status: 'planned',
          inputCable,
          outputCable,
          photos: [],
          region: 'Littoral', // À améliorer avec sélecteur
          department: 'Wouri',
          commune: 'Douala 1er'
        });
        
        await loadSplices();
        setShowCreateModal(false);
      } catch (error) {
        console.error('Erreur lors de la création du manchon:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Nouveau Manchon Optique</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du manchon</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="ex: Manchon Distribution Makepe Nord"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type de réseau</label>
                <select
                  value={formData.networkType}
                  onChange={(e) => setFormData({ ...formData, networkType: e.target.value as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {Object.entries(networkTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Type de manchon</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {Object.entries(spliceTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Câble d'entrée */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Câble d'Entrée</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du câble</label>
                  <input
                    type="text"
                    required
                    value={formData.inputCableName}
                    onChange={(e) => setFormData({ ...formData, inputCableName: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="ex: Câble Feeder Principal 48F"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacité (fibres)</label>
                  <select
                    value={formData.inputCapacity}
                    onChange={(e) => setFormData({ ...formData, inputCapacity: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {[4, 6, 8, 12, 24, 48, 72, 96, 144, 288, 576].map((capacity) => (
                      <option key={capacity} value={capacity}>{capacity} fibres</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Câble de sortie */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Câble de Sortie</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du câble</label>
                  <input
                    type="text"
                    required
                    value={formData.outputCableName}
                    onChange={(e) => setFormData({ ...formData, outputCableName: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="ex: Câble Distribution Zone A 24F"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacité (fibres)</label>
                  <select
                    value={formData.outputCapacity}
                    onChange={(e) => setFormData({ ...formData, outputCapacity: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {[4, 6, 8, 12, 24, 48, 72, 96, 144, 288, 576].map((capacity) => (
                      <option key={capacity} value={capacity}>{capacity} fibres</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Technicien</label>
                <input
                  type="text"
                  required
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Nom du technicien"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Référence matériel</label>
                <input
                  type="text"
                  value={formData.materialReference}
                  onChange={(e) => setFormData({ ...formData, materialReference: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Référence du manchon"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Notes et observations"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Créer le manchon
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (showDetails && selectedSplice) {
    return (
      <SpliceDetails 
        spliceId={selectedSplice.id} 
        onBack={() => {
          setShowDetails(false);
          setSelectedSplice(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestionnaire des Manchons Optiques</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion avancée des manchons avec raccordements fibre par fibre selon le code couleur asiatique
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Manchon
          </button>
          <button
            onClick={() => setShowMapEditor(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Éditeur Cartographique
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Manchons Totaux</p>
              <p className="text-2xl font-semibold text-gray-900">{splices.length}</p>
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
              <p className="text-sm font-medium text-gray-500">Actifs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {splices.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En Panne</p>
              <p className="text-2xl font-semibold text-gray-900">
                {splices.filter(s => s.status === 'fault').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <Cable className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Connexions Totales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {splices.reduce((total, splice) => total + splice.fiberMapping.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Couleur Asiatique */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Code Couleur Asiatique (IEC 60304) - Raccordements Fibre</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {asianFiberColors.map((color) => (
            <div key={color.id} className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{color.id}. {color.color}</p>
                <p className="text-xs text-gray-500">{color.english}</p>
              </div>
            </div>
          ))}
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
                placeholder="Rechercher un manchon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={selectedNetworkType}
              onChange={(e) => setSelectedNetworkType(e.target.value)}
            >
              <option value="all">Tous les réseaux</option>
              {Object.entries(networkTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="maintenance">Maintenance</option>
              <option value="fault">En panne</option>
              <option value="planned">Planifié</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </button>
        </div>
      </div>

      {/* Splices List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredSplices.map((splice) => {
            const StatusIcon = getStatusIcon(splice.status);
            const utilizationRate = splice.fiberMapping.length / Math.min(splice.inputCable.capacity, splice.outputCable.capacity) * 100;
            
            return (
              <li key={splice.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                          style={{ backgroundColor: getNetworkTypeColor(splice.networkType) }}
                        >
                          {getSpliceTypeIcon(splice.type)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{splice.name}</p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(splice.status)}`}>
                            {splice.status}
                          </span>
                          <span 
                            className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getNetworkTypeColor(splice.networkType) }}
                          >
                            {getNetworkTypeLabel(splice.networkType)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {splice.location.name}
                          <span className="mx-2">•</span>
                          <Cable className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {splice.inputCable.capacity}F → {splice.outputCable.capacity}F
                          <span className="mx-2">•</span>
                          Installé le {splice.installDate.toLocaleDateString('fr-FR')}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span className="font-medium">Entrée:</span>
                          <span className="ml-1">{splice.inputCable.cableName}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium">Sortie:</span>
                          <span className="ml-1">{splice.outputCable.cableName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Utilisation: {utilizationRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-500">
                          {splice.fiberMapping.length} connexions
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleSpliceSelect(splice)}
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
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Utilisation des connexions</span>
                      <span className="text-gray-900 font-medium">{utilizationRate.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${utilizationRate}%`,
                          backgroundColor: getNetworkTypeColor(splice.networkType)
                        }}
                      />
                    </div>
                  </div>

                  {/* Cable Connection Preview */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Câble d'Entrée</h4>
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: splice.inputCable.color }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{splice.inputCable.cableName}</p>
                          <p className="text-xs text-gray-500">{splice.inputCable.capacity} fibres</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Câble de Sortie</h4>
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: splice.outputCable.color }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{splice.outputCable.cableName}</p>
                          <p className="text-xs text-gray-500">{splice.outputCable.capacity} fibres</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Create Splice Modal */}
      {showCreateModal && <CreateSpliceModal />}
      
      {/* Map Editor */}
      {showMapEditor && (
        <SpliceMapEditor
          onSave={handleMapSave}
          onCancel={() => setShowMapEditor(false)}
          existingSplices={splices}
        />
      )}
    </div>
  );
};

export default SpliceManagement;