import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { fiberService } from '../services/fiberService';
import { FiberSection, Splice, asianFiberColors, serviceTypeConfig } from '../types/fiber';
import FiberMapEditor from './FiberMapEditor';
import {
  Plus,
  Search,
  Filter,
  Cable,
  MapPin,
  Settings,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity
} from 'lucide-react';

const FiberManagement: React.FC = () => {
  const { t } = useLanguage();
  const [sections, setSections] = useState<FiberSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<FiberSection | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const sectionList = await fiberService.getFiberSections();
      setSections(sectionList);
    } catch (error) {
      console.error('Erreur lors du chargement des tronçons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'existing':
        return 'bg-green-100 text-green-800';
      case 'projected':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'existing':
        return CheckCircle;
      case 'projected':
        return Clock;
      case 'maintenance':
        return Settings;
      case 'offline':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const filteredSections = sections.filter((section) => {
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || section.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleMapSave = async (sectionData: any) => {
    try {
      await fiberService.createFiberSection(sectionData);
      await loadSections();
      setShowMapEditor(false);
    } catch (error) {
      console.error('Erreur lors de la création du tronçon:', error);
    }
  };

  const CreateSectionModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      startPoint: { lat: 0, lng: 0, name: '' },
      endPoint: { lat: 0, lng: 0, name: '' },
      length: 0,
      capacity: 24 as const,
      installationType: 'underground' as const,
      installationDate: new Date().toISOString().split('T')[0],
      status: 'projected' as const
    });

    const capacityOptions = [4, 6, 8, 12, 24, 48, 72, 96, 144, 288, 576];

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await fiberService.createFiberSection({
          ...formData,
          installationDate: new Date(formData.installationDate)
        });
        await loadSections();
        setShowCreateModal(false);
      } catch (error) {
        console.error('Erreur lors de la création du tronçon:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Nouveau Tronçon Fibre</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du tronçon</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="ex: Douala-Yaoundé Segment 1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Point de départ</label>
                <input
                  type="text"
                  required
                  value={formData.startPoint.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    startPoint: { ...formData.startPoint, name: e.target.value }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Nom du point de départ"
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.startPoint.lat}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      startPoint: { ...formData.startPoint, lat: parseFloat(e.target.value) }
                    })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Latitude"
                  />
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.startPoint.lng}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      startPoint: { ...formData.startPoint, lng: parseFloat(e.target.value) }
                    })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Longitude"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Point d'arrivée</label>
                <input
                  type="text"
                  required
                  value={formData.endPoint.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    endPoint: { ...formData.endPoint, name: e.target.value }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Nom du point d'arrivée"
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.endPoint.lat}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      endPoint: { ...formData.endPoint, lat: parseFloat(e.target.value) }
                    })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Latitude"
                  />
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.endPoint.lng}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      endPoint: { ...formData.endPoint, lng: parseFloat(e.target.value) }
                    })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Longitude"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Longueur (m)</label>
                <input
                  type="number"
                  required
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacité (fibres)</label>
                <select
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {capacityOptions.map((capacity) => (
                    <option key={capacity} value={capacity}>{capacity} fibres</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Type de pose</label>
                <select
                  value={formData.installationType}
                  onChange={(e) => setFormData({ ...formData, installationType: e.target.value as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="underground">Souterrain</option>
                  <option value="aerial">Aérien</option>
                  <option value="conduit">Conduit</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d'installation</label>
                <input
                  type="date"
                  required
                  value={formData.installationDate}
                  onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="projected">Projeté</option>
                  <option value="existing">Existant</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Hors service</option>
                </select>
              </div>
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
                Créer le tronçon
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Fibres Optiques</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion avancée des tronçons fibre avec code couleur asiatique
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
            Nouveau Tronçon
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
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <Cable className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tronçons Totaux</p>
              <p className="text-2xl font-semibold text-gray-900">{sections.length}</p>
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
              <p className="text-sm font-medium text-gray-500">Existants</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sections.filter(s => s.status === 'existing').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Projetés</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sections.filter(s => s.status === 'projected').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Fibres Totales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sections.reduce((total, section) => total + section.capacity, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Couleur Asiatique */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Code Couleur Asiatique (IEC 60304)</h3>
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
                placeholder="Rechercher un tronçon..."
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
              <option value="existing">Existant</option>
              <option value="projected">Projeté</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Hors service</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredSections.map((section) => {
            const StatusIcon = getStatusIcon(section.status);
            const utilizationRate = section.fibers.filter(f => f.assignedService !== 'free').length / section.capacity * 100;
            
            return (
              <li key={section.id}>
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
                          <p className="text-sm font-medium text-gray-900">{section.name}</p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(section.status)}`}>
                            {section.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {section.startPoint.name} → {section.endPoint.name}
                          <span className="mx-2">•</span>
                          {(section.length / 1000).toFixed(2)} km
                          <span className="mx-2">•</span>
                          {section.capacity} fibres
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Utilisation: {utilizationRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {section.installationType}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setSelectedSection(section)}
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
                      <span className="text-gray-500">Utilisation des fibres</span>
                      <span className="text-gray-900 font-medium">{utilizationRate.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${utilizationRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Create Section Modal */}
      {showCreateModal && <CreateSectionModal />}
      
      {/* Map Editor */}
      {showMapEditor && (
        <FiberMapEditor
          onSave={handleMapSave}
          onCancel={() => setShowMapEditor(false)}
          existingSections={sections}
        />
      )}
    </div>
  );
};

export default FiberManagement;